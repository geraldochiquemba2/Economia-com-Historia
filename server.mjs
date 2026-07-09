import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { Resend } from 'resend';
import Groq from 'groq-sdk';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Multer em memória (sem guardar no disco — vai direto para o Telegram)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Helper: enviar ficheiro para o Telegram e devolver file_id
async function uploadToTelegram(buffer, filename, mimetype) {
  const { FormData, Blob } = await import('node:buffer').then(() => import('undici').catch(() => null)) || {};
  
  // Usar o FormData nativo do Node 18+
  const form = new (await import('node:stream').then(() => {
    const { Readable } = require('stream');
    return null;
  }).catch(() => null) || (class NativeForm {}))();

  // Determinar método do Telegram com base no mime type (usamos sempre sendDocument para preservar a qualidade)
  let tgMethod = 'sendDocument';
  if (mimetype.startsWith('video/')) tgMethod = 'sendVideo';
  else if (mimetype.startsWith('audio/')) tgMethod = 'sendAudio';

  // Montar FormData manualmente com boundaries
  const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);
  const CRLF = '\r\n';

  const fieldPart = [
    `--${boundary}`,
    `Content-Disposition: form-data; name="chat_id"`,
    '',
    TELEGRAM_CHAT_ID,
  ].join(CRLF);

  const filePart = [
    `--${boundary}`,
    `Content-Disposition: form-data; name="${tgMethod === 'sendPhoto' ? 'photo' : tgMethod === 'sendVideo' ? 'video' : tgMethod === 'sendAudio' ? 'audio' : 'document'}"; filename="${filename}"`,
    `Content-Type: ${mimetype}`,
    '',
    '',
  ].join(CRLF);

  const endPart = `${CRLF}--${boundary}--`;

  const bodyParts = [
    Buffer.from(fieldPart + CRLF),
    Buffer.from(filePart),
    buffer,
    Buffer.from(endPart),
  ];
  const bodyBuffer = Buffer.concat(bodyParts);

  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${tgMethod}`, {
    method: 'POST',
    headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
    body: bodyBuffer,
  });

  const data = await response.json();
  if (!data.ok) throw new Error(`Telegram error: ${data.description}`);

  // Extrair file_id
  const msg = data.result;
  let fileId;
  if (msg.photo) fileId = msg.photo[msg.photo.length - 1].file_id;
  else if (msg.video) fileId = msg.video.file_id;
  else if (msg.audio) fileId = msg.audio.file_id;
  else if (msg.document) fileId = msg.document.file_id;
  
  if (!fileId) throw new Error('Não foi possível obter file_id do Telegram');
  return fileId;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Email via Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function sendEmail({ to, subject, html }) {
  if (!resend) {
    console.log('[Email] RESEND_API_KEY não configurado. Email não enviado.');
    return null;
  }
  const { data, error } = await resend.emails.send({
    from: 'EconomiaJA <onboarding@resend.dev>',
    to,
    subject,
    html,
  });
  if (error) throw new Error(error.message);
  return data;
}

function generateRandomPassword(length = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let pass = '';
  for (let i = 0; i < length; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
  return pass;
}

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Não autorizado. Faça login novamente.' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
    }
    return res.status(401).json({ error: 'Token inválido. Faça login novamente.' });
  }
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acesso negado' });
    next();
  });
}

// Função para garantir que a BD tem as tabelas corretas (Auto-Migrate)
async function initDB() {
  try {
    // 1. Garantir que a coluna profession existe na tabela User
    await pool.query(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "profession" VARCHAR(255) DEFAULT 'Estudante';
    `);

    // 1b. Colunas de bloqueio
    await pool.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "blocked" BOOLEAN DEFAULT FALSE;`);
    await pool.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "blockReason" TEXT;`);

    // 2. Garantir que a tabela Content existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Content" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "type" VARCHAR(255) NOT NULL,
        "title" VARCHAR(255) NOT NULL,
        "description" TEXT NOT NULL,
        "thumbnail" VARCHAR(255) NOT NULL,
        "fullText" TEXT NOT NULL,
        "videoUrl" VARCHAR(255),
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    // 2b. Garantir que as colunas featured, recommended, likes e dislikes existem
    await pool.query(`
      ALTER TABLE "Content" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN DEFAULT FALSE;
    `);
    await pool.query(`
      ALTER TABLE "Content" ADD COLUMN IF NOT EXISTS "recommended" BOOLEAN DEFAULT FALSE;
    `);
    await pool.query(`ALTER TABLE "Content" ADD COLUMN IF NOT EXISTS "likes" TEXT[] DEFAULT '{}';`);
    await pool.query(`ALTER TABLE "Content" ADD COLUMN IF NOT EXISTS "dislikes" TEXT[] DEFAULT '{}';`);
    await pool.query(`ALTER TABLE "Content" ADD COLUMN IF NOT EXISTS "author" VARCHAR(255) DEFAULT 'Autor Desconhecido';`);
    await pool.query(`ALTER TABLE "Content" ADD COLUMN IF NOT EXISTS "status" VARCHAR(20) DEFAULT 'approved';`);
    await pool.query(`ALTER TABLE "Content" ADD COLUMN IF NOT EXISTS "authorId" UUID;`);
    await pool.query(`ALTER TABLE "Content" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;`);
    // Garantir que conteúdos antigos sem status ficam como approved
    await pool.query(`UPDATE "Content" SET "status" = 'approved' WHERE "status" IS NULL;`);

    // 3. Garantir que a coluna avatar e xp existem na tabela User
    await pool.query(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatar" VARCHAR(512);
    `);
    await pool.query(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "xp" INTEGER DEFAULT 0;
    `);
    await pool.query(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastActiveDate" DATE;
    `);
    await pool.query(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "streak" INTEGER DEFAULT 0;
    `);

    // 4. Criar tabela de perguntas do Quiz
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "QuizQuestion" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "question" TEXT NOT NULL,
        "options" JSONB NOT NULL,
        "correctAnswer" INTEGER NOT NULL,
        "feedback" TEXT NOT NULL,
        "points" INTEGER DEFAULT 10,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // 5. Criar tabela de Trivia (Curiosidades)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Trivia" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" VARCHAR(255) NOT NULL,
        "fact" TEXT NOT NULL,
        "imageUrl" VARCHAR(512),
        "isActive" BOOLEAN DEFAULT FALSE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // 4. Criar tabela de Comentários
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Comment" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "contentId" VARCHAR(512) NOT NULL,
        "userId" UUID REFERENCES "User"(id) ON DELETE SET NULL,
        "author" VARCHAR(255) NOT NULL,
        "avatar" VARCHAR(512),
        "text" TEXT NOT NULL,
        "parentId" UUID REFERENCES "Comment"(id) ON DELETE CASCADE,
        "isDeleted" BOOLEAN DEFAULT FALSE,
        "isHidden" BOOLEAN DEFAULT FALSE,
        "moderatorNote" TEXT,
        "editedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    // 4b. Garantir colunas de moderação existem (para tabelas antigas)
    await pool.query(`ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN DEFAULT FALSE;`);
    await pool.query(`ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "isHidden" BOOLEAN DEFAULT FALSE;`);
    await pool.query(`ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "moderatorNote" TEXT;`);
    await pool.query(`ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "editedAt" TIMESTAMP;`);
    await pool.query(`ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "likes" TEXT[] DEFAULT '{}';`);
    await pool.query(`ALTER TABLE "Comment" ADD COLUMN IF NOT EXISTS "dislikes" TEXT[] DEFAULT '{}';`);
    // 4c. Garantir que o timestamp tem fuso horário para evitar bugs no navegador (-1 hora)
    await pool.query(`ALTER TABLE "Comment" ALTER COLUMN "createdAt" TYPE TIMESTAMPTZ USING "createdAt" AT TIME ZONE 'UTC';`);

    // 5. Tabela de Estudos Concluídos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "CompletedStudy" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID REFERENCES "User"(id) ON DELETE CASCADE,
        "contentId" VARCHAR(512) NOT NULL,
        "completedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE("userId", "contentId")
      );
    `);

    // 6. Criar tabela de Estudos Concluídos (Progresso)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "CompletedStudy" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID REFERENCES "User"(id) ON DELETE CASCADE,
        "contentId" VARCHAR(512) NOT NULL,
        "completedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE("userId", "contentId")
      );
    `);

    // 7. Criar tabela de Conteúdos Guardados (Favoritos)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "SavedContent" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID REFERENCES "User"(id) ON DELETE CASCADE,
        "contentId" VARCHAR(512) NOT NULL,
        "savedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE("userId", "contentId")
      );
    `);

    // 8. Tabela de pedidos de Elite
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "EliteRequest" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID REFERENCES "User"(id) ON DELETE CASCADE,
        "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
        "requestedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "reviewedAt" TIMESTAMPTZ,
        UNIQUE("userId")
      );
    `);
    // 8b. Adicionar coluna de motivo de rejeição
    await pool.query(`ALTER TABLE "EliteRequest" ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;`);

    // 9. Tabela de Notificações
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Notification" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID REFERENCES "User"(id) ON DELETE CASCADE,
        "actorName" VARCHAR(255) NOT NULL,
        "type" VARCHAR(50) NOT NULL,
        "contentId" VARCHAR(512),
        "commentId" UUID,
        "isRead" BOOLEAN DEFAULT FALSE,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS "Category" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR(100) NOT NULL,
        "icon" VARCHAR(100) NOT NULL DEFAULT 'Folder',
        "color" VARCHAR(20) DEFAULT '#E8B4B8',
        "sortOrder" INTEGER DEFAULT 0,
        "hidden" BOOLEAN DEFAULT FALSE,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Add hidden column if not exists
    await pool.query(`ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "hidden" BOOLEAN DEFAULT FALSE`);

    // 10. Tabela de pedidos de redefinição de senha
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "PasswordReset" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID REFERENCES "User"(id) ON DELETE CASCADE,
        "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
        "newPassword" VARCHAR(255),
        "requestedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "resetAt" TIMESTAMPTZ,
        "sentAt" TIMESTAMPTZ
      );
    `);

    // 11. Coluna mustChangePassword na tabela User
    await pool.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mustChangePassword" BOOLEAN DEFAULT FALSE;`);

    // 12. Tabela de Análises de Comentários (IA)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "CommentAnalysis" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "analysisData" JSONB NOT NULL,
        "summary" TEXT,
        "totalAbusivos" INTEGER DEFAULT 0,
        "totalSuspeitos" INTEGER DEFAULT 0,
        "totalAnalisados" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Seed default categories if empty
    const { rows: catCount } = await pool.query('SELECT COUNT(*) as count FROM "Category"');
    if (parseInt(catCount[0].count) === 0) {
      await pool.query(`
        INSERT INTO "Category" (name, icon, color, "sortOrder") VALUES
        ('Textos', 'FileText', '#E8B4B8', 1),
        ('Vídeos', 'Play', '#3A0310', 2),
        ('Áudios', 'Mic', '#E8B4B8', 3),
        ('Jindungo', 'Flame', '#ff6b35', 4)
      `);
    }

    console.log('[DB] Base de Dados sincronizada com sucesso.');
  } catch (err) {
    console.error('[DB] Erro ao sincronizar Base de Dados:', err);
  }
}
initDB();

// Rota para upload de ficheiros → Telegram Cloud Storage
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum ficheiro enviado' });
  }
  try {
    const fileId = await uploadToTelegram(req.file.buffer, req.file.originalname, req.file.mimetype);
    // Retornar URL proxy que o nosso servidor vai servir
    const fileUrl = `/api/media/${fileId}`;
    res.json({ url: fileUrl });
  } catch (err) {
    console.error('[Telegram Upload Error]', err);
    res.status(500).json({ error: err.message || 'Erro ao enviar para o Telegram' });
  }
});

// Rota para buscar capa de Spotify via oEmbed
app.get('/api/spotify-oembed', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL é obrigatória' });
  try {
    const response = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`);
    if (!response.ok) return res.json({ thumbnail: null });
    const data = await response.json();
    res.json({ thumbnail: data.thumbnail_url || null });
  } catch (err) {
    res.json({ thumbnail: null });
  }
});

// Rota para buscar imagem OG de qualquer link (para capas de podcasts/áudio)
app.get('/api/og-image', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'URL é obrigatória' });

  // Se for URL do Spotify, usar oEmbed primeiro
  if (/open\.spotify\.com/i.test(url)) {
    try {
      const oembedRes = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`);
      if (oembedRes.ok) {
        const oembedData = await oembedRes.json();
        if (oembedData.thumbnail_url) return res.json({ thumbnail: oembedData.thumbnail_url });
      }
    } catch {}
  }

  // Para outras URLs, usar OG meta tags
  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await response.text();
    const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    if (ogMatch) {
      return res.json({ thumbnail: ogMatch[1] });
    }
    const twitterMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);
    if (twitterMatch) {
      return res.json({ thumbnail: twitterMatch[1] });
    }
    res.json({ thumbnail: null });
  } catch (err) {
    res.json({ thumbnail: null });
  }
});

// Rota proxy para servir ficheiros guardados no Telegram
app.get('/api/media/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    // Pedir ao Telegram o link temporário do ficheiro
    const infoRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`);
    const info = await infoRes.json();
    if (!info.ok) return res.status(404).json({ error: 'Ficheiro não encontrado' });

    const filePath = info.result.file_path;
    const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;
    
    // Fazer proxy do ficheiro
    const fileRes = await fetch(fileUrl);
    if (!fileRes.ok) return res.status(502).json({ error: 'Erro ao buscar ficheiro do Telegram' });

    res.setHeader('Content-Type', fileRes.headers.get('content-type') || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    const { Readable } = await import('stream');
    Readable.fromWeb(fileRes.body).pipe(res);
  } catch (err) {
    console.error('[Telegram Media Error]', err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Cadastro (Register)
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, profession } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
    if (rows.length > 0) return res.status(400).json({ error: 'Email já existe' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    // Profissão por defeito caso não seja enviada
    const userProfession = profession || 'Estudante';

    const result = await pool.query(
      'INSERT INTO "User" (name, email, password_hash, role, profession) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, profession',
      [name, email, hash, 'student', userProfession]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role, profession: user.profession }, JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM "User" WHERE email = $1', [email]);
    if (rows.length === 0) return res.status(400).json({ error: 'Usuário não encontrado' });

    const user = rows[0];

    // Verificar se o utilizador está bloqueado
    if (user.blocked) {
      return res.status(403).json({ error: 'Conta bloqueada', blocked: true, blockReason: user.blockReason || 'Motivo não especificado.' });
    }
    const { rows: pendingResets } = await pool.query(
      `SELECT * FROM "PasswordReset" WHERE "userId" = $1 AND status = 'pending' ORDER BY "requestedAt" DESC LIMIT 1`,
      [user.id]
    );

    // Verificar se há redefinição já processada (admin clicou reset mas user ainda não fez login com nova senha)
    const { rows: readyResets } = await pool.query(
      `SELECT * FROM "PasswordReset" WHERE "userId" = $1 AND status = 'sent' ORDER BY "resetAt" DESC LIMIT 1`,
      [user.id]
    );

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      if (pendingResets.length > 0) {
        return res.status(400).json({ error: 'A sua senha será resetada em breve e receberá no seu email' });
      }
      if (readyResets.length > 0) {
        return res.status(400).json({ error: 'Verifique o seu email, lá consta a sua nova senha' });
      }
      return res.status(400).json({ error: 'Senha incorreta' });
    }

    // Se tem mustChangePassword, devolver flag
    if (user.mustChangePassword) {
      const token = jwt.sign({ id: user.id, role: user.role, mustChangePassword: true }, JWT_SECRET, { expiresIn: '1h' });
      return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar || null, mustChangePassword: true } });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar || null } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Pedir redefinição de senha (utilizador)
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const { rows } = await pool.query('SELECT id, name FROM "User" WHERE email = $1', [email]);
    if (rows.length === 0) return res.status(400).json({ error: 'Email não encontrado' });

    const user = rows[0];

    // Verificar se já existe pedido pendente
    const { rows: existing } = await pool.query(
      `SELECT id FROM "PasswordReset" WHERE "userId" = $1 AND status = 'pending'`,
      [user.id]
    );
    if (existing.length > 0) {
      return res.json({ message: 'Já existe um pedido de redefinição em curso. Aguarde o administrador.' });
    }

    // Criar pedido
    await pool.query(
      `INSERT INTO "PasswordReset" ("userId", status) VALUES ($1, 'pending')`,
      [user.id]
    );

    res.json({ message: 'Pedido enviado. O administrador irá processar o seu pedido e receberá a nova senha por email.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// Listar pedidos de redefinição pendentes (admin)
app.get('/api/admin/password-resets', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT pr.*, u.name, u.email, u.avatar
      FROM "PasswordReset" pr
      JOIN "User" u ON pr."userId" = u.id
      ORDER BY pr."requestedAt" DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar pedidos' });
  }
});

// Admin: processar redefinição de senha
app.post('/api/admin/password-resets/:id/reset', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT pr.*, u.email, u.name FROM "PasswordReset" pr JOIN "User" u ON pr."userId" = u.id WHERE pr.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Pedido não encontrado' });

    const reset = rows[0];
    if (reset.status !== 'pending') return res.status(400).json({ error: 'Este pedido já foi processado' });

    // Gerar nova senha aleatória
    const newPassword = generateRandomPassword(12);
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    // Atualizar senha do utilizador e marcar mustChangePassword
    await pool.query(
      `UPDATE "User" SET password_hash = $1, "mustChangePassword" = TRUE WHERE id = $2`,
      [hash, reset.userId]
    );

    // Atualizar pedido
    await pool.query(
      `UPDATE "PasswordReset" SET status = 'sent', "newPassword" = $1, "resetAt" = NOW() WHERE id = $2`,
      [newPassword, req.params.id]
    );

    // Enviar email com a nova senha
    try {
      const info = await sendEmail({
        to: reset.email,
        subject: 'Nova Senha - EconomiaJA',
        html: `
          <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;">
            <h2 style="color:#3A0310;">Olá, ${reset.name}!</h2>
            <p>A sua senha foi redefinida pelo administrador.</p>
            <div style="background:#f5f5f5;border:2px dashed #3A0310;border-radius:12px;padding:20px;text-align:center;margin:20px 0;">
              <p style="margin:0 0 8px;color:#666;font-size:12px;">A SUA NOVA SENHA:</p>
              <p style="margin:0;font-size:24px;font-weight:bold;color:#3A0310;letter-spacing:2px;">${newPassword}</p>
            </div>
            <p><strong>Importante:</strong> Após fazer login, será solicitado que crie uma nova senha de sua preferência.</p>
            <p style="color:#999;font-size:11px;margin-top:30px;">Se não solicitou esta redefinição, ignore este email.</p>
          </div>
        `,
      });
      console.log('[Email] Email enviado:', info?.id);
      await pool.query(`UPDATE "PasswordReset" SET "sentAt" = NOW() WHERE id = $1`, [req.params.id]);
    } catch (emailErr) {
      console.error('[Email] Erro ao enviar:', emailErr.message);
    }

    res.json({ message: 'Senha redefinida com sucesso.', newPassword, userName: reset.name, userEmail: reset.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao processar redefinição' });
  }
});

// Utilizador: alterar senha (após reset forçado)
app.post('/api/auth/change-password', requireAuth, async (req, res) => {
  const { newPassword } = req.body;
  try {
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres' });
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    await pool.query(
      `UPDATE "User" SET password_hash = $1, "mustChangePassword" = FALSE WHERE id = $2`,
      [hash, req.user.id]
    );
    // Marcar pedido como concluído (senha já foi redefinida pelo utilizador)
    await pool.query(`UPDATE "PasswordReset" SET status = 'completed' WHERE "userId" = $1 AND status = 'sent'`, [req.user.id]);
    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao alterar senha' });
  }
});

// Atualizar avatar do utilizador
app.put('/api/users/:id/avatar', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum ficheiro enviado' });
  try {
    const fileId = await uploadToTelegram(req.file.buffer, req.file.originalname, req.file.mimetype);
    const avatarUrl = `/api/media/${fileId}`;
    await pool.query('UPDATE "User" SET avatar = $1 WHERE id = $2', [avatarUrl, req.params.id]);
    res.json({ avatar: avatarUrl });
  } catch (err) {
    console.error('[Avatar Upload Error]', err);
    res.status(500).json({ error: err.message || 'Erro ao fazer upload do avatar' });
  }
});

// Obter estatísticas do utilizador (XP, Temas, Ranking)
app.get('/api/users/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    
    // XP: 15 pontos por cada comentário
    const xpQuery = await pool.query('SELECT count(*) as total_comments FROM "Comment" WHERE "userId" = $1 AND "isDeleted" = FALSE', [id]);
    const totalComments = parseInt(xpQuery.rows[0].total_comments);
    const xp = totalComments * 15;
    
    // Temas: número de tópicos distintos (contentId) comentados
    const temasQuery = await pool.query('SELECT count(distinct "contentId") as total_temas FROM "Comment" WHERE "userId" = $1 AND "isDeleted" = FALSE', [id]);
    const temas = parseInt(temasQuery.rows[0].total_temas);

    // Ranking: posição do utilizador baseada no número total de comentários
    const rankingQuery = await pool.query(`
      SELECT "userId", count(*) as total
      FROM "Comment" 
      WHERE "isDeleted" = FALSE AND "userId" IS NOT NULL
      GROUP BY "userId"
      ORDER BY total DESC
    `);
    
    let rank = '-';
    const rows = rankingQuery.rows;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].userId === id) {
        rank = i + 1;
        break;
      }
    }
    
    res.json({ xp, temas, rank });
  } catch (error) {
    console.error('[User Stats Error]', error);
    res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
});

// Adicionar um estudo concluído
app.post('/api/users/:id/completed', async (req, res) => {
  try {
    const { id } = req.params;
    const { contentId } = req.body;
    if (!contentId) return res.status(400).json({ error: 'contentId é obrigatório' });
    
    // Inserir ignorando duplicados (ON CONFLICT DO NOTHING)
    await pool.query(
      `INSERT INTO "CompletedStudy" ("userId", "contentId") VALUES ($1, $2) ON CONFLICT ("userId", "contentId") DO NOTHING`,
      [id, contentId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('[Completed Study POST Error]', error);
    res.status(500).json({ error: 'Erro ao registar estudo' });
  }
});

// Listar estudos concluídos de um utilizador
app.get('/api/users/:id/completed', async (req, res) => {
  try {
    const { id } = req.params;
    // Tenta fazer JOIN com Content. Como contentId é VARCHAR e Content.id é UUID, fazemos cast.
    const { rows } = await pool.query(`
      SELECT cs."contentId", cs."completedAt", c.title, c.type, c.thumbnail
      FROM "CompletedStudy" cs
      LEFT JOIN "Content" c ON c.id::text = cs."contentId"
      WHERE cs."userId" = $1
      ORDER BY cs."completedAt" DESC
    `, [id]);
    res.json(rows);
  } catch (error) {
    console.error('[Completed Study GET Error]', error);
    res.status(500).json({ error: 'Erro ao carregar estudos concluídos' });
  }
});

// Pesquisar utilizadores (para menções)
app.get('/api/users/search', async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 1) return res.json([]);
  try {
    const { rows } = await pool.query(
      'SELECT id, name, avatar FROM "User" WHERE name ILIKE $1 OR email ILIKE $1 LIMIT 5',
      [`%${q}%`]
    );
    // Limpar os espaços do nome para o display de menção (ex: GeraldoChiquemba)
    const formattedRows = rows.map(r => ({
      ...r,
      mentionName: (r.name || r.email || '').replace(/\s+/g, '')
    }));
    res.json(formattedRows);
  } catch (error) {
    console.error('[Search Users Error]', error);
    res.status(500).json({ error: 'Erro ao pesquisar utilizadores' });
  }
});

// -- API DE CONTEÚDOS GUARDADOS (FAVORITOS) --

// Listar conteúdos guardados de um utilizador
app.get('/api/users/:id/saved', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(`
      SELECT sc."contentId", sc."savedAt", c.title, c.type, c.thumbnail, c.author, c."createdAt" as date
      FROM "SavedContent" sc
      JOIN "Content" c ON c.id::text = sc."contentId"
      WHERE sc."userId" = $1
      ORDER BY sc."savedAt" DESC
    `, [id]);
    
    // Formatar para o frontend (que mistura conteúdos e tópicos de fórum)
    const formatted = rows.map(r => ({
      id: r.contentId,
      title: r.title,
      type: r.type,
      thumbnail: r.thumbnail,
      author: r.author,
      date: r.date,
      savedAt: r.savedAt
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error('[Saved Content GET Error]', error);
    res.status(500).json({ error: 'Erro ao carregar guardados' });
  }
});

// Adicionar um conteúdo aos guardados
app.post('/api/users/:id/saved', async (req, res) => {
  try {
    const { id } = req.params;
    const { contentId } = req.body;
    if (!contentId) return res.status(400).json({ error: 'contentId é obrigatório' });
    
    await pool.query(
      `INSERT INTO "SavedContent" ("userId", "contentId") VALUES ($1, $2) ON CONFLICT ("userId", "contentId") DO NOTHING`,
      [id, contentId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('[Saved Content POST Error]', error);
    res.status(500).json({ error: 'Erro ao guardar conteúdo' });
  }
});

// Remover um conteúdo dos guardados
app.delete('/api/users/:id/saved/:contentId', async (req, res) => {
  try {
    const { id, contentId } = req.params;
    await pool.query(
      `DELETE FROM "SavedContent" WHERE "userId" = $1 AND "contentId" = $2`,
      [id, contentId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('[Saved Content DELETE Error]', error);
    res.status(500).json({ error: 'Erro ao remover conteúdo guardado' });
  }
});

// -- API DE COMENTÁRIOS --

// Middleware para verificar token JWT (opcional, não bloqueia se não tiver)
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    } catch {}
  }
  next();
}

// Listar comentários de um conteúdo
app.get('/api/comments/:contentId', async (req, res) => {
  const { contentId } = req.params;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM "Comment" WHERE "contentId" = $1 AND "isDeleted" = FALSE ORDER BY "createdAt" ASC',
      [contentId]
    );
    // Montar árvore de comentários
    const map = {};
    const roots = [];
    rows.forEach(c => { map[c.id] = { ...c, replies: [] }; });
    rows.forEach(c => {
      if (c.parentId && map[c.parentId]) {
        map[c.parentId].replies.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });
    res.json(roots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar comentários' });
  }
});

// Editar comentário (próprio utilizador)
app.patch('/api/comments/:id/edit', authMiddleware, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Autenticação necessária' });
  const { id } = req.params;
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'Texto obrigatório' });
  try {
    const { rows } = await pool.query('SELECT * FROM "Comment" WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Comentário não encontrado' });
    const comment = rows[0];
    // Apenas o próprio ou admin pode editar
    if (comment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    const result = await pool.query(
      'UPDATE "Comment" SET text = $1, "editedAt" = NOW() WHERE id = $2 RETURNING *',
      [text.trim(), id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao editar comentário' });
  }
});

// Eliminar comentário (soft-delete - próprio utilizador)
app.patch('/api/comments/:id/delete', authMiddleware, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Autenticação necessária' });
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM "Comment" WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Comentário não encontrado' });
    const comment = rows[0];
    if (comment.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    await pool.query('UPDATE "Comment" SET "isDeleted" = TRUE WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao eliminar comentário' });
  }
});

// Ocultar / mostrar comentário (admin)
app.patch('/api/comments/:id/hide', authMiddleware, async (req, res) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'Apenas admins' });
  const { id } = req.params;
  const { hide, moderatorNote } = req.body;
  try {
    const result = await pool.query(
      'UPDATE "Comment" SET "isHidden" = $1, "moderatorNote" = $2 WHERE id = $3 RETURNING *',
      [hide !== false, moderatorNote || null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Comentário não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao ocultar comentário' });
  }
});

// Gostar ou Desgostar de um comentário
app.post('/api/comments/:id/react', authMiddleware, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Autenticação necessária' });
  const { id } = req.params;
  const { type } = req.body; // 'like' ou 'dislike'
  const userId = req.user.id;

  if (type !== 'like' && type !== 'dislike') return res.status(400).json({ error: 'Tipo inválido' });

  try {
    // Obter comentário atual
    const { rows } = await pool.query('SELECT "userId", "contentId", likes, dislikes FROM "Comment" WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Comentário não encontrado' });
    const commentOwnerId = rows[0].userId;
    const contentId = rows[0].contentId;

    let likes = rows[0].likes || [];
    let dislikes = rows[0].dislikes || [];

    if (type === 'like') {
      if (likes.includes(userId)) {
        likes = likes.filter(uid => uid !== userId); // Remover like (toggle)
      } else {
        likes.push(userId); // Adicionar like
        dislikes = dislikes.filter(uid => uid !== userId); // Garantir que não está nos dislikes
        // --- NOTIFICAÇÃO DE LIKE ---
        if (commentOwnerId && commentOwnerId !== userId) {
          const userRes = await pool.query('SELECT name FROM "User" WHERE id = $1', [userId]);
          const actorName = userRes.rows[0]?.name || 'Utilizador';
          await pool.query(
            'INSERT INTO "Notification" ("userId", "actorName", type, "contentId", "commentId") VALUES ($1, $2, $3, $4, $5)',
            [commentOwnerId, actorName, 'like', contentId, id]
          );
        }
      }
    } else {
      if (dislikes.includes(userId)) {
        dislikes = dislikes.filter(uid => uid !== userId); // Remover dislike (toggle)
      } else {
        dislikes.push(userId); // Adicionar dislike
        likes = likes.filter(uid => uid !== userId); // Garantir que não está nos likes
        // --- NOTIFICAÇÃO DE DISLIKE ---
        if (commentOwnerId && commentOwnerId !== userId) {
          await pool.query(
            'INSERT INTO "Notification" ("userId", "actorName", type, "contentId", "commentId") VALUES ($1, $2, $3, $4, $5)',
            [commentOwnerId, 'Alguém', 'dislike', contentId, id]
          );
        }
      }
    }

    const result = await pool.query(
      'UPDATE "Comment" SET likes = $1, dislikes = $2 WHERE id = $3 RETURNING *',
      [likes, dislikes, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao registar reação' });
  }
});

// Criar comentário
app.post('/api/comments', authMiddleware, async (req, res) => {
  const { contentId, text, parentId } = req.body;
  if (!contentId || !text) return res.status(400).json({ error: 'contentId e text são obrigatórios' });
  if (!req.user) return res.status(401).json({ error: 'Autenticação necessária' });

  try {
    // Buscar dados do utilizador
    const { rows } = await pool.query('SELECT id, name, email, role, avatar FROM "User" WHERE id = $1', [req.user.id]);
    if (rows.length === 0) return res.status(401).json({ error: 'Utilizador não encontrado' });
    const user = rows[0];
    const author = user.name || user.email || 'Anónimo';
    const avatar = user.avatar || null;

    const result = await pool.query(
      'INSERT INTO "Comment" ("contentId", "userId", "author", "avatar", "text", "parentId") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [contentId, user.id, author, avatar, text, parentId || null]
    );

    // --- NOTIFICAÇÕES DE MENÇÃO ---
    const mentions = text.match(/@([A-Za-zÀ-ÿ0-9_]+)/g);
    console.log('[MENTION] text:', text, '| mentions found:', mentions);
    if (mentions) {
      const uniqueMentions = [...new Set(mentions.map(m => m.substring(1)))];
      for (const mentionedName of uniqueMentions) {
        console.log('[MENTION] looking for user:', mentionedName);
        // Procurar utilizador removendo espacos do nome (mencao nao tem espacos)
        const userRes = await pool.query(
          'SELECT id, name FROM "User" WHERE REPLACE(name, \' \', \'\') ILIKE $1',
          [mentionedName]
        );
        console.log('[MENTION] user found:', userRes.rows);
        if (userRes.rows.length > 0) {
          const mentionedUserId = userRes.rows[0].id;
          if (mentionedUserId !== user.id) {
            console.log('[MENTION] creating notification for userId:', mentionedUserId);
            await pool.query(
              'INSERT INTO "Notification" ("userId", "actorName", type, "contentId", "commentId") VALUES ($1, $2, $3, $4, $5)',
              [mentionedUserId, author, 'mention', contentId, result.rows[0].id]
            );
            console.log('[MENTION] notification created!');
          } else {
            console.log('[MENTION] skip: same user');
          }
        } else {
          console.log('[MENTION] no user found for:', mentionedName);
        }
      }
    }

    res.json({ ...result.rows[0], replies: [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar comentário' });
  }
});

// ==========================================
// QUIZ & RANKINGS ENDPOINTS
// ==========================================

// Get Top 10 for rankings + others
app.get('/api/rankings', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, avatar, xp FROM "User" ORDER BY xp DESC LIMIT 50');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar rankings' });
  }
});

// Get Quiz Questions (Public)
app.get('/api/quiz', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM "QuizQuestion" ORDER BY "createdAt" ASC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar perguntas' });
  }
});

// Submit Quiz Score
app.post('/api/quiz/score', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Autenticação necessária' });
  
  try {
    const user = jwt.verify(auth.slice(7), JWT_SECRET);
    const { points } = req.body;
    if (!points || points <= 0) return res.status(400).json({ error: 'Pontos inválidos' });
    
    await pool.query('UPDATE "User" SET xp = xp + $1 WHERE id = $2', [points, user.id]);
    res.json({ message: 'Pontos adicionados com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao submeter pontuação' });
  }
});

// Admin: Create Question
app.post('/api/admin/quiz', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Autenticação necessária' });
  try {
    const user = jwt.verify(auth.slice(7), JWT_SECRET);
    if (user.role !== 'admin') return res.status(403).json({ error: 'Apenas admins' });
    
    const { question, options, correctAnswer, feedback, points } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO "QuizQuestion" (question, options, "correctAnswer", feedback, points) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [question, JSON.stringify(options), correctAnswer, feedback, points || 10]
    );
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar pergunta' });
  }
});

// Admin: Update Question
app.put('/api/admin/quiz/:id', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Autenticação necessária' });
  try {
    const user = jwt.verify(auth.slice(7), JWT_SECRET);
    if (user.role !== 'admin') return res.status(403).json({ error: 'Apenas admins' });
    
    const { question, options, correctAnswer, feedback, points } = req.body;
    const { rows } = await pool.query(
      'UPDATE "QuizQuestion" SET question = $1, options = $2, "correctAnswer" = $3, feedback = $4, points = $5, "updatedAt" = NOW() WHERE id = $6 RETURNING *',
      [question, JSON.stringify(options), correctAnswer, feedback, points || 10, req.params.id]
    );
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar pergunta' });
  }
});

// Admin: Delete Question
app.delete('/api/admin/quiz/:id', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Autenticação necessária' });
  try {
    const user = jwt.verify(auth.slice(7), JWT_SECRET);
    if (user.role !== 'admin') return res.status(403).json({ error: 'Apenas admins' });
    
    await pool.query('DELETE FROM "QuizQuestion" WHERE id = $1', [req.params.id]);
    res.json({ message: 'Pergunta apagada com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao apagar pergunta' });
  }
});

// ==========================================
// AI ENDPOINTS (Groq)
// ==========================================

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Admin: Gerar quiz com IA
app.post('/api/admin/quiz/generate', requireAdmin, async (req, res) => {
  const { topic, count = 5 } = req.body;
  if (!topic) return res.status(400).json({ error: 'Tema é obrigatório' });

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `Gera perguntas de quiz sobre Angolan history, culture, geography, economy and society. 
Return ONLY a valid JSON array. Each object must have:
- "question": string (the question text)
- "options": array of exactly 4 strings (the 4 answer choices)
- "correctAnswer": integer 0-3 (index of the correct option)
- "feedback": string (historical context shown after answering)
- "points": integer 10-50 (XP reward, higher = harder)

Rules:
- Questions must be in Portuguese
- Mix difficulty levels (easy, medium, hard)
- feedback must be educational and historically accurate
- No duplicate questions
- Return ONLY the JSON array, no markdown, no explanation`
        },
        {
          role: 'user',
          content: `Gera ${count} perguntas de quiz sobre o tema: "${topic || 'História e Cultura de Angola'}"`
        }
      ],
      temperature: 0.8,
      max_tokens: 4000
    });

    const content = completion.choices[0]?.message?.content || '';
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return res.status(500).json({ error: 'Resposta da IA inválida' });

    const questions = JSON.parse(jsonMatch[0]);

    // Save to database
    const saved = [];
    for (const q of questions) {
      const result = await pool.query(
        'INSERT INTO "QuizQuestion" ("question", "options", "correctAnswer", "feedback", "points") VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [q.question, JSON.stringify(q.options), q.correctAnswer, q.feedback, q.points || 10]
      );
      saved.push(result.rows[0]);
    }

    res.json({ message: `${saved.length} perguntas criadas com sucesso`, questions: saved });
  } catch (error) {
    console.error('[AI Quiz Generation Error]', error);
    res.status(500).json({ error: 'Erro ao gerar quiz com IA' });
  }
});

// AI Assistant Chat - knows about platform content
app.post('/api/ai/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Mensagem é obrigatória' });

  try {
    const [contentRes, usersRes, rankingsRes, categoriesRes, forumRes, triviaRes] = await Promise.all([
      pool.query('SELECT title, type, status, description, "fullText", author, array_length("likes", 1) as "likesCount", "createdAt" FROM "Content" WHERE status = $1 ORDER BY array_length("likes", 1) DESC NULLS LAST LIMIT 30', ['approved']),
      pool.query('SELECT COUNT(*) as total FROM "User"'),
      pool.query('SELECT name, xp FROM "User" ORDER BY xp DESC LIMIT 10'),
      pool.query('SELECT name, icon FROM "Category" WHERE hidden = FALSE'),
      pool.query('SELECT title, author, description FROM "Content" WHERE type = $1 AND status = $2 ORDER BY "createdAt" DESC LIMIT 10', ['forum', 'approved']),
      pool.query('SELECT title, fact FROM "Trivia" WHERE "isActive" = TRUE LIMIT 5')
    ]);

    const topContent = contentRes.rows;
    const totalUsers = usersRes.rows[0]?.total || 0;
    const topRankings = rankingsRes.rows;
    const categories = categoriesRes.rows;
    const forums = forumRes.rows;
    const trivia = triviaRes.rows;

    const systemPrompt = `Tu és o assistente da plataforma "Economia com História". Conheces todos os conteúdos da plataforma.

CONTEÚDOS POPULARES (ordenados por likes):
${topContent.map((c, i) => `${i+1}. "${c.title}" (${c.type}) — ${c.likesCount || 0} likes`).join('\n') || 'Nenhum'}

FORUNS: ${forums.map(f => `"${f.title}"`).join(', ') || 'Nenhum'}.

REGRAS:
1. Quando alguém pergunta pelos mais vistos/populares, responde listando os conteúdos com mais likes da lista acima.
2. NUNCA digas "infelizmente", "não tenho informações", "não tenho dados", ou "a plataforma não fornece".
3. Responde SEMPRE como se soubesses tudo sobre a plataforma.
4. Português de Angola, máximo 4 frases.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 350
    });

    let reply = completion.choices[0]?.message?.content || 'Desculpa, não consegui processar a tua pergunta.';
    // Post-process: remover frases indesejadas e fragmentos
    reply = reply.replace(/[Ii]nfelizmente,?\s*/g, '').replace(/[Ll]amento,?\s*/g, '').replace(/[Nn]ão tenho (informações|dados|acesso|certeza)[^.!?\n]*[.!?]\s*/g, '').replace(/a plataforma não fornece[^!?\n]*[.!?]\s*/g, '').replace(/não disponho de[^!?\n]*[.!?]\s*/g, '').replace(/não posso[^!?\n]*[.!?]\s*/g, '').replace(/não consigo[^!?\n]*[.!?]\s*/g, '').replace(/de acesso à tua[^!?\n]*[.!?]\s*/g, '').replace(/a tua [a-z]+ não[^!?\n]*[.!?]\s*/g, '');
    // Limpar espaços extras e pontuação solta no início
    reply = reply.replace(/^\s*,\s*|^\s*;\s*|^\s*:\s*/, '').trim();
    if (!reply || reply.length < 5) reply = 'Os conteúdos mais populares são os que têm mais likes na plataforma!';
    res.json({ reply });
  } catch (error) {
    console.error('[AI Chat Error]', error);
    res.status(500).json({ error: 'Erro ao comunicar com a IA' });
  }
});

// Admin: Analisar comentários com IA (moderação)
app.get('/api/admin/comments/analyze', requireAdmin, async (req, res) => {
  try {
    // Buscar todos os comentários com info do autor e conteúdo
    const { rows: comments } = await pool.query(`
      SELECT c.id, c.text, c.author, c."userId", c."contentId", c."createdAt", c."isHidden",
             ct.title as "contentTitle", ct.type as "contentType"
      FROM "Comment" c
      LEFT JOIN "Content" ct ON c."contentId" = ct.id::text
      WHERE c."isDeleted" = FALSE
      ORDER BY c."createdAt" DESC
      LIMIT 100
    `);

    if (comments.length === 0) return res.json({ analysis: [], summary: 'Nenhum comentário encontrado.' });

    // Send to AI for analysis
    const commentsText = comments.map((c, i) => `[${i+1}] Autor: ${c.author} | Conteúdo: ${c.contentTitle || 'N/A'} | Texto: "${c.text}" | Data: ${new Date(c.createdAt).toLocaleDateString('pt-BR')}`).join('\n');

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: ` és um moderador de conteúdo especializado. Analisa os comentários e identifica:

1. Comentários abusivos (insultos, ameaças, discurso de ódio)
2. Comentários suspeitos (spam, phishing, links maliciosos)
3. Comentários que violam regras (off-topic, conteúdo inadequado)
4. Comentários positivos e construtivos

Para CADA comentário, retorna um objeto JSON com:
- "id": o índice do comentário (1, 2, 3...)
- "status": "limpo" | "suspeito" | "abusivo" | "violacao"
- "motivo": explicação breve (máx 10 palavras)
- "severidade": "nenhuma" | "baixa" | "media" | "alta"

Retorna APENAS um JSON válido com:
{
  "analysis": [array de objetos],
  "resumo": "resumo geral em 2-3 frases",
  "totalAbusivos": número,
  "totalSuspeitos": número
}

NÃO uses markdown. NÃO expliques. Apenas o JSON.`
        },
        {
          role: 'user',
          content: `Analisa estes ${comments.length} comentários:\n\n${commentsText}`
        }
      ],
      temperature: 0.3,
      max_tokens: 3000
    });

    const content = completion.choices[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: 'Resposta da IA inválida' });

    const analysis = JSON.parse(jsonMatch[0]);
    // Merge original comment data with AI analysis
    const merged = analysis.analysis.map((a) => {
      const original = comments[a.id - 1];
      return { ...a, comment: original };
    });

    // Apagar análises antigas e guardar a nova
    await pool.query('DELETE FROM "CommentAnalysis"');
    const resultData = { analysis: merged, summary: analysis.resumo, totalAbusivos: analysis.totalAbusivos, totalSuspeitos: analysis.totalSuspeitos, totalAnalisados: merged.length };
    await pool.query(
      'INSERT INTO "CommentAnalysis" ("analysisData", "summary", "totalAbusivos", "totalSuspeitos", "totalAnalisados") VALUES ($1, $2, $3, $4, $5)',
      [JSON.stringify(merged), analysis.resumo, analysis.totalAbusivos || 0, analysis.totalSuspeitos || 0, merged.length]
    );

    res.json(resultData);
  } catch (error) {
    console.error('[AI Comment Analysis Error]', error);
    res.status(500).json({ error: 'Erro ao analisar comentários' });
  }
});

// Admin: Buscar última análise guardada
app.get('/api/admin/comments/analysis', requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM "CommentAnalysis" ORDER BY "createdAt" DESC LIMIT 1');
    if (rows.length === 0) return res.json({ analysis: [], summary: null, totalAbusivos: 0, totalSuspeitos: 0, totalAnalisados: 0 });
    const row = rows[0];
    res.json({
      analysis: row.analysisData,
      summary: row.summary,
      totalAbusivos: row.totalAbusivos,
      totalSuspeitos: row.totalSuspeitos,
      totalAnalisados: row.totalAnalisados,
      createdAt: row.createdAt
    });
  } catch (error) {
    console.error('[Get Analysis Error]', error);
    res.status(500).json({ error: 'Erro ao buscar análise' });
  }
});

// Admin: Apagar análise guardada
app.delete('/api/admin/comments/analysis', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM "CommentAnalysis"');
    res.json({ success: true });
  } catch (error) {
    console.error('[Delete Analysis Error]', error);
    res.status(500).json({ error: 'Erro ao apagar análise' });
  }
});

// Admin: Analisar comentários de um conteúdo específico
app.get('/api/admin/comments/analyze/:contentId', requireAdmin, async (req, res) => {
  try {
    const { rows: comments } = await pool.query(`
      SELECT c.id, c.text, c.author, c."userId", c."contentId", c."createdAt", c."isHidden",
             ct.title as "contentTitle", ct.type as "contentType"
      FROM "Comment" c
      LEFT JOIN "Content" ct ON c."contentId" = ct.id::text
      WHERE c."contentId" = $1 AND c."isDeleted" = FALSE
      ORDER BY c."createdAt" DESC
    `, [req.params.contentId]);

    if (comments.length === 0) return res.json({ analysis: [], summary: 'Nenhum comentário encontrado para este conteúdo.', totalAbusivos: 0, totalSuspeitos: 0 });

    const commentsText = comments.map((c, i) => `[${i+1}] Autor: ${c.author} | Texto: "${c.text}" | Data: ${new Date(c.createdAt).toLocaleDateString('pt-BR')}`).join('\n');

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: ` és um moderador de conteúdo especializado. Analisa os comentários de um conteúdo específico e identifica:

1. Comentários abusivos (insultos, ameaças, discurso de ódio)
2. Comentários suspeitos (spam, phishing, links maliciosos)
3. Comentários que violam regras (off-topic, conteúdo inadequado)
4. Comentários positivos e construtivos

Para CADA comentário, retorna um objeto JSON com:
- "id": o índice do comentário (1, 2, 3...)
- "status": "limpo" | "suspeito" | "abusivo" | "violacao"
- "motivo": explicação breve (máx 10 palavras)
- "severidade": "nenhuma" | "baixa" | "media" | "alta"

Retorna APENAS um JSON válido com:
{
  "analysis": [array de objetos],
  "resumo": "resumo geral em 2-3 frases",
  "totalAbusivos": número,
  "totalSuspeitos": número
}

NÃO uses markdown. NÃO expliques. Apenas o JSON.`
        },
        {
          role: 'user',
          content: `Analisa estes ${comments.length} comentários:\n\n${commentsText}`
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });

    const content = completion.choices[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: 'Resposta da IA inválida' });

    const analysis = JSON.parse(jsonMatch[0]);
    const merged = analysis.analysis.map((a) => {
      const original = comments[a.id - 1];
      return { ...a, comment: original };
    });

    res.json({ analysis: merged, summary: analysis.resumo, totalAbusivos: analysis.totalAbusivos, totalSuspeitos: analysis.totalSuspeitos });
  } catch (error) {
    console.error('[AI Content Comment Analysis Error]', error);
    res.status(500).json({ error: 'Erro ao analisar comentários' });
  }
});

// -- API DE CONTEÚDO --

// Listar conteúdos aprovados (GET) - público
app.get('/api/content', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.*, u.name as "authorName"
      FROM "Content" c
      LEFT JOIN "User" u ON c."authorId" = u.id
      WHERE c."status" = $1
      ORDER BY c."createdAt" DESC
    `, ['approved']);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar conteúdos' });
  }
});

// Listar todos os conteúdos (admin) - inclui pendentes e rejeitados
app.get('/api/content/all', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.*, u.name as "authorName"
      FROM "Content" c
      LEFT JOIN "User" u ON c."authorId" = u.id
      WHERE c."status" != 'rejected'
      ORDER BY c."createdAt" DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar conteúdos' });
  }
});

// Listar conteúdos pendentes (para revisores)
app.get('/api/content/pending', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.*, u.name AS "authorName"
      FROM "Content" c
      LEFT JOIN "User" u ON c."authorId" = u.id
      WHERE c."status" = $1
      ORDER BY c."createdAt" DESC
    `, ['pending']);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar conteúdos pendentes' });
  }
});

// Listar conteúdos do autor (escritor vê os seus)
app.get('/api/content/my', authMiddleware, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Autenticação necessária' });
  try {
    const { rows } = await pool.query(
      'SELECT * FROM "Content" WHERE "authorId" = $1 ORDER BY "createdAt" DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar os teus conteúdos' });
  }
});

// Aprovar conteúdo (revisor ou admin)
app.patch('/api/content/:id/approve', authMiddleware, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Autenticação necessária' });
  if (!['admin', 'revisor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Sem permissão para aprovar conteúdo' });
  }
  try {
    const { rows } = await pool.query(
      'UPDATE "Content" SET "status" = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *',
      ['approved', req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Conteúdo não encontrado' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao aprovar conteúdo' });
  }
});

// Rejeitar conteúdo (revisor ou admin)
app.patch('/api/content/:id/reject', authMiddleware, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Autenticação necessária' });
  if (!['admin', 'revisor'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Sem permissão para rejeitar conteúdo' });
  }
  try {
    const { reason } = req.body;
    const { rows } = await pool.query(
      'UPDATE "Content" SET "status" = $1, "rejectionReason" = $2, "updatedAt" = NOW() WHERE id = $3 RETURNING *',
      ['rejected', reason || null, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Conteúdo não encontrado' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao rejeitar conteúdo' });
  }
});

// Buscar conteúdo por ID (GET)
app.get('/api/content/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(`
      SELECT c.*, u.name as "authorName"
      FROM "Content" c
      LEFT JOIN "User" u ON c."authorId" = u.id
      WHERE c.id = $1
    `, [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Conteúdo não encontrado' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar conteúdo' });
  }
});

// Criar conteúdo (POST)
app.post('/api/content', authMiddleware, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Autenticação necessária' });
  const { title, description, type, thumbnail, fullText, videoUrl, featured, recommended } = req.body;
  try {
    // Escritores criam como pendente, admin cria como aprovado
    const userRole = req.user.role;
    const status = (userRole === 'escritor' || userRole === 'revisor') ? 'pending' : 'approved';
    const authorId = req.user.id;
    
    const result = await pool.query(
      'INSERT INTO "Content" (title, description, type, thumbnail, "fullText", "videoUrl", featured, recommended, status, "authorId", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING *',
      [title, description, type, thumbnail || '', fullText || '', videoUrl || null, featured || false, recommended || false, status, authorId]
    );

    // --- NOTIFICAÇÕES DE MENÇÃO NO POST ---
    const allText = [title, description, fullText].filter(Boolean).join(' ');
    const mentions = allText.match(/@([A-Za-zÀ-ÿ0-9_]+)/g);
    if (mentions) {
      const uniqueMentions = [...new Set(mentions.map(m => m.substring(1)))];
      for (const mentionedName of uniqueMentions) {
        try {
          const userRes = await pool.query(
            'SELECT id FROM "User" WHERE REPLACE(name, \' \', \'\') ILIKE $1',
            [mentionedName]
          );
          if (userRes.rows.length > 0) {
            const mentionedUserId = userRes.rows[0].id;
            if (mentionedUserId !== authorId) {
              await pool.query(
                'INSERT INTO "Notification" ("userId", "actorName", type, "contentId") VALUES ($1, $2, $3, $4)',
                [mentionedUserId, req.user.name || 'Alguém', 'mention', result.rows[0].id]
              );
            }
          }
        } catch (e) { /* ignore individual mention errors */ }
      }
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar conteúdo' });
  }
});

// Atualizar conteúdo (PUT)
app.put('/api/content/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, type, thumbnail, fullText, videoUrl, featured, recommended } = req.body;
  try {
    const result = await pool.query(
      'UPDATE "Content" SET title = $1, description = $2, type = $3, thumbnail = $4, "fullText" = $5, "videoUrl" = $6, featured = $7, recommended = $8, "updatedAt" = NOW() WHERE id = $9 RETURNING *',
      [title, description, type, thumbnail || '', fullText || '', videoUrl || null, featured !== undefined ? featured : false, recommended !== undefined ? recommended : false, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Conteúdo não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar conteúdo' });
  }
});

// Destacar conteúdo (PATCH)
app.patch('/api/content/:id/feature', async (req, res) => {
  const { id } = req.params;
  const { featured } = req.body;
  try {
    const result = await pool.query(
      'UPDATE "Content" SET featured = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *',
      [featured, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Conteúdo não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao destacar conteúdo' });
  }
});

// Recomendar conteúdo (PATCH)
app.patch('/api/content/:id/recommend', async (req, res) => {
  const { id } = req.params;
  const { recommended } = req.body;
  try {
    const result = await pool.query(
      'UPDATE "Content" SET recommended = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *',
      [recommended, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Conteúdo não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao recomendar conteúdo' });
  }
});

// Gostar ou Desgostar de um conteúdo
app.post('/api/content/:id/react', authMiddleware, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Autenticação necessária' });
  const { id } = req.params;
  const { type } = req.body; // 'like' ou 'dislike'
  const userId = req.user.id;

  if (type !== 'like' && type !== 'dislike') return res.status(400).json({ error: 'Tipo inválido' });

  try {
    const { rows } = await pool.query('SELECT likes, dislikes FROM "Content" WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Conteúdo não encontrado' });

    let likes = rows[0].likes || [];
    let dislikes = rows[0].dislikes || [];

    if (type === 'like') {
      if (likes.includes(userId)) {
        likes = likes.filter(uid => uid !== userId); // toggle
      } else {
        likes.push(userId);
        dislikes = dislikes.filter(uid => uid !== userId);
      }
    } else {
      if (dislikes.includes(userId)) {
        dislikes = dislikes.filter(uid => uid !== userId);
      } else {
        dislikes.push(userId);
        likes = likes.filter(uid => uid !== userId);
      }
    }

    const result = await pool.query(
      'UPDATE "Content" SET likes = $1, dislikes = $2, "updatedAt" = NOW() WHERE id = $3 RETURNING *',
      [likes, dislikes, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao registar reação' });
  }
});

// Apagar conteúdo (DELETE)
app.delete('/api/content/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM "Content" WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Conteúdo não encontrado' });
    res.json({ message: 'Conteúdo apagado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao apagar conteúdo' });
  }
});

// Autor cancela o seu próprio conteúdo pendente
app.delete('/api/content/:id/cancel', authMiddleware, async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Autenticação necessária' });
  try {
    const { rows } = await pool.query('SELECT * FROM "Content" WHERE id = $1', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Conteúdo não encontrado' });
    const content = rows[0];
    // Só o próprio autor ou admin pode cancelar
    if (content.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    await pool.query('DELETE FROM "Content" WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao cancelar conteúdo' });
  }
});

// -- API DE UTILIZADORES --

// Listar utilizadores (GET)
app.get('/api/users', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, email, role, profession, avatar, "createdAt" FROM "User" ORDER BY "createdAt" DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar utilizadores' });
  }
});

// Buscar utilizador por ID (GET)
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT id, name, email, role, profession, avatar, "createdAt" FROM "User" WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Utilizador não encontrado' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar utilizador' });
  }
});

// Apagar utilizador (DELETE)
app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM "User" WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Utilizador não encontrado' });
    res.json({ message: 'Utilizador removido com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao remover utilizador' });
  }
});

// Bloquear utilizador
app.put('/api/users/:id/block', requireAdmin, async (req, res) => {
  const { reason } = req.body;
  try {
    await pool.query(
      `UPDATE "User" SET blocked = TRUE, "blockReason" = $1 WHERE id = $2`,
      [reason || 'Sem motivo especificado', req.params.id]
    );
    res.json({ message: 'Utilizador bloqueado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao bloquear utilizador' });
  }
});

// Desbloquear utilizador
app.put('/api/users/:id/unblock', requireAdmin, async (req, res) => {
  try {
    await pool.query(
      `UPDATE "User" SET blocked = FALSE, "blockReason" = NULL WHERE id = $2`,
      [req.params.id]
    );
    res.json({ message: 'Utilizador desbloqueado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao desbloquear utilizador' });
  }
});

// Update user role (Admin panel)
app.patch('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  try {
    // Get old role before update
    const oldUser = await pool.query('SELECT role FROM "User" WHERE id = $1', [id]);
    const oldRole = oldUser.rows[0]?.role;

    const result = await pool.query('UPDATE "User" SET role = $1 WHERE id = $2 RETURNING id, role', [role, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Utilizador não encontrado' });

    // Send notification on promotion/demotion
    if (oldRole && oldRole !== role && oldRole !== 'admin' && role !== 'admin') {
      const roleLabels = {
        elite: 'Elite', escritor: 'Escritor', revisor: 'Revisor', base: 'Acesso Base'
      };
      const isPromotion = ['elite', 'escritor', 'revisor'].includes(role) && role !== 'base';
      const action = isPromotion ? 'promovido' : 'despromovido';
      const newLabel = roleLabels[role] || role;

      await pool.query(
        'INSERT INTO "Notification" ("userId", "actorName", type, "contentId") VALUES ($1, $2, $3, $4)',
        [id, 'Administrador', `role_${action}`, newLabel]
      );
    }

    // Se promovido para elite, marcar o pedido como aprovado
    if (role === 'elite') {
      await pool.query(
        'UPDATE "EliteRequest" SET status = $1, "reviewedAt" = NOW() WHERE "userId" = $2',
        ['approved', id]
      );
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar utilizador' });
  }
});

// Update user streak (called on login/page visit)
app.put('/api/users/:id/streak', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT "lastActiveDate", streak FROM "User" WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Utilizador não encontrado' });

    const user = rows[0];
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate).toISOString().split('T')[0] : null;

    if (lastActive === today) {
      // Already active today, no change
      return res.json({ streak: user.streak || 0, lastActiveDate: user.lastActiveDate });
    }

    let newStreak = user.streak || 0;
    if (lastActive) {
      const lastDate = new Date(lastActive);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Consecutive day - increment streak
        newStreak += 1;
      } else if (diffDays > 1) {
        // Missed days - reset streak to 1
        newStreak = 1;
      }
    } else {
      // First time active
      newStreak = 1;
    }

    await pool.query(
      'UPDATE "User" SET "lastActiveDate" = $1, streak = $2 WHERE id = $3',
      [today, newStreak, id]
    );

    res.json({ streak: newStreak, lastActiveDate: today });
  } catch (error) {
    console.error('[Streak Error]', error);
    res.status(500).json({ error: 'Erro ao atualizar streak' });
  }
});

// Update user own profile (name + profession)
app.put('/api/users/:id/profile', async (req, res) => {
  const { id } = req.params;
  const { name, profession } = req.body;
  const allowed = ['Estudante', 'Docente', 'Trabalhador'];
  if (profession && !allowed.includes(profession)) {
    return res.status(400).json({ error: 'Profissão inválida' });
  }
  try {
    const fields = [];
    const values = [];
    let idx = 1;
    if (name) { fields.push(`name = $${idx++}`); values.push(name); }
    if (profession) { fields.push(`profession = $${idx++}`); values.push(profession); }
    if (fields.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    values.push(id);
    const result = await pool.query(
      `UPDATE "User" SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, email, role, profession, avatar`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Utilizador não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});



// -- ELITE REQUESTS --

// Utilizador submete pedido de Elite
app.post('/api/elite-requests', async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId é obrigatório' });
  try {
    await pool.query(
      'INSERT INTO "EliteRequest" ("userId", status) VALUES ($1, $2) ON CONFLICT ("userId") DO UPDATE SET status = $2, "requestedAt" = NOW()',
      [userId, 'pending']
    );
    res.json({ success: true, status: 'pending' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao submeter pedido' });
  }
});

// Buscar status do pedido de um utilizador
app.get('/api/elite-requests/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM "EliteRequest" WHERE "userId" = $1', [userId]);
    if (rows.length === 0) return res.json({ status: null });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar pedido' });
  }
});

// Admin lista todos os pedidos pendentes
app.get('/api/elite-requests', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT er.*, u.name, u.email, u.avatar
      FROM "EliteRequest" er
      JOIN "User" u ON u.id = er."userId"
      ORDER BY er."requestedAt" DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar pedidos' });
  }
});

// Admin aprova ou rejeita um pedido
app.patch('/api/elite-requests/:id', async (req, res) => {
  const { id } = req.params;
  const { action, reason } = req.body; // 'approve' ou 'reject'
  try {
    const { rows } = await pool.query('SELECT * FROM "EliteRequest" WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Pedido não encontrado' });
    const request = rows[0];
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    await pool.query(
      'UPDATE "EliteRequest" SET status = $1, "reviewedAt" = NOW(), "rejectionReason" = $2 WHERE id = $3',
      [newStatus, action === 'reject' ? (reason || null) : null, id]
    );
    if (action === 'approve') {
      await pool.query('UPDATE "User" SET role = $1 WHERE id = $2', ['elite', request.userId]);
    }
    res.json({ success: true, status: newStatus });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao processar pedido' });
  }
});

// Apagar pedido de Elite (usado para cancelar ou limpar após rejeição)
app.delete('/api/elite-requests/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    await pool.query('DELETE FROM "EliteRequest" WHERE "userId" = $1', [userId]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao apagar pedido' });
  }
});

// -- API ESTATÍSTICAS DASHBOARD --
app.get('/api/stats', async (req, res) => {
  try {
    const [usersRes, contentRes, debatesRes] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM "User"'),
      pool.query('SELECT COUNT(*) FROM "Content" WHERE type != \'forum\''),
      pool.query('SELECT COUNT(*) FROM "Content" WHERE type = \'forum\''),
    ]);
    res.json({
      users: parseInt(usersRes.rows[0].count),
      content: parseInt(contentRes.rows[0].count),
      debates: parseInt(debatesRes.rows[0].count),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// ==========================================
// TRIVIA / SABIAS QUE
// ==========================================

// requireAdmin already defined above

app.get('/api/trivia/active', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Trivia" WHERE "isActive" = TRUE LIMIT 1');
    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar trivia ativa' });
  }
});

app.get('/api/trivia', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Trivia" ORDER BY "createdAt" DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar trivias' });
  }
});

app.post('/api/trivia', requireAdmin, async (req, res) => {
  try {
    const { title, fact, imageUrl } = req.body;
    const result = await pool.query(
      'INSERT INTO "Trivia" (title, fact, "imageUrl") VALUES ($1, $2, $3) RETURNING *',
      [title, fact, imageUrl]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar trivia' });
  }
});

app.put('/api/trivia/:id', requireAdmin, async (req, res) => {
  try {
    const { title, fact, imageUrl } = req.body;
    const result = await pool.query(
      'UPDATE "Trivia" SET title = $1, fact = $2, "imageUrl" = $3 WHERE id = $4 RETURNING *',
      [title, fact, imageUrl, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Trivia não encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar trivia' });
  }
});

app.put('/api/trivia/:id/activate', requireAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE "Trivia" SET "isActive" = FALSE');
    const result = await pool.query(
      'UPDATE "Trivia" SET "isActive" = TRUE WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao ativar trivia' });
  }
});

app.put('/api/trivia/:id/deactivate', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE "Trivia" SET "isActive" = FALSE WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Trivia não encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao desativar trivia' });
  }
});

app.delete('/api/trivia/:id', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM "Trivia" WHERE id = $1', [req.params.id]);
    res.json({ message: 'Trivia removida com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover trivia' });
  }
});

// Health check route for keep-alive
app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
});

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, 'dist')));

// SPA catch-all: serve index.html for all non-API routes
app.get('/{*path}', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// -- NOTIFICAÇÕES --

app.get('/api/users/:id/notifications', authMiddleware, async (req, res) => {
  const { id } = req.params;
  console.log('[NOTIF] request for userId:', id, '| req.user.id:', req.user?.id);
  if (!req.user || req.user.id !== id) {
    console.log('[NOTIF] ACCESS DENIED - mismatch:', req.user?.id, '!==', id);
    return res.status(403).json({ error: 'Acesso negado' });
  }
  try {
    const { rows } = await pool.query(
      'SELECT * FROM "Notification" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 50',
      [id]
    );
    console.log('[NOTIF] found', rows.length, 'notifications for user', id);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar notificações' });
  }
});

app.patch('/api/notifications/:id/read', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    // A query podia verificar se o dono da notificação é o req.user.id
    await pool.query('UPDATE "Notification" SET "isRead" = TRUE WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao marcar notificação' });
  }
});

app.patch('/api/users/:id/notifications/read-all', authMiddleware, async (req, res) => {
  const { id } = req.params;
  if (!req.user || req.user.id !== id) return res.status(403).json({ error: 'Acesso negado' });
  try {
    await pool.query('UPDATE "Notification" SET "isRead" = TRUE WHERE "userId" = $1 AND "isRead" = FALSE', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao marcar notificações' });
  }
});

// === CATEGORIAS ===

// Listar categorias (público - só visíveis)
app.get('/api/categories', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM "Category" WHERE "hidden" = FALSE ORDER BY "sortOrder" ASC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// Listar todas as categorias (admin - inclui ocultas)
app.get('/api/categories/all', authMiddleware, async (req, res) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'Apenas admins' });
  try {
    const { rows } = await pool.query('SELECT * FROM "Category" ORDER BY "sortOrder" ASC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar categorias' });
  }
});

// Criar categoria (admin)
app.post('/api/categories', authMiddleware, async (req, res) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'Apenas admins' });
  try {
    const { name, icon, color, sortOrder } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome obrigatório' });
    const { rows } = await pool.query(
      'INSERT INTO "Category" (name, icon, color, "sortOrder") VALUES ($1, $2, $3, $4) RETURNING *',
      [name, icon || 'Folder', color || '#E8B4B8', sortOrder || 0]
    );
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar categoria' });
  }
});

// Atualizar categoria (admin)
app.put('/api/categories/:id', authMiddleware, async (req, res) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'Apenas admins' });
  try {
    const { name, icon, color, sortOrder } = req.body;
    const { rows } = await pool.query(
      'UPDATE "Category" SET name = $1, icon = $2, color = $3, "sortOrder" = $4 WHERE id = $5 RETURNING *',
      [name, icon, color, sortOrder, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Categoria não encontrada' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar categoria' });
  }
});

// Apagar categoria (admin)
app.delete('/api/categories/:id', authMiddleware, async (req, res) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'Apenas admins' });
  try {
    await pool.query('DELETE FROM "Category" WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao apagar categoria' });
  }
});

// Toggle ocultar/mostrar categoria (admin)
app.patch('/api/categories/:id/toggle-hidden', authMiddleware, async (req, res) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'Apenas admins' });
  try {
    const { rows } = await pool.query(
      'UPDATE "Category" SET "hidden" = NOT "hidden" WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Categoria não encontrada' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao alterar visibilidade' });
  }
});

// Catch-all route to serve the React app for any unhandled paths (SPA routing)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor de API rodando na porta ${PORT}`);
  
  // Self-ping to keep Render free tier awake
  const RENDER_URL = process.env.RENDER_EXTERNAL_URL;
  if (RENDER_URL) {
    console.log(`[Keep-Alive] Configurado para pingar ${RENDER_URL} a cada 14 minutos.`);
    setInterval(() => {
      fetch(`${RENDER_URL}/api/health`)
        .then(res => console.log(`[Keep-Alive] Ping executado. Status: ${res.status}`))
        .catch(err => console.error(`[Keep-Alive] Falha no ping:`, err.message));
    }, 14 * 60 * 1000); // 14 minutos em milissegundos
  }
});

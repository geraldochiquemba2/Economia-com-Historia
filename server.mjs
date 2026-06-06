import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

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

// Função para garantir que a BD tem as tabelas corretas (Auto-Migrate)
async function initDB() {
  try {
    // 1. Garantir que a coluna profession existe na tabela User
    await pool.query(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "profession" VARCHAR(255) DEFAULT 'Estudante';
    `);

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

    // 3. Garantir que a coluna avatar existe na tabela User
    await pool.query(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatar" VARCHAR(512);
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
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: 'Senha incorreta' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar || null } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no servidor' });
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
    const { rows } = await pool.query('SELECT likes, dislikes FROM "Comment" WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Comentário não encontrado' });

    let likes = rows[0].likes || [];
    let dislikes = rows[0].dislikes || [];

    if (type === 'like') {
      if (likes.includes(userId)) {
        likes = likes.filter(uid => uid !== userId); // Remover like (toggle)
      } else {
        likes.push(userId); // Adicionar like
        dislikes = dislikes.filter(uid => uid !== userId); // Garantir que não está nos dislikes
      }
    } else {
      if (dislikes.includes(userId)) {
        dislikes = dislikes.filter(uid => uid !== userId); // Remover dislike (toggle)
      } else {
        dislikes.push(userId); // Adicionar dislike
        likes = likes.filter(uid => uid !== userId); // Garantir que não está nos likes
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
    res.json({ ...result.rows[0], replies: [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar comentário' });
  }
});

// -- API DE CONTEÚDO --

// Listar conteúdos (GET)
app.get('/api/content', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM "Content" ORDER BY "createdAt" DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar conteúdos' });
  }
});

// Buscar conteúdo por ID (GET)
app.get('/api/content/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM "Content" WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Conteúdo não encontrado' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar conteúdo' });
  }
});

// Criar conteúdo (POST)
app.post('/api/content', async (req, res) => {
  const { title, description, type, thumbnail, fullText, videoUrl, featured, recommended } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO "Content" (title, description, type, thumbnail, "fullText", "videoUrl", featured, recommended, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING *',
      [title, description, type, thumbnail || '', fullText || '', videoUrl || null, featured || false, recommended || false]
    );
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

// Update user role (Admin panel)
app.patch('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  try {
    const result = await pool.query('UPDATE "User" SET role = $1 WHERE id = $2 RETURNING id, role', [role, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Utilizador não encontrado' });
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
  const { action } = req.body; // 'approve' ou 'reject'
  try {
    const { rows } = await pool.query('SELECT * FROM "EliteRequest" WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Pedido não encontrado' });
    const request = rows[0];
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    await pool.query(
      'UPDATE "EliteRequest" SET status = $1, "reviewedAt" = NOW() WHERE id = $2',
      [newStatus, id]
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

// Health check route for keep-alive
app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
});

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, 'dist')));

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

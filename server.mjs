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

  // Determinar método do Telegram com base no mime type
  let tgMethod = 'sendDocument';
  if (mimetype.startsWith('image/')) tgMethod = 'sendPhoto';
  else if (mimetype.startsWith('video/')) tgMethod = 'sendVideo';
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
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro no servidor' });
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

// Criar conteúdo (POST)
app.post('/api/content', async (req, res) => {
  const { title, description, type, thumbnail, fullText, videoUrl } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO "Content" (title, description, type, thumbnail, "fullText", "videoUrl", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *',
      [title, description, type, thumbnail || '', fullText || '', videoUrl || null]
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
  const { title, description, type, thumbnail, fullText, videoUrl } = req.body;
  try {
    const result = await pool.query(
      'UPDATE "Content" SET title = $1, description = $2, type = $3, thumbnail = $4, "fullText" = $5, "videoUrl" = $6, "updatedAt" = NOW() WHERE id = $7 RETURNING *',
      [title, description, type, thumbnail || '', fullText || '', videoUrl || null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Conteúdo não encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar conteúdo' });
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
    const { rows } = await pool.query('SELECT id, name, email, role, profession, "createdAt" FROM "User" ORDER BY "createdAt" DESC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar utilizadores' });
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

// -- API ESTATÍSTICAS DASHBOARD --
app.get('/api/stats', async (req, res) => {
  try {
    const [usersRes, contentRes] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM "User"'),
      pool.query('SELECT COUNT(*) FROM "Content"'),
    ]);
    res.json({
      users: parseInt(usersRes.rows[0].count),
      content: parseInt(contentRes.rows[0].count),
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

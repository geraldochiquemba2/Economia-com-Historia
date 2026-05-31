import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

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

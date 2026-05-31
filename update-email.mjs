import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await pool.query('UPDATE "User" SET email = $1 WHERE email = $2', ['20230043@isptec.co.ao', '20230043@sptec.co.ao']);
    console.log('Email atualizado com sucesso!');
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}

run();

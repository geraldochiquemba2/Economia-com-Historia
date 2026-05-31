import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_rnMKyBPo26bR@ep-sparkling-haze-aqbcxe4i-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function test() {
  try {
    const { rows } = await pool.query('SELECT id, name, email, role, profession, "createdAt" FROM "User" ORDER BY "createdAt" DESC');
    console.log("Success! Users:", rows.length);
    console.log(rows);
  } catch (e) {
    console.error("Query Error:", e);
  } finally {
    await pool.end();
  }
}

test();

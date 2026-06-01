import pg from 'pg';
const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_rnMKyBPo26bR@ep-sparkling-haze-aqbcxe4i-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require', ssl: { rejectUnauthorized: false } });
async function alter() {
  try {
    await pool.query('ALTER TABLE "Content" ADD COLUMN IF NOT EXISTS recommended BOOLEAN DEFAULT FALSE;');
    console.log('Column recommended added');
  } catch (e) {
    console.error(e);
  } finally {
    await pool.end();
  }
}
alter();

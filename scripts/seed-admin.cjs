require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    console.log("Creating users table if not exists...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'student',
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);

    const adminEmail = 'admin@isptec.co.ao';
    const adminPass = '1234567890';

    console.log("Checking if admin exists...");
    const { rows } = await pool.query('SELECT * FROM "User" WHERE email = $1', [adminEmail]);

    if (rows.length === 0) {
      console.log("Admin not found. Creating admin user...");
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(adminPass, salt);

      await pool.query(
        'INSERT INTO "User" (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
        ['Administrador', adminEmail, hash, 'admin']
      );
      console.log("Admin user created successfully!");
    } else {
      console.log("Admin user already exists.");
    }
  } catch (error) {
    console.error("Error setting up DB:", error);
  } finally {
    await pool.end();
  }
}

main();

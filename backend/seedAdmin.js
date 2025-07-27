import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

async function seedAdmin() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const email = 'admin@example.com';
  const username = 'admin';
  const password = 'admin123';

  // Check if admin user already exists
  const [existing] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    console.log('Admin user already exists.');
    await connection.end();
    return;
  }

  // Hash the password with bcrypt with 12 salt rounds
  const hashedPassword = await bcrypt.hash(password, 12);

  // Insert admin user
  await connection.execute(
    'INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
    [username, email, hashedPassword, 'admin', 'active']
  );

  console.log('Admin user created successfully.');
  await connection.end();
}

seedAdmin().catch(err => {
  console.error('Failed to seed admin:', err);
  process.exit(1);
});

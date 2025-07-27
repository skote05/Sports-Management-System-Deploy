import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sports_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection on startup
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('Database connection pool created successfully');
  } catch (error) {
    console.error('Database connection test failed:', error.message);
    process.exit(1);
  }
};

// Handle connection events
pool.on('connection', (connection) => {
  // Set session variables for new connections
  connection.query('SET SESSION sql_mode = "STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO"');
});

pool.on('error', (err) => {
  console.error('Database connection lost, creating new pool...', err);
  // Recreate pool on error
  pool.end();
});

// Initialize connection test
testConnection();

export default pool;

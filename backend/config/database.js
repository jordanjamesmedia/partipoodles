const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

// Create database connection
const sql = neon(process.env.DATABASE_URL);

// Test database connection
async function testConnection() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('Database connected successfully:', result[0].now);
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

module.exports = { sql, testConnection };
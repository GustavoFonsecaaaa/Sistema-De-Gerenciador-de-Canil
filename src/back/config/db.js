const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testarConexao() {
  try {
    const connection = await pool.getConnection();
    console.log('Conectado ao banco de dados MySQL com sucesso!');
    connection.release();
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error.message);
  }
}

module.exports = { pool, testarConexao };
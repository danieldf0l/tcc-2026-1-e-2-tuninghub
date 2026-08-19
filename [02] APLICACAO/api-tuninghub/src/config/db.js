import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Criamos um pool de conexões ao invés de uma conexão única.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: true,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

// Teste inicial rápido de conexão
try {
  const connection = await pool.getConnection();
  console.log('✅ Conectado ao banco de dados MySQL 8.0 com sucesso!');
  connection.release();
} catch (error) {
  console.error('❌ Erro ao conectar no banco de dados:', error.message);
}

export default pool;
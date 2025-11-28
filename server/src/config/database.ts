import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Configurazione pool di connessioni MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'swiss_consult_hub',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4'
});

// Test connessione
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connessione MySQL stabilita con successo');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Errore connessione MySQL:', error);
    return false;
  }
}

// Helper per query
export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as T[];
  } catch (error) {
    console.error('Query Error:', error);
    throw error;
  }
}

// Helper per singola riga
export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// Helper per INSERT e ritorna ID
export async function insert(sql: string, params?: any[]): Promise<string> {
  try {
    const [result] = await pool.execute(sql, params);
    const insertResult = result as mysql.ResultSetHeader;
    return insertResult.insertId.toString();
  } catch (error) {
    console.error('Insert Error:', error);
    throw error;
  }
}

// Helper per UPDATE/DELETE e ritorna affected rows
export async function execute(sql: string, params?: any[]): Promise<number> {
  try {
    const [result] = await pool.execute(sql, params);
    const executeResult = result as mysql.ResultSetHeader;
    return executeResult.affectedRows;
  } catch (error) {
    console.error('Execute Error:', error);
    throw error;
  }
}

// Transazioni
export async function transaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export default pool;

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// Configuração do pool de conexões PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // máximo de conexões no pool
  idleTimeoutMillis: 30000, // tempo limite de conexões ociosas
  connectionTimeoutMillis: 2000, // tempo limite para estabelecer conexão
});

// Testar conexão
pool.on('connect', () => {
  console.log('✅ Conectado ao banco de dados PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erro no pool de conexões:', err);
});

// Função para executar queries
export const query = (text, params) => pool.query(text, params);

// Função para obter cliente do pool
export const getClient = () => pool.connect();

// Função para fechar o pool
export const closePool = () => pool.end();

export default pool; 
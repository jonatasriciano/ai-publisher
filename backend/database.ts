// /Users/jonatas/Documents/Projects/ai-publisher/backend/database.ts
import { Pool } from 'pg';

const pool = new Pool({
  user: 'yourUsername',  // Substitua por seu usuário do PostgreSQL
  host: 'localhost',
  database: 'yourDatabaseName',  // Substitua pelo nome do seu banco de dados
  password: 'yourPassword',  // Substitua pela sua senha
  port: 5432,  // A porta padrão do PostgreSQL é 5432
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
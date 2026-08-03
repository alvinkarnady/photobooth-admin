import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("DATABASE_URL is not set");
}

export const pool = new Pool({
  connectionString,
});

export async function query<T = any>(text: string, params?: any[]) {
  const result = await pool.query(text, params);
  return result;
}

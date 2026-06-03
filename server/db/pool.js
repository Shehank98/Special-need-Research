import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  // eslint-disable-next-line no-console
  console.warn(
    '[db] DATABASE_URL is not set. The server will start but database calls will fail until it is configured.'
  );
}

// Railway / most managed Postgres providers require SSL in production.
const needsSsl =
  process.env.NODE_ENV === 'production' ||
  /sslmode=require/.test(process.env.DATABASE_URL || '');

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: needsSsl ? { rejectUnauthorized: false } : false,
});

export const query = (text, params) => pool.query(text, params);

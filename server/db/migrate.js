// Runs the idempotent schema (db/schema.sql) against the shared pool.
// Used by the optional auto-migrate-on-boot path (RUN_MIGRATIONS=true) and
// re-usable elsewhere. Does NOT close the pool, so the server keeps running.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runMigrations() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(schema);
}

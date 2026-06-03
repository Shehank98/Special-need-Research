// Creates all tables by running schema.sql. Run with: npm run db:setup
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function setup() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  try {
    await pool.query(schema);
    console.log('✅ Database schema created/verified successfully.');
  } catch (err) {
    console.error('❌ Failed to set up database schema:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

setup();

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';

const migrationUrl = new URL('./migrations/001_create_employees.sql', import.meta.url);

try {
  await pool.query(await readFile(fileURLToPath(migrationUrl), 'utf8'));
  console.log('Database migration completed.');
} finally {
  await pool.end();
}

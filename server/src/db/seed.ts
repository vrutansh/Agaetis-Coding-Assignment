import { pool } from './pool.js';

const employees = [
  ['Maya Chen', 'maya.chen@example.com', 'Product Designer'],
  ['Noah Williams', 'noah.williams@example.com', 'Staff Engineer'],
  ['Amara Okafor', 'amara.okafor@example.com', 'People Operations Lead'],
  ['Luca Rossi', 'luca.rossi@example.com', 'Customer Success Manager'],
  ['Priya Shah', 'priya.shah@example.com', 'Data Analyst'],
  ['Elias Martin', 'elias.martin@example.com', 'Marketing Strategist'],
];

const client = await pool.connect();
try {
  await client.query('BEGIN');
  for (const [name, email, role] of employees) {
    await client.query(
      `INSERT INTO employees (name, email, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (LOWER(email)) DO NOTHING`,
      [name, email, role],
    );
  }
  await client.query('COMMIT');
  console.log('Database seed completed.');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
  await pool.end();
}

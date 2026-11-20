import { createApp } from './app.js';
import { config } from './config.js';
import { pool } from './db/pool.js';
import { EmployeeRepository } from './employees/repository.js';
import { EmployeeService } from './employees/service.js';

const app = createApp(new EmployeeService(new EmployeeRepository(pool)));
const server = app.listen(config.PORT, () => console.log(`Roster API listening on http://localhost:${config.PORT}`));

async function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

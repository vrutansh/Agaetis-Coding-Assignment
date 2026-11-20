import type { Pool, QueryResultRow } from 'pg';
import type { Employee, EmployeeInput, EmployeePage, EmployeeQuery } from './schema.js';

export interface EmployeeRepositoryContract {
  list(query: EmployeeQuery): Promise<EmployeePage>;
  create(input: EmployeeInput): Promise<Employee>;
  update(id: number, input: EmployeeInput): Promise<Employee | null>;
  delete(id: number): Promise<boolean>;
}

function serializeEmployee(row: QueryResultRow): Employee {
  return {
    id: Number(row.id),
    name: String(row.name),
    email: String(row.email),
    role: String(row.role),
    created_at: new Date(row.created_at).toISOString(),
  };
}

export class EmployeeRepository implements EmployeeRepositoryContract {
  constructor(private readonly db: Pick<Pool, 'query'>) {}

  async list({ search, page, limit }: EmployeeQuery): Promise<EmployeePage> {
    const pattern = `%${search}%`;
    const offset = (page - 1) * limit;
    const result = await this.db.query(
      `SELECT id, name, email, role, created_at, COUNT(*) OVER()::int AS total
       FROM employees
       WHERE ($1 = '' OR name ILIKE $2)
       ORDER BY created_at DESC, id DESC
       LIMIT $3 OFFSET $4`,
      [search, pattern, limit, offset],
    );

    let total = result.rows[0] ? Number(result.rows[0].total) : 0;
    if (total === 0 && page > 1) {
      const count = await this.db.query(
        `SELECT COUNT(*)::int AS total FROM employees WHERE ($1 = '' OR name ILIKE $2)`,
        [search, pattern],
      );
      total = Number(count.rows[0]?.total ?? 0);
    }

    return {
      data: result.rows.map(serializeEmployee),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async create(input: EmployeeInput): Promise<Employee> {
    const result = await this.db.query(
      `INSERT INTO employees (name, email, role) VALUES ($1, $2, $3)
       RETURNING id, name, email, role, created_at`,
      [input.name, input.email, input.role],
    );
    return serializeEmployee(result.rows[0]);
  }

  async update(id: number, input: EmployeeInput): Promise<Employee | null> {
    const result = await this.db.query(
      `UPDATE employees SET name = $1, email = $2, role = $3 WHERE id = $4
       RETURNING id, name, email, role, created_at`,
      [input.name, input.email, input.role, id],
    );
    return result.rows[0] ? serializeEmployee(result.rows[0]) : null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.query('DELETE FROM employees WHERE id = $1', [id]);
    return result.rowCount === 1;
  }
}

import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import type { EmployeeRepositoryContract } from '../src/employees/repository.js';
import type { Employee, EmployeeInput, EmployeeQuery } from '../src/employees/schema.js';
import { EmployeeService } from '../src/employees/service.js';

class TestRepository implements EmployeeRepositoryContract {
  employees: Employee[] = [];
  nextId = 1;

  async list({ search, page, limit }: EmployeeQuery) {
    const filtered = this.employees
      .filter((employee) => employee.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.id - a.id);
    return {
      data: filtered.slice((page - 1) * limit, page * limit),
      pagination: { page, limit, total: filtered.length, totalPages: Math.ceil(filtered.length / limit) },
    };
  }

  async create(input: EmployeeInput) {
    if (this.employees.some((employee) => employee.email.toLowerCase() === input.email.toLowerCase())) {
      throw Object.assign(new Error('duplicate'), { code: '23505' });
    }
    const employee = { ...input, id: this.nextId++, created_at: new Date().toISOString() };
    this.employees.push(employee);
    return employee;
  }

  async update(id: number, input: EmployeeInput) {
    const index = this.employees.findIndex((employee) => employee.id === id);
    if (index < 0) return null;
    if (this.employees.some((employee) => employee.id !== id && employee.email.toLowerCase() === input.email.toLowerCase())) {
      throw Object.assign(new Error('duplicate'), { code: '23505' });
    }
    const employee: Employee = { ...this.employees[index]!, ...input };
    this.employees[index] = employee;
    return employee;
  }

  async delete(id: number) {
    const previousLength = this.employees.length;
    this.employees = this.employees.filter((employee) => employee.id !== id);
    return this.employees.length < previousLength;
  }
}

describe('employees API', () => {
  let repository: TestRepository;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    repository = new TestRepository();
    app = createApp(new EmployeeService(repository));
  });

  it('creates and normalizes a valid employee', async () => {
    const response = await request(app).post('/employees').send({
      name: '  Ada Lovelace  ', email: 'ADA@EXAMPLE.COM', role: '  Principal Engineer ',
    });
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ name: 'Ada Lovelace', email: 'ada@example.com', role: 'Principal Engineer' });
  });

  it('rejects invalid input', async () => {
    const response = await request(app).post('/employees').send({ name: 'A', email: 'invalid', role: '' });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects duplicate emails regardless of case', async () => {
    await request(app).post('/employees').send({ name: 'Ada Lovelace', email: 'ada@example.com', role: 'Engineer' });
    const response = await request(app).post('/employees').send({ name: 'Ada Byron', email: 'ADA@example.com', role: 'Lead' });
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('DUPLICATE_EMAIL');
  });

  it('updates an existing employee without changing created_at', async () => {
    const created = await request(app).post('/employees').send({ name: 'Ada Lovelace', email: 'ada@example.com', role: 'Engineer' });
    const response = await request(app).put(`/employees/${created.body.id}`).send({ name: 'Ada Lovelace', email: 'ada@example.com', role: 'CTO' });
    expect(response.status).toBe(200);
    expect(response.body.role).toBe('CTO');
    expect(response.body.created_at).toBe(created.body.created_at);
  });

  it('returns 404 for a nonexistent employee', async () => {
    const input = { name: 'Ada Lovelace', email: 'ada@example.com', role: 'Engineer' };
    expect((await request(app).put('/employees/999').send(input)).status).toBe(404);
    expect((await request(app).delete('/employees/999')).status).toBe(404);
  });

  it('deletes an employee', async () => {
    const created = await request(app).post('/employees').send({ name: 'Ada Lovelace', email: 'ada@example.com', role: 'Engineer' });
    expect((await request(app).delete(`/employees/${created.body.id}`)).status).toBe(204);
    expect(repository.employees).toHaveLength(0);
  });

  it('rejects invalid IDs', async () => {
    expect((await request(app).delete('/employees/not-a-number')).status).toBe(400);
    expect((await request(app).delete('/employees/-1')).status).toBe(400);
  });

  it('searches by name and paginates deterministically', async () => {
    for (const name of ['Maya Chen', 'Maya Singh', 'Noah Williams']) {
      await request(app).post('/employees').send({ name, email: `${name.replace(' ', '.')}@example.com`, role: 'Engineer' });
    }
    const response = await request(app).get('/employees?search=maya&page=2&limit=1');
    expect(response.status).toBe(200);
    expect(response.body.pagination).toEqual({ page: 2, limit: 1, total: 2, totalPages: 2 });
    expect(response.body.data[0].name).toBe('Maya Chen');
  });

  it('rejects invalid pagination values', async () => {
    expect((await request(app).get('/employees?page=0')).status).toBe(400);
    expect((await request(app).get('/employees?limit=101')).status).toBe(400);
  });
});

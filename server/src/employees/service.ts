import { AppError, isUniqueViolation } from '../lib/errors.js';
import type { EmployeeRepositoryContract } from './repository.js';
import type { EmployeeInput, EmployeeQuery } from './schema.js';

export class EmployeeService {
  constructor(private readonly repository: EmployeeRepositoryContract) {}

  list(query: EmployeeQuery) {
    return this.repository.list(query);
  }

  async create(input: EmployeeInput) {
    try {
      return await this.repository.create(input);
    } catch (error) {
      if (isUniqueViolation(error)) throw new AppError(409, 'DUPLICATE_EMAIL', 'An employee with this email already exists.');
      throw error;
    }
  }

  async update(id: number, input: EmployeeInput) {
    try {
      const employee = await this.repository.update(id, input);
      if (!employee) throw new AppError(404, 'EMPLOYEE_NOT_FOUND', 'Employee not found.');
      return employee;
    } catch (error) {
      if (isUniqueViolation(error)) throw new AppError(409, 'DUPLICATE_EMAIL', 'An employee with this email already exists.');
      throw error;
    }
  }

  async delete(id: number) {
    if (!(await this.repository.delete(id))) throw new AppError(404, 'EMPLOYEE_NOT_FOUND', 'Employee not found.');
  }
}

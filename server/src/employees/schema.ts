import { z } from 'zod';

const trimmed = (maximum: number, label: string) =>
  z.string().trim().min(1, `${label} is required`).max(maximum, `${label} is too long`);

export const employeeInputSchema = z.object({
  name: trimmed(120, 'Full name').min(2, 'Full name must be at least 2 characters'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address').max(254, 'Email address is too long'),
  role: trimmed(100, 'Job role'),
}).strict();

export const employeeIdSchema = z.coerce.number().int().positive();

export const employeeQuerySchema = z.object({
  search: z.string().trim().max(120).default(''),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type EmployeeInput = z.infer<typeof employeeInputSchema>;
export type EmployeeQuery = z.infer<typeof employeeQuerySchema>;

export interface Employee extends EmployeeInput {
  id: number;
  created_at: string;
}

export interface EmployeePage {
  data: Employee[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

import axios from 'axios';
import type { Employee, EmployeeInput, EmployeePage } from '../../types/employee';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

export const getEmployees = async (search: string, page: number, limit = 10) =>
  (await api.get<EmployeePage>('/employees', { params: { search: search || undefined, page, limit } })).data;

export const createEmployee = async (input: EmployeeInput) =>
  (await api.post<Employee>('/employees', input)).data;

export const updateEmployee = async ({ id, input }: { id: number; input: EmployeeInput }) =>
  (await api.put<Employee>(`/employees/${id}`, input)).data;

export const deleteEmployee = async (id: number) => {
  await api.delete(`/employees/${id}`);
};

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error?.message ?? (error.response ? 'The request could not be completed.' : 'Unable to reach the server. Please try again.');
  }
  return 'Something went wrong. Please try again.';
}

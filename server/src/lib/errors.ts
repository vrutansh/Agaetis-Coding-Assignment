export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export const isUniqueViolation = (error: unknown): error is { code: string } =>
  typeof error === 'object' && error !== null && 'code' in error && error.code === '23505';

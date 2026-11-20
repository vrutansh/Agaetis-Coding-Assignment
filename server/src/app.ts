import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { allowedOrigins } from './config.js';
import { employeeRoutes } from './employees/routes.js';
import type { EmployeeService } from './employees/service.js';
import { AppError } from './lib/errors.js';

export function createApp(employeeService: EmployeeService) {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new AppError(403, 'ORIGIN_NOT_ALLOWED', 'Origin is not allowed.'));
    },
  }));
  app.use(express.json({ limit: '100kb' }));
  app.get('/health', (_request, response) => response.json({ status: 'ok' }));
  app.use('/employees', employeeRoutes(employeeService));
  app.use((_request, response) => response.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found.' } }));

  const errorHandler: ErrorRequestHandler = (error, _request, response, next) => {
    void next;
    if (error instanceof ZodError) {
      response.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'The request is invalid.', details: error.flatten().fieldErrors },
      });
      return;
    }
    if (error instanceof AppError) {
      response.status(error.status).json({ error: { code: error.code, message: error.message, details: error.details } });
      return;
    }
    console.error(error);
    response.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } });
  };
  app.use(errorHandler);
  return app;
}

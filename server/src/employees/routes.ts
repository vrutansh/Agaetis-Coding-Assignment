import { Router } from 'express';
import { EmployeeService } from './service.js';
import { employeeIdSchema, employeeInputSchema, employeeQuerySchema } from './schema.js';

export function employeeRoutes(service: EmployeeService) {
  const router = Router();

  router.get('/', async (request, response) => {
    const query = employeeQuerySchema.parse(request.query);
    response.json(await service.list(query));
  });

  router.post('/', async (request, response) => {
    const input = employeeInputSchema.parse(request.body);
    response.status(201).json(await service.create(input));
  });

  router.put('/:id', async (request, response) => {
    const id = employeeIdSchema.parse(request.params.id);
    const input = employeeInputSchema.parse(request.body);
    response.json(await service.update(id, input));
  });

  router.delete('/:id', async (request, response) => {
    const id = employeeIdSchema.parse(request.params.id);
    await service.delete(id);
    response.status(204).send();
  });

  return router;
}

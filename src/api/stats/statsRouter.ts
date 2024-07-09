import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';

import { UserSchema } from '@/api/user/userModel';
import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { handleServiceResponse } from '@/common/utils/httpHandlers';
import { statsService } from './statsService';

export const statsRegistry = new OpenAPIRegistry();

statsRegistry.register('stats', UserSchema);

export const statsRouter: Router = (() => {
  const router = express.Router();

  statsRegistry.registerPath({
    method: 'get',
    path: '/stats',
    tags: ['Auth'],
    // request: { body: RegisterUserSchema },
    responses: createApiResponse(UserSchema, 'Success'),
  });
  router.get('/', async (req: Request, res: Response) => {
    const serviceResponse = await statsService.getStats();
    handleServiceResponse(serviceResponse, res);
  });

  return router;
})();

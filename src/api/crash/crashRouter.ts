import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

import { userService } from '@/api/user/userService';
import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';
import CrashGame from '@/common/models/CrashGame';
import { getGameHistory } from './crash';

export const crashRegistry = new OpenAPIRegistry();

// crashRegistry.register('Crash', CrashGame.schema);

export const crashRouter: Router = (() => {
  const router = express.Router();

  // crashRegistry.registerPath({
  //   method: 'get',
  //   path: '/history',
  //   tags: ['Crash'],
  //   responses: createApiResponse(z.array(CrashGame.schema), 'Success'),
  // });

  router.get('/', async (_req: Request, res: Response) => {
    const serviceResponse = await getGameHistory();
    // handleServiceResponse(serviceResponse, res);

    res.status(200).send(serviceResponse);
  });

  return router;
})();

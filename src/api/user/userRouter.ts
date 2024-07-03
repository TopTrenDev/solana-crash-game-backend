import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

import { GetUserSchema, RegisterUserSchema, UserSchema } from '@/api/user/userModel';
import { userService } from '@/api/user/userService';
import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';
import User from '@/common/models/User';

export const userRegistry = new OpenAPIRegistry();

userRegistry.register('User', UserSchema);

export type TUpdateBalance = {
  actionType: 'deposit' | 'withdraw';
  amount: number;
  txHash?: string;
  address: string;
};

export const userRouter: Router = (() => {
  const router = express.Router();

  userRegistry.registerPath({
    method: 'get',
    path: '/users',
    tags: ['User'],
    responses: createApiResponse(z.array(UserSchema), 'Success'),
  });
  router.get('/', async (_req: Request, res: Response) => {
    const serviceResponse = await userService.findAll();
    handleServiceResponse(serviceResponse, res);
  });

  userRegistry.registerPath({
    method: 'get',
    path: '/users/{id}',
    tags: ['User'],
    request: { params: GetUserSchema.shape.params },
    responses: createApiResponse(UserSchema, 'Success'),
  });
  router.get('/:id', validateRequest(GetUserSchema), async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    const serviceResponse = await userService.findById(id);
    handleServiceResponse(serviceResponse, res);
  });

  userRegistry.registerPath({
    method: 'post',
    path: '/users/balance',
    tags: ['User'],
    request: { params: GetUserSchema.shape.params },
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              balanceType: { type: 'string' },
              actionType: { type: 'string', enum: ['deposit', 'withdraw'] },
              amount: { type: 'number' },
            },
          },
        },
      },
    },
    responses: createApiResponse(UserSchema, 'Success'),
  });

  router.post('/:id/balance', async (req: Request, res: Response) => {});

  return router;
})();

import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';

import { LoginUserSchema, RegisterUserSchema, UserSchema } from '@/api/user/userModel';
import { authService } from '@/api/auth/authService';
import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';
import { z } from 'zod';

export const authRegistry = new OpenAPIRegistry();

authRegistry.register('Auth', UserSchema);

export const authRouter: Router = (() => {
  const router = express.Router();

  authRegistry.registerPath({
    method: 'post',
    path: '/auth/register',
    tags: ['Auth'],
    // request: { body: RegisterUserSchema },
    responses: createApiResponse(UserSchema, 'Success'),
  });
  router.post('/register', validateRequest(RegisterUserSchema), async (req: Request, res: Response) => {
    const { username, email, password, confirmPassword } = req.body;
    const serviceResponse = await authService.register(username, email, password, confirmPassword);
    handleServiceResponse(serviceResponse, res);
  });

  authRegistry.registerPath({
    method: 'post',
    path: '/auth/login',
    tags: ['Auth'],
    // request: { body: RegisterUserSchema.shape.body },
    responses: createApiResponse(UserSchema, 'Success'),
  });
  router.post('/login', validateRequest(LoginUserSchema), async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const serviceResponse = await authService.login(email, password);
    handleServiceResponse(serviceResponse, res);
  });

  return router;
})();

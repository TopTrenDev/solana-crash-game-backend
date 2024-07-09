import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

import { GetUserSchema, RegisterUserSchema, UserSchema, WithdrawalSchema } from '@/api/user/userModel';
import { userService } from '@/api/user/userService';
import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';
import User from '@/common/models/User';
import { depositService } from './depositService';
import { AuthRequest, validateJWT } from '@/common/middleware/auth';

export type TUpdateBalance = {
  actionType: 'deposit' | 'withdraw';
  amount: number;
  txHash?: string;
  address: string;
};

export const depositRouter: Router = (() => {
  const router = express.Router();

  router.post('/withdraw', validateJWT, validateRequest(WithdrawalSchema), async (req: AuthRequest, res: Response) => {
    const { walletAddress, amount, password } = req.body;
    const { id } = req.user;
    const serviceResponse = await depositService.withdraw({ userId: id, walletAddress, amount, password });
    handleServiceResponse(serviceResponse, res);
  });

  return router;
})();

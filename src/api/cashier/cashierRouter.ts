import express, { Response, Router } from 'express';

import { TipsSchema, WithdrawalSchema } from '@/api/user/userModel';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';
import { cashierService } from './cashierService';
import { AuthRequest, validateJWT } from '@/common/middleware/auth';

export type TUpdateBalance = {
  actionType: 'deposit' | 'withdraw';
  amount: number;
  txHash?: string;
  address: string;
};

export const cashierRouter: Router = (() => {
  const router = express.Router();

  router.post('/withdraw', validateJWT, validateRequest(WithdrawalSchema), async (req: AuthRequest, res: Response) => {
    const { id } = req.user;
    const { walletAddress, amount, password } = req.body;
    const serviceResponse = await cashierService.withdraw({ userId: id, walletAddress, amount, password });
    handleServiceResponse(serviceResponse, res);
  });

  router.post('/tips', validateJWT, validateRequest(TipsSchema), async (req: AuthRequest, res: Response) => {
    const { id } = req.user;
    const { username, tipsAmount, password } = req.body;
    const serviceResponse = await cashierService.tips({ userId: id, username, tipsAmount, password });
    handleServiceResponse(serviceResponse, res);
  });

  return router;
})();

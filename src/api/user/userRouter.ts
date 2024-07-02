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
    path: '/users/{id}/balance',
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

  // router.post('/:id/balance', async (req: Request, res: Response) => {
  //   try {
  //     const id = req.params.id as string;
  //     const updateBalanceParam = req.body as TUpdateBalance;

  //     const user = await User.findById(id);
  //     const updateParams = `wallet.${updateBalanceParam.balanceType}`;
  //     const walletValue = user?.wallet?.get(updateBalanceParam.balanceType)! ?? 0;
  //     let updateValue = 0;
  //     // check balance
  //     if (updateBalanceParam.actionType === 'withdraw') {
  //       if (walletValue < updateBalanceParam.amount) {
  //         const despositErrorRes = new ServiceResponse(
  //           ResponseStatus.Failed,
  //           'not enough token balancez',
  //           null,
  //           StatusCodes.INTERNAL_SERVER_ERROR
  //         );
  //         handleServiceResponse(despositErrorRes, res);
  //       } else {
  //         console.log({
  //           address: updateBalanceParam.address,
  //           amount: updateBalanceParam.amount,
  //           tokenType: updateBalanceParam.balanceType,
  //         });
  //         const resPayment = await paymentService.cryptoWithdrawFromAdmin({
  //           address: updateBalanceParam.address,
  //           amount: updateBalanceParam.amount,
  //           tokenType: updateBalanceParam.balanceType,
  //         });
  //         if (!resPayment) {
  //           const despositErrorRes = new ServiceResponse(
  //             ResponseStatus.Failed,
  //             'unable deposit',
  //             null,
  //             StatusCodes.INTERNAL_SERVER_ERROR
  //           );
  //           handleServiceResponse(despositErrorRes, res);
  //         }
  //         updateValue = walletValue - updateBalanceParam.amount;
  //       }
  //     } else if (updateBalanceParam.actionType === 'deposit') {
  //       console.log({
  //         address: updateBalanceParam.address,
  //         txHash: updateBalanceParam.txHash ?? '',
  //         amount: updateBalanceParam.amount,
  //         tokenType: updateBalanceParam.balanceType,
  //       });
  //       // user deposit crypto to admin wallet
  //       const resPayment = await paymentService.cryptoDeposit({
  //         address: updateBalanceParam.address,
  //         txHash: updateBalanceParam.txHash ?? '',
  //         amount: updateBalanceParam.amount,
  //         tokenType: updateBalanceParam.balanceType,
  //       });

  //       console.log({ resPayment });

  //       if (!resPayment) {
  //         const despositErrorRes = new ServiceResponse(
  //           ResponseStatus.Failed,
  //           'unable deposit',
  //           null,
  //           StatusCodes.INTERNAL_SERVER_ERROR
  //         );
  //         handleServiceResponse(despositErrorRes, res);
  //       }
  //       updateValue = walletValue + updateBalanceParam.amount;
  //     } else {
  //       updateValue = walletValue;
  //     }
  //     const serviceResponse = await userService.updateUserBalance(id, updateParams, updateValue);
  //     handleServiceResponse(serviceResponse, res);
  //   } catch (error) {
  //     console.log(error);
  //     const despositErrorRes = new ServiceResponse(
  //       ResponseStatus.Failed,
  //       'updating balance error',
  //       null,
  //       StatusCodes.INTERNAL_SERVER_ERROR
  //     );
  //     handleServiceResponse(despositErrorRes, res);
  //   }
  // });

  return router;
})();

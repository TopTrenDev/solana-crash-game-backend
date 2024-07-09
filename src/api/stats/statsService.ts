import { StatusCodes } from 'http-status-codes';
import * as web3 from '@solana/web3.js';

import { userRepository } from '@/api/user/userRepository';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';
import { BANKROLL, solConnection } from '@/controllers/solana';
import PaymentTx from '@/common/models/PaymentTx';

interface IStats {
  users: number;
  bankroll: number;
  wager: number;
}

export const statsService = {
  // Retrieves all users from the database
  getStats: async (): Promise<ServiceResponse<IStats>> => {
    try {
      const users = await userRepository.findAllAsync();
      const bankroll = await solConnection.getBalance(BANKROLL.publicKey);
      const wager = await PaymentTx.aggregate([
        {
          $group: {
            _id: null,
            total_amount: { $sum: '$amount' },
          },
        },
      ]);

      return new ServiceResponse(
        ResponseStatus.Success,
        'Stats get',
        {
          users: users.length,
          bankroll: Number((bankroll / web3.LAMPORTS_PER_SOL).toFixed(3)),
          wager: wager[0].total_amount,
        },
        StatusCodes.OK
      );
    } catch (ex) {
      const errorMessage = `Error $${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(
        ResponseStatus.Failed,
        errorMessage,
        { users: 0, bankroll: 0, wager: 0 },
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  },
};

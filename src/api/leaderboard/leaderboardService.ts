import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import User from '@/common/models/User';
import { logger } from '@/server';

import { TLeaderboardDocumentType } from './leaderboardType';

export const leaderboardService = {
  // Retrieves all users from the database
  findAll: async (): Promise<ServiceResponse<TLeaderboardDocumentType[] | null>> => {
    try {
      const users: any = await User.find().select(
        '_id username email leaderboard avatar createdAt hasVerifiedAccount rank'
      );
      if (!users) {
        return new ServiceResponse(ResponseStatus.Failed, 'No leaderboard found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse<TLeaderboardDocumentType[]>(
        ResponseStatus.Success,
        'Leaderboard found',
        users,
        StatusCodes.OK
      );
    } catch (ex) {
      const errorMessage = `Error finding all leaderboards: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  findCounts: async (count: number): Promise<ServiceResponse<{ [key: string]: TLeaderboardDocumentType[] } | null>> => {
    try {
      const leaderboard: { [key: string]: TLeaderboardDocumentType[] } = {};
      const sortCriteria = [
        {
          $match: {
            username: { $ne: null, $ne: '' }, // Match users with a non-null and non-empty username
          },
        },
        {
          $addFields: {
            totalWinAmount: {
              $sum: {
                $map: {
                  input: { $objectToArray: '$leaderboard' },
                  as: 'game',
                  in: {
                    $sum: {
                      $map: {
                        input: { $objectToArray: '$$game.v' },
                        as: 'denom',
                        in: '$$denom.v.winAmount',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        { $sort: { totalWinAmount: -1 as 1 | -1 } },
        { $limit: count },
      ];
      const users = await User.aggregate(sortCriteria).project({
        _id: 1,
        username: 1,
        email: 1,
        stats: 1,
        leaderboard: 1,
        avatar: 1,
        createdAt: 1,
        hasVerifiedAccount: 1,
        rank: 1,
      });
      leaderboard['crash'] = users;
      if (!leaderboard) {
        return new ServiceResponse(ResponseStatus.Failed, 'No leaderboard found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse<{ [key: string]: TLeaderboardDocumentType[] }>(
        ResponseStatus.Success,
        'Leaderboard found',
        leaderboard,
        StatusCodes.OK
      );
    } catch (ex) {
      const errorMessage = `Error finding all leaderboards: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  // Retrieves a single user by their ID
  findById: async (id: string): Promise<ServiceResponse<TLeaderboardDocumentType | null>> => {
    try {
      const user = await User.findById(new mongoose.Types.ObjectId(id)).select(
        '_id username email leaderboard avatar createdAt hasVerifiedAccount rank'
      );
      if (!user) {
        return new ServiceResponse(ResponseStatus.Failed, 'Leaderboard not found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse<TLeaderboardDocumentType>(
        ResponseStatus.Success,
        'Leaderboard found',
        user,
        StatusCodes.OK
      );
    } catch (ex) {
      const errorMessage = `Error finding leaderboard with id ${id}:, ${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};

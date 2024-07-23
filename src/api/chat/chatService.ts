import { StatusCodes } from 'http-status-codes';

import ChatHistory, { ChatHistoryDocument } from '@/common/models/ChatHistory';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { IchatEmitHistory } from '@/common/types/chatHistoryType';
import { logger } from '@/server';
import GameHistory from '@/common/models/GameHistory';

export const chatHistoryService = {
  // Retrieves a single user by their ID
  findById: async (_id: string): Promise<ServiceResponse<ChatHistoryDocument | null>> => {
    try {
      const chatHistory = await ChatHistory.findById(_id);
      if (!chatHistory) {
        return new ServiceResponse(ResponseStatus.Failed, 'Chat history not found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse<ChatHistoryDocument>(
        ResponseStatus.Success,
        'Chat history found',
        chatHistory,
        StatusCodes.OK
      );
    } catch (ex) {
      const errorMessage = `Error finding chat history with id ${_id}:, ${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  fetchEarlierChatHistories: async (date: Date, limit: number): Promise<ServiceResponse<IchatEmitHistory[] | null>> => {
    try {
      const chatHistories = await ChatHistory.find({
        sentAt: { $lt: date }, // $lt selects those documents where the value is less than the specified value
      })
        .populate(
          'user',
          '_id username avatar hasVerifiedAccount createdAt stats' // Adjust the fields according to what user information you need
        )
        // .lookup({ from: 'GameHistory', localField: 'user', foreignField: '_id', as: 'gameHistories' })
        .sort({ sentAt: -1 })
        .limit(limit)
        .exec();
      chatHistories.sort((a: any, b: any) => a.sentAt.getTime() - b.sentAt.getTime());
      if (chatHistories.length == 0) {
        return new ServiceResponse(ResponseStatus.Success, 'No chat history found', [], StatusCodes.OK);
      }
      const updatedChatHistories = await Promise.all(
        chatHistories.map(async (chat: any) => {
          const histories = await GameHistory.find({ player: chat.user.id });
          return {
            ...chat._doc,
            user: {
              ...chat._doc.user._doc,
              histories,
            },
          };
        })
      );

      return new ServiceResponse<IchatEmitHistory[]>(
        ResponseStatus.Success,
        'Found chat histories',
        updatedChatHistories as unknown as IchatEmitHistory[],
        StatusCodes.OK
      );
    } catch (ex) {
      const errorMessage = `Error finding chat histories that sent earlier than ${date}: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};

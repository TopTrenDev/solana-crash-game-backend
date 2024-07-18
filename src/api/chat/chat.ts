// Require Dependencies
import colors from 'colors';
import jwt, { JwtPayload } from 'jsonwebtoken';
import type { Server, Socket } from 'socket.io';

import ChatHistory from '@/common/models/ChatHistory';
import type { UserDocumentType } from '@/common/models/User';
import User from '@/common/models/User';
import type { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from '@/common/types';
import { IChatUser } from '@/common/types/userType';
import { authentication } from '@/config';
import throttlerController from '@/controllers/throttler';

import { chatHistoryService } from './chatService';

// Get socket.io instance
const listen = (io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
  // Listen for new websocket connections
  io.of('/chat').on(
    'connection',
    async (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
      let loggedIn = false;
      let user: UserDocumentType | null = null;
      // Throttle connnections
      socket.use(throttlerController(socket));
      // const newUser = new User();
      // newUser.save();

      socket.on('get-chat-history', async (sentAt: Date) => {
        const previousChatHistoryResponse = await chatHistoryService.fetchEarlierChatHistories(
          sentAt ? sentAt : new Date(),
          12
        );
        if (previousChatHistoryResponse.statusCode == 200) {
          socket.emit('send-chat-history', {
            message: previousChatHistoryResponse.message,
            chatHistories: previousChatHistoryResponse.responseObject!,
          });
        } else {
          socket.emit('notify-error', 'Error ocurred when fetched previous chat histories!');
        }
      });

      // Authenticate websocket connection
      socket.on('auth', async (token: string) => {
        if (!token) {
          loggedIn = false;
          user = null;
          return socket.emit('error', 'No authentication token provided, authorization declined');
        }

        try {
          // Verify token
          const decoded = jwt.verify(token, authentication.jwtSecret) as JwtPayload;
          user = await User.findOne({ _id: decoded.userId });

          if (user) {
            if (parseInt(user.banExpires) > new Date().getTime()) {
              loggedIn = false;
              user = null;
              return socket.emit('user banned');
            } else {
              loggedIn = true;
              socket.join(String(user._id));
              // socket.emit("notify-success", "Successfully authenticated!");
            }
          }
          // return socket.emit("alert success", "Socket Authenticated!");
        } catch (error) {
          loggedIn = false;
          console.log('error handle', error);
          user = null;
          return socket.emit('notify-error', 'Authentication token is not valid');
        }
      });

      // Check for users ban status
      socket.use(async (packet, next) => {
        if (loggedIn && user) {
          try {
            const dbUser = await User.findOne({ _id: user.id });

            // Check if user is banned
            if (dbUser && parseInt(dbUser.banExpires) > new Date().getTime()) {
              return socket.emit('user banned');
            } else {
              return next();
            }
          } catch (error) {
            return socket.emit('user banned');
          }
        } else {
          return next();
        }
      });

      /**
       * @description New message
       *
       * @param {string} message message
       */
      socket.on('message', async (message: string) => {
        try {
          if (!loggedIn) return socket.emit('notify-error', `You are not logged in!`);

          const dbUser: any = await User.findOne({ _id: user?._id });
          const newChatHistory = await ChatHistory.create({
            message: message,
            user: dbUser?.id!,
          });

          const userdata: IChatUser = {
            _id: dbUser?._id!,
            username: dbUser?.username!,
            avatar: dbUser?.avatar!,
            hasVerifiedAccount: dbUser?.hasVerifiedAccount!,
            createdAt: dbUser?.created!,
          };
          const emitData = {
            _id: newChatHistory._id,
            user: userdata,
            message: message,
            sentAt: newChatHistory.sentAt,
          };

          io.of('/chat').emit('message', emitData);
        } catch (error) {
          console.log(colors.red(`Chat >> a error occured : ${String(error)}`));
          return socket.emit('notify-error', `An error is occured on save chat history!`);
        }
      });
    }
  );
};

// Export functions
export { listen };

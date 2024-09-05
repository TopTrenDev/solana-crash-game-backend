import { Server, Socket } from 'socket.io';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import User, { UserDocumentType } from '@/common/models/User';
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from '@/common/types';
import throttlerController from '@/controllers/throttler';
import { authentication } from '@/config';
import { userRepository } from './userRepository';

let users: { [id: string]: Socket | null } = {};
export const listen = (io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
  // Listen for new websocket connections
  io.of('/user').on(
    'connection',
    (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
      // Throttle connections
      socket.use(throttlerController(socket));

      // Authenticate websocket connection
      socket.on('auth', async (token: string) => {
        console.log('socket.id', socket.id);
        if (!token) {
          users[socket.id] = null;
          return socket.emit('notify-error', 'No authentication token provided, authorization declined');
        }

        try {
          // Verify token
          const decoded = jwt.verify(token, authentication.jwtSecret) as JwtPayload;

          const updatedUser = await User.findOne({ _id: decoded.userId });
          socket.join(updatedUser!._id);
          users[updatedUser!._id] = socket;
          console.log(`Socket >> User ${updatedUser!.username} is connected`);
          return socket.to(updatedUser!._id).emit('credit-balance', { credit: updatedUser!.credit });
        } catch (error) {
          console.log('error handle', error);
          users[socket.id] = null;
          return socket.emit('notify-error', 'Authentication token is not valid');
        }
      });

      socket.on(
        'credit-tip',
        async ({ username, tipsAmount, password }: { username: string; tipsAmount: number; password: string }) => {
          tipsAmount = Number(tipsAmount);
          const token = socket.handshake.auth.token;
          if (!token) {
            return socket.emit('user-join-error', 'No authentication token provided!');
          }
          const decoded = jwt.verify(token, authentication.jwtSecret) as JwtPayload;
          const user = await User.findById(decoded.userId);
          if (!user) {
            return socket.emit('user-join-error', 'You are not logged in!');
          }

          if (typeof username !== 'string' || username === '')
            return socket.emit('credit-tip-error', 'Invalid username!');
          else if (tipsAmount === 0) return socket.emit('credit-tip-error', 'Invalid tips amount!');
          else if (typeof password !== 'string' || password === '')
            return socket.emit('credit-tip-error', 'Invalid password!');

          console.log(`Tips: ${tipsAmount} sola is tipping to {${username}} by user {${user.username}}`);
          const tipsFee = 1;

          try {
            const receiver = await userRepository.findByUsernameAsync(username);
            if (!receiver) {
              return socket.emit('credit-tip-error', 'Username not found!');
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
              return socket.emit('credit-tip-error', 'Incorrect password!');
            }

            if (user.credit < tipsAmount + tipsFee) {
              return socket.emit('credit-tip-error', 'Insufficient balance!');
            }

            await User.findByIdAndUpdate(user._id, { $inc: { credit: -(tipsAmount + tipsFee) } });
            socket.to(user._id).emit('credit-balance', { credit: user.credit - (tipsAmount + tipsFee) });
            await User.findByIdAndUpdate(receiver._id, { $inc: { credit: tipsAmount } });
            socket.to(receiver._id).emit('credit-balance', { credit: receiver.credit + tipsAmount });
            console.log('Tips: Success');
            return socket.emit('credit-tip-success');
          } catch (ex) {
            console.error(ex);
            const errorMessage = `Error tipping user with userId ${user._id}:, ${(ex as Error).message}`;
            return socket.emit('credit-tip-error', errorMessage);
          }
        }
      );
    }
  );
};

import User from '@/common/models/User';
import { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from '@/common/types';
import { Server, Socket } from 'socket.io';
import throttlerController from '@/controllers/throttler';

export const listen = (io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
  // Listen for new websocket connections
  io.of('/user').on(
    'connection',
    (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
      // Throttle connnections
      socket.use(throttlerController(socket));

      socket.on('credit-balance', async (userId: string) => {
        if (typeof userId !== 'string' || userId === '') return socket.emit('site-join-error', 'Invalid userId!');

        const user = await User.findById(userId);
        return socket.emit('credit-balance', { username: user?.username || 'unknownd', credit: user?.credit || 0 });
      });
    }
  );
};

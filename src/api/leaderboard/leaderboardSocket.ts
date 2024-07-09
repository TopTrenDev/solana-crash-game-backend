// Require Dependencies
import colors from 'colors';
import type { Server, Socket } from 'socket.io';

import type { UserDocumentType } from '@/common/models/User';
import type { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from '@/common/types';
import throttlerController from '@/controllers/throttler';

import { leaderboardService } from './leaderboardService';

// Get socket.io instance
const listen = (io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
  // Listen for new websocket connections
  io.of('/leaderboard').on(
    'connection',
    async (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
      const loggedIn = false;
      const user: UserDocumentType | null = null;
      // Throttle connnections
      socket.use(throttlerController(socket));

      const leaderboardResponse = await leaderboardService.findCounts(10);
      if (leaderboardResponse.statusCode == 200) {
        socket.emit('leaderboard-fetch-all', {
          message: leaderboardResponse.message,
          leaderboard: leaderboardResponse.responseObject!,
        });
      } else {
        socket.emit('notify-error', 'Error ocurred when fetched leaderboard!');
      }

      console.log(colors.cyan('Leaderboard >> a user connected'));
    }
  );

  // Emit to client every 1 second
  const emitLeaderboard = async () => {
    const start = Date.now();
    const leaderboardResponse = await leaderboardService.findCounts(10);

    if (leaderboardResponse.statusCode == 200) {
      io.of('/leaderboard').emit('leaderboard-fetch-all', {
        message: leaderboardResponse.message,
        leaderboard: leaderboardResponse.responseObject!,
      });
    } else {
      io.of('/leaderboard').emit('notify-error', 'Error ocurred when fetched leaderboard!');
    }

    const elapsed = Date.now() - start;
    setTimeout(emitLeaderboard, Math.max(0, 1000 - elapsed));
  };

  emitLeaderboard();
};

// Export functions
export { listen };

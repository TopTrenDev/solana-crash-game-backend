import http from 'http';
import { logger } from '@/server';
import { Server } from 'socket.io';
import type { Express } from 'express';
import type { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from '@/common/types';

import * as crashController from '@/api/crash/crash';

// Configure Socket.io
const startSocketServer = (httpServer: http.Server, app: Express) => {
  try {
    // Main socket.io instance
    const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
      cors: { origin: '*', methods: ['GET', 'POST'] },
    });

    // Make the socket connection accessible at the routes
    app.set('socketio', io);

    io.on('connection', (socket) => {
      console.log('a user connected');
      socket.emit('noArg');
      socket.emit('basicEmit', 1, '2', Buffer.from([3]));
      socket.emit('withAck', '4', (e) => {
        // e is inferred as number
      });

      // works when broadcast to all
      io.emit('noArg');

      // works when broadcasting to a room
      io.to('room1').emit('basicEmit', 1, '2', Buffer.from([3]));
    });

    // Start listeners
    crashController.listen(io);
    // exampleController.listen(io);

    console.log('WebSocket >>', 'Connected!');
  } catch (error: any) {
    console.log(`WebSocket ERROR >> ${error.message}`);

    // Exit current process with failure
    process.exit(1);
  }
};

// Export functions
export { startSocketServer };

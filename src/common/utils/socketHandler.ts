import type { Express } from 'express';
import http from 'http';
import { Server } from 'socket.io';

import type { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from '@/common/types';

import * as crashController from '@/api/crash/crash';
import * as chatController from '@/api/chat/chat';

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
    });

    // Start listeners
    crashController.listen(io);
    chatController.listen(io);

    console.log('WebSocket >>', 'Connected!');
  } catch (error: any) {
    console.log(`WebSocket ERROR >> ${error.message}`);

    // Exit current process with failure
    process.exit(1);
  }
};

// Export functions
export { startSocketServer };

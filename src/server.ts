import http from 'http';
import cors from 'cors';
import express, { Express } from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import { pino } from 'pino';

import errorHandler from '@/common/middleware/errorHandler';
import rateLimiter from '@/common/middleware/rateLimiter';
import requestLogger from '@/common/middleware/requestLogger';
import { startSocketServer } from '@/common/utils/socketHandler';
import router from './api';

const logger = pino({ name: 'server start' });
const app: Express = express();

// Set the application to trust the reverse proxy
app.set('trust proxy', true);

// Middlewares
app.use(cors({ origin: '*', credentials: true }));
app.use(helmet());
app.use(rateLimiter);
app.use(bodyParser.json());

// Request logging
app.use(requestLogger);

// Router
app.use('/api/v1', router);

// Error handlers
app.use(errorHandler());

// Start WebSocket server
const httpServer = http.createServer(app);
startSocketServer(httpServer, app);

export { app, logger, httpServer };

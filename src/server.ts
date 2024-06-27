import http from 'http';
import cors from 'cors';
import express, { Express } from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import { pino } from 'pino';

import { healthCheckRouter } from '@/api/healthCheck/healthCheckRouter';
import { userRouter } from '@/api/user/userRouter';
import { authRouter } from '@/api/auth/authRouter';
import { openAPIRouter } from '@/api-docs/openAPIRouter';
import errorHandler from '@/common/middleware/errorHandler';
import rateLimiter from '@/common/middleware/rateLimiter';
import requestLogger from '@/common/middleware/requestLogger';
import { startSocketServer } from '@/common/utils/socketHandler';

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

// Routes
app.use('/health-check', healthCheckRouter);
app.use('/users', userRouter);
app.use('/auth', authRouter);

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());

// Start WebSocket server
const httpServer = http.createServer(app);
startSocketServer(httpServer, app);

export { app, logger, httpServer };

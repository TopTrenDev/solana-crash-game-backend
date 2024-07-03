import express, { Express } from 'express';
import http from 'http';
import { CronJob } from 'cron';
import { pino } from 'pino';

import { env } from '@/common/utils/envConfig';
import connectDatabase from '@/common/utils/connetDatabase';
import { depositService } from '@/api/deposit/depositService';

const app: Express = express();
const logger = pino({ name: 'Deposit detector start' });

process.title = 'solacrash-depositor-api';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const PORT = process.env.DEPOSITOR_PORT || 8085;

connectDatabase();

const httpServer = http.createServer(app);

httpServer.listen(PORT, () => {
  const { NODE_ENV, HOST, PORT } = env;
  logger.info(
    `Depositor server (${NODE_ENV}) running on port http://${HOST}:${PORT} with ${IS_PRODUCTION ? 'Production' : 'Development'} mode`
  );
});

const cronjob = new CronJob(
  // '*/10 * * * * *', // every 10s
  '* * * * *', // every minute
  depositService.detectDeposit
);

cronjob.start();
console.log('Cron job is running');

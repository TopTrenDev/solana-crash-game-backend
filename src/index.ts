import { env } from '@/common/utils/envConfig';
import { logger, httpServer } from '@/server';
import connectDatabase from '@/common/utils/connetDatabase';

process.title = 'solacrash -api';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 8080;

connectDatabase();

const server = httpServer.listen(PORT, () => {
  const { NODE_ENV, HOST, PORT } = env;
  logger.info(
    `Server (${NODE_ENV}) running on port http://${HOST}:${PORT} with ${IS_PRODUCTION ? 'Production' : 'Development'} mode`
  );
});

const onCloseSignal = () => {
  logger.info('sigint received, shutting down');
  server.close(() => {
    logger.info('server closed');
    process.exit();
  });
  setTimeout(() => process.exit(1), 10000).unref(); // Force shutdown after 10s
};

process.on('SIGINT', onCloseSignal);
process.on('SIGTERM', onCloseSignal);

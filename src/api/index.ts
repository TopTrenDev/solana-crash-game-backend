import express, { Router } from 'express';

import { openAPIRouter } from '@/api-docs/openAPIRouter';

import { authRouter } from './auth/authRouter';
import { healthCheckRouter } from './healthCheck/healthCheckRouter';
import { userRouter } from './user/userRouter';
import { cashierRouter } from './cashier/cashierRouter';
import { statsRouter } from './stats/statsRouter';

const router = express.Router();

interface IRoute {
  path: string;
  route: Router;
}

const defaultIRoute: IRoute[] = [
  {
    path: '/health-check',
    route: healthCheckRouter,
  },
  {
    path: '/users',
    route: userRouter,
  },
  {
    path: '/auth',
    route: authRouter,
  },
  {
    path: '/cashier',
    route: cashierRouter,
  },
  {
    path: '/stats',
    route: statsRouter,
  },
];

const devIRoute: IRoute[] = [
  // IRoute available only in development mode
  {
    path: '/docs',
    route: openAPIRouter,
  },
];

defaultIRoute.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (process.env.NODE_ENV === 'development') {
  devIRoute.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;

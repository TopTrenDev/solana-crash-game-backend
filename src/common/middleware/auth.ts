// Import Dependencies
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import User from '@/common/models/User';
import { authentication } from '@/config/index';

interface DecodedUser {
  id: string;
}

interface AuthRequest extends Request {
  authToken?: string;
  user?: any;
}

// Middleware to validate JWT
const validateJWT = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Get token from header
  const token = req.header('Authorization');
  const jwtToken = token?.split('Bearer ')[1];

  // Check if no token
  if (!jwtToken) {
    res.status(401);
    return next(new Error('No authentication token provided, authorization declined'));
  }

  // Verify token
  try {
    const decoded = jwt.verify(jwtToken, authentication.jwtSecret) as any;
    const dbUser = await User.findOne({ _id: decoded.userId });

    if (dbUser && parseInt(dbUser.banExpires) > new Date().getTime()) {
      // console.log("banned");
      return res.status(401).json({
        msg: 'You are banned!',
        expires: parseInt(dbUser.banExpires),
      });
    }

    req.authToken = jwtToken;
    req.user = { id: decoded.userId };
    return next();
  } catch (error) {
    console.log(error);
    res.status(401);
    return next(new Error('Authentication token is not valid'));
  }
};

// Export middlewares
export { validateJWT, AuthRequest };

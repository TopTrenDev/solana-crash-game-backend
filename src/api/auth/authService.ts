import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcryptjs';

import { userRepository } from '@/api/user/userRepository';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';
import { UserDocumentType } from '@/common/models/User';
import { authentication } from '@/config';
import jwt from 'jsonwebtoken';
import { IGenerateParams, TSignIn, TSignUp } from './authType';
import createToken from '@/common/utils/createToken';
import { ObjectId } from 'mongoose';

interface ILoginResponse {
  auth: {
    accessToken: string;
  };
  user: UserDocumentType;
}

export const authService = {
  // Register new user
  register: async ({
    username,
    email,
    password,
    confirmPassword,
  }: TSignUp): Promise<ServiceResponse<UserDocumentType | null>> => {
    try {
      if (password !== confirmPassword) {
        return new ServiceResponse(ResponseStatus.Failed, 'Passwords do not match', null, StatusCodes.BAD_REQUEST);
      }
      let user = await userRepository.findByEmailAsync(email);
      if (user) {
        return new ServiceResponse(ResponseStatus.Failed, 'User already exists', null, StatusCodes.BAD_REQUEST);
      }

      user = await userRepository.findByUsernameAsync(username);
      if (user) {
        return new ServiceResponse(ResponseStatus.Failed, 'Username already exists', null, StatusCodes.BAD_REQUEST);
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await userRepository.createUser(username, email, hashedPassword);

      return new ServiceResponse<UserDocumentType>(ResponseStatus.Success, 'Registered', newUser, StatusCodes.OK);
    } catch (ex) {
      const errorMessage = `Error registering user with username ${username}:, ${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  // login user
  login: async ({ email, password }: TSignIn): Promise<ServiceResponse<ILoginResponse | null>> => {
    try {
      const user = await userRepository.findByEmailAsync(email);
      if (!user) {
        return new ServiceResponse(ResponseStatus.Failed, 'User not found', null, StatusCodes.BAD_REQUEST);
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return new ServiceResponse(ResponseStatus.Failed, 'Incorrect password', null, StatusCodes.BAD_REQUEST);
      }

      const authToken = tokenGenerate({
        userId: user._id as ObjectId,
      });

      return new ServiceResponse(ResponseStatus.Success, 'Logged in', { auth: authToken, user }, StatusCodes.OK);
    } catch (ex) {
      const errorMessage = `Error logging user with email ${email}:, ${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};

const { jwtSecret, jwtExpirationTime } = authentication;

const tokenGenerate = (params: IGenerateParams, expiresIn?: number) => {
  const accessExpiresIn = expiresIn || Number(jwtExpirationTime).valueOf();
  const refreshExpiresIn = expiresIn || Number(jwtExpirationTime).valueOf();
  const access = createToken(params, jwtSecret, accessExpiresIn);
  const refresh = createToken(params, jwtSecret, refreshExpiresIn);

  return {
    accessToken: access.token,
    refreshToken: refresh.token,
    expiresIn: access.expiresIn,
  };
};

import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcryptjs';

import { userRepository } from '@/api/user/userRepository';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';
import User, { UserDocumentType } from '@/common/models/User';
import mongoose from 'mongoose';

export const userService = {
  // Retrieves all users from the database
  findAll: async (): Promise<ServiceResponse<UserDocumentType[] | null>> => {
    try {
      const users = await userRepository.findAllAsync();
      if (!users) {
        return new ServiceResponse(ResponseStatus.Failed, 'No Users found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse<UserDocumentType[]>(ResponseStatus.Success, 'Users found', users, StatusCodes.OK);
    } catch (ex) {
      const errorMessage = `Error finding all users: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  // Retrieves a single user by their ID
  findById: async (id: number): Promise<ServiceResponse<UserDocumentType | null>> => {
    try {
      const user = await userRepository.findByIdAsync(id);
      if (!user) {
        return new ServiceResponse(ResponseStatus.Failed, 'User not found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse<UserDocumentType>(ResponseStatus.Success, 'User found', user, StatusCodes.OK);
    } catch (ex) {
      const errorMessage = `Error finding user with id ${id}:, ${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  // createUser
  createUser: async (userData: Partial<UserDocumentType>): Promise<ServiceResponse<UserDocumentType | null>> => {
    try {
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }
      const newUser = await userRepository.createUser(userData);
      if (!newUser) {
        return new ServiceResponse(ResponseStatus.Failed, 'User created Failed', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse<UserDocumentType>(
        ResponseStatus.Success,
        'Create User success',
        newUser,
        StatusCodes.OK
      );
    } catch (ex) {
      const errorMessage = `Error creating new User`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  // updateUser
  updateUser: async (
    id: string,
    userData: Partial<UserDocumentType>
  ): Promise<ServiceResponse<UserDocumentType | null>> => {
    try {
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
      }
      const updateUser = await User.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(id) }, userData);
      if (!updateUser) {
        return new ServiceResponse(ResponseStatus.Failed, 'User updated Failed', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse<UserDocumentType>(
        ResponseStatus.Success,
        'Update User success',
        updateUser,
        StatusCodes.OK
      );
    } catch (ex) {
      const errorMessage = `Error updating new User`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  // get balance
  getCreditBalance: async (userId: string): Promise<ServiceResponse<UserDocumentType | null>> => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        return new ServiceResponse(ResponseStatus.Failed, 'User not found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse<UserDocumentType>(
        ResponseStatus.Success,
        'Fetch user credit balance success',
        user.credit,
        StatusCodes.OK
      );
    } catch (ex) {
      const errorMessage = `Error updating new User`;
      logger.error(errorMessage);
      console.error(ex);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};

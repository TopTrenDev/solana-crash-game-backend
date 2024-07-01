// import { User } from '@/api/user/userModel';
import User, { UserDocumentType } from '@/common/models/User';

// export const users: User[] = [
//   { id: 1, username: 'Alice', email: 'alice@example.com', age: 42, createdAt: new Date(), updatedAt: new Date() },
//   { id: 2, username: 'Bob', email: 'bob@example.com', age: 21, createdAt: new Date(), updatedAt: new Date() },
// ];

export const userRepository = {
  findAllAsync: async (): Promise<UserDocumentType[]> => {
    return User.find();
  },

  findByIdAsync: async (id: number): Promise<UserDocumentType | null> => {
    return User.findById(id) || null;
  },

  findByEmailAsync: async (email: string): Promise<UserDocumentType | null> => {
    return User.findOne({ email }) || null;
  },

  findByUsernameAsync: async (username: string): Promise<UserDocumentType | null> => {
    return User.findOne({ username }) || null;
  },

  createUser: async (username: string, email: string, password: string): Promise<UserDocumentType> => {
    const user = new User({
      username,
      email,
      password,
      credit: 1000,
    });
    await user.save();
    return user;
  },
};

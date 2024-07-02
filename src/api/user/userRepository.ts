// import { User } from '@/api/user/userModel';
import User, { UserDocumentType } from '@/common/models/User';
import { createWallet, importWallet } from '@/controllers/solana';

// export const users: User[] = [
//   { id: 1, username: 'Alice', email: 'alice@example.com', age: 42, createdAt: new Date(), updatedAt: new Date() },
//   { id: 2, username: 'Bob', email: 'bob@example.com', age: 21, createdAt: new Date(), updatedAt: new Date() },
// ];

export const userRepository = {
  findAllAsync: async (): Promise<UserDocumentType[]> => {
    return User.find().select(['-password', '-wallet']);
  },

  findByIdAsync: async (id: number): Promise<UserDocumentType | null> => {
    return User.findById(id).select(['-password', '-wallet']) || null;
  },

  findByEmailAsync: async (email: string): Promise<UserDocumentType | null> => {
    return User.findOne({ email }).select(['-wallet.privateKey']) || null;
  },

  findByUsernameAsync: async (username: string): Promise<UserDocumentType | null> => {
    return User.findOne({ username }).select(['-password', '-wallet']) || null;
  },

  createUser: async ({
    username,
    email,
    password,
  }: {
    username: string;
    email: string;
    password: string;
  }): Promise<UserDocumentType> => {
    const newWallet = createWallet();
    const user = new User({
      username,
      email,
      password,
      wallet: newWallet,
      credit: 1000,
    });
    await user.save();
    return user.toObject({ virtuals: false, select: ['-password', '-wallet'] });
  },
};

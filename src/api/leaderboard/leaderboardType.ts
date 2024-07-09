import { UserDocumentType } from '@/common/models/User';

export type TLeaderboardDocumentType = Pick<
  UserDocumentType,
  '_id' | 'username' | 'email' | 'leaderboard' | 'avatar' | 'created' | 'hasVerifiedAccount' | 'rank'
>;

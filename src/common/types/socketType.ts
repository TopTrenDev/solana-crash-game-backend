import { Types } from 'mongoose';
import { CrashGameDocument } from '../models/CrashGame';
import { FormattedGameHistoryType, PendingBetType, FormattedPlayerBetType, BetType } from './crashGameType';
import { IChatUser } from './userType';
import { IchatEmitHistory } from './chatHistoryType';

export interface ServerToClientEvents {
  error: (data: string) => void;
  'user banned': () => void;
  'notify-error': (data: string) => void;
  'game-join-error': (data: string) => void;
  'update-wallet': (data: number, denom: string) => void;
  'bet-cashout-error': (data: string) => void;
  'bet-cashout-success': (result: any) => void;
  'game-call-bot-error': (error: string) => void;
  'game-call-bot-success': () => void;

  //crashgame Events
  'game-status': (data: { players: FormattedPlayerBetType[]; game_status: number }) => void;
  'game-bets': (bets: PendingBetType[]) => void;
  'game-starting': (data: { _id: string | null; privateHash: string | null; timeUntilStart?: number }) => void;
  'game-start': (data: { publicSeed: string }) => void;
  'bet-cashout': (data: {
    userdata: BetType;
    status: number;
    stoppedAt: number | undefined;
    winningAmount: number;
  }) => void;
  'game-end': (data: { game: FormattedGameHistoryType }) => void;
  'game-tick': (data: number) => void;
  'crashgame-join-success': (data: FormattedPlayerBetType) => void;
  'previous-crashgame-history': (history: Pick<CrashGameDocument, '_id' | 'crashPoint' | 'players'>[]) => void;
  'auto-crashgame-join-success': (data: string) => void;
  connection_kicked: () => void;

  'get-crashgame-history-error': (data: string) => void;
  'game-join-success': (data: FormattedPlayerBetType) => void;
  'previous-crashgame-history-response': (result: any) => void;

  //chat
  message: (data: { _id: Types.ObjectId; user: IChatUser; message: string; sentAt: Date }) => void;
  'send-chat-history': (data: { message: string; chatHistories: IchatEmitHistory[] }) => void;
}

export interface ClientToServerEvents {
  hello: () => void;

  //crashgameevents
  auth: (token: string) => void;
  'auto-crashgame-bet': (data: { betAmount: number; denom: string; cashoutPoint: number; count: number }) => void;
  'join-crash-game': (data: { target: number; betAmount: number; denom: string }) => void;
  'bet-cashout': () => void;
  'previous-crashgame-history': (count: number) => void;
  'cancel-auto-bet': () => void;

  //chat
  'chat-history': () => void;
  'join-chat': (_id: string) => void;
  'get-chat-history': (sentAt: Date) => void;
  message: (message: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  lastAccess?: number;
  markedForDisconnect?: boolean;
}

export type ServerType = {
  clientToServerEvents: ClientToServerEvents;
  serverToClientEvents: ServerToClientEvents;
  interServerEvents: InterServerEvents;
  socketData: SocketData;
};

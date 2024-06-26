import { FormattedGameHistoryType, PendingBetType, FormattedPlayerBetType } from './crashGameType';

export interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  error: (data: string) => void;
  'game-bets': (bets: PendingBetType[]) => void;
  'game-starting': (data: { _id: string | null; privateHash: string | null; timeUntilStart?: number }) => void;
  'game-start': (data: { publicSeed: string }) => void;
  'notify-error': (data: string) => void;
  'bet-cashout': (data: {
    playerID: string;
    status: number;
    stoppedAt: number | undefined;
    winningAmount: number;
  }) => void;
  'update-wallet': (data: number) => void;
  'game-end': (data: { game: FormattedGameHistoryType }) => void;
  'game-tick': (data: number) => void;
  'user banned': () => void;
  'get-crashgame-history-error': (data: string) => void;
  'game-join-error': (data: string) => void;
  'game-join-success': (data: FormattedPlayerBetType) => void;
  'bet-cashout-error': (data: string) => void;
  'bet-cashout-success': (result: any) => void;
  'previous-crashgame-history-response': (result: any) => void;
  connection_kicked: () => void;
}

export interface ClientToServerEvents {
  hello: () => void;
  auth: (token: string) => void;
  'previous-crashgame-history': (limit: number) => void;
  'join-game': (target: number, betAmount: number) => void;
  'bet-cashout': () => void;
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

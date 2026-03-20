import type { Game } from './game';

export interface Room {
  code: string;
  gameId: string;
  createdAt: number;
  lastActivity: number;
  game: Game;
}

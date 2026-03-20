import type { ID, Game, ScoreRow } from '../types/game';

export type GameAction =
  | { type: 'SET_SCORE'; rowId: ID; playerId: ID; value: number | null; note?: string }
  | { type: 'ADD_PLAYER'; name: string; color: string }
  | { type: 'REMOVE_PLAYER'; playerId: ID }
  | { type: 'UPDATE_PLAYER'; playerId: ID; name?: string; color?: string }
  | { type: 'REORDER_PLAYERS'; playerIds: ID[] }
  | { type: 'ADD_ROW'; row: Omit<ScoreRow, 'id' | 'order'> }
  | { type: 'REMOVE_ROW'; rowId: ID }
  | { type: 'UPDATE_ROW'; rowId: ID; updates: Partial<Pick<ScoreRow, 'label' | 'type' | 'scoringRule'>> }
  | { type: 'REORDER_ROWS'; rowIds: ID[] }
  | { type: 'ADD_DICE_ROLL'; dice: { sides: number; result: number }[]; total: number; label?: string }
  | { type: 'SET_STATUS'; status: Game['status'] }
  | { type: 'SET_NAME'; name: string }
  | { type: 'REMOTE_UPDATE'; game: Game }
  | { type: 'LOAD_GAME'; game: Game };

export type GameListAction =
  | { type: 'ADD_GAME'; game: Game }
  | { type: 'REMOVE_GAME'; gameId: ID }
  | { type: 'UPDATE_GAME'; game: Game }
  | { type: 'LOAD_GAMES'; games: Game[] };

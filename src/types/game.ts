export type ID = string;

export interface ScoreEntry {
  id: ID;
  playerId: ID;
  rowId: ID;
  value: number | null;
  note?: string;
  timestamp: number;
}

export interface Player {
  id: ID;
  name: string;
  color: string;
  order: number;
}

export type ScoreRowType = 'round' | 'category' | 'group';

export interface ScoringRule {
  type: 'manual' | 'sum' | 'formula' | 'bonus';
  sourceRowIds?: ID[];
  formula?: string;
  min?: number;
  max?: number;
  allowDecimals?: boolean;
}

export interface ScoreRow {
  id: ID;
  type: ScoreRowType;
  label: string;
  order: number;
  parentId: ID | null;
  scoringRule?: ScoringRule;
}

export interface DiceRoll {
  id: ID;
  dice: { sides: number; result: number }[];
  total: number;
  timestamp: number;
  label?: string;
}

export interface Game {
  id: ID;
  name: string;
  presetId?: ID;
  players: Player[];
  rows: ScoreRow[];
  scores: Record<string, ScoreEntry>;
  diceHistory: DiceRoll[];
  status: 'active' | 'completed';
  createdAt: number;
  updatedAt: number;
  roomCode?: string;
}

export function scoreKey(rowId: ID, playerId: ID): string {
  return `${rowId}_${playerId}`;
}

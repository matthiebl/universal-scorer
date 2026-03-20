import type { ScoreRow, ID } from './game';

export interface Preset {
  id: ID;
  name: string;
  description?: string;
  suggestedPlayerCount?: { min: number; max: number };
  rows: Omit<ScoreRow, 'id'>[];
  isBuiltIn: boolean;
  isPublic: boolean;
  createdAt: number;
}

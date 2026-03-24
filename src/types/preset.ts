import type { ScoreRow, ID } from './game';

export interface Preset {
  id: ID;
  name: string;
  description?: string;
  suggestedPlayerCount?: { min: number; max: number };
  rows: Omit<ScoreRow, 'id'>[];
  increments?: number[];
  isBuiltIn: boolean;
  isPublic: boolean;
  createdAt: number;
  /** Set when the user submits this preset for community review. */
  submittedAt?: number;
  /** Set by an admin after reviewing a submitted preset. */
  approvedAt?: number;
  /** Timestamp when this was published to Firestore (legacy compat). */
  publishedAt?: number;
}

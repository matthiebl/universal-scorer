import type { Preset } from '../types/preset';

export const scrabblePreset: Preset = {
  id: 'builtin-scrabble',
  name: 'Scrabble',
  description: 'Score each turn across up to 15 rounds',
  suggestedPlayerCount: { min: 2, max: 4 },
  isBuiltIn: true,
  isPublic: false,
  createdAt: 0,
  rows: Array.from({ length: 15 }, (_, i) => ({
    type: 'round' as const,
    label: `Round ${i + 1}`,
    order: i,
    parentId: null,
  })),
};

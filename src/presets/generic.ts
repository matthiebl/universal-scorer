import type { Preset } from '../types/preset';

export const genericPreset: Preset = {
  id: 'builtin-generic',
  name: 'Generic Rounds',
  description: 'Simple numbered rounds — works for most games',
  isBuiltIn: true,
  isPublic: false,
  createdAt: 0,
  rows: Array.from({ length: 10 }, (_, i) => ({
    type: 'round' as const,
    label: `Round ${i + 1}`,
    order: i,
    parentId: null,
  })),
};

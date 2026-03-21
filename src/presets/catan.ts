import type { Preset } from '../types/preset';

export const catanPreset: Preset = {
  id: 'builtin-catan',
  name: 'Catan',
  description: 'Track victory points across settlements, cities, roads, army, and dev cards',
  suggestedPlayerCount: { min: 3, max: 4 },
  isBuiltIn: true,
  isPublic: false,
  createdAt: 0,
  rows: [
    { type: 'category', label: 'Settlements', order: 0, parentId: null },
    { type: 'category', label: 'Cities', order: 1, parentId: null },
    { type: 'category', label: 'Longest Road', order: 2, parentId: null },
    { type: 'category', label: 'Largest Army', order: 3, parentId: null },
    { type: 'category', label: 'Dev Card VPs', order: 4, parentId: null },
    { type: 'category', label: 'Other VPs', order: 5, parentId: null },
  ],
};

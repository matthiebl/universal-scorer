import type { Preset } from '../types/preset';

export const yahtzeePreset: Preset = {
  id: 'builtin-yahtzee',
  name: 'Yahtzee',
  description: 'Classic Yahtzee with upper/lower sections and automatic bonus calculation',
  suggestedPlayerCount: { min: 2, max: 6 },
  isBuiltIn: true,
  isPublic: false,
  createdAt: 0,
  rows: [
    { type: 'group', label: 'Upper Section', order: 0, parentId: null },
    { type: 'category', label: 'Aces', order: 1, parentId: null },
    { type: 'category', label: 'Twos', order: 2, parentId: null },
    { type: 'category', label: 'Threes', order: 3, parentId: null },
    { type: 'category', label: 'Fours', order: 4, parentId: null },
    { type: 'category', label: 'Fives', order: 5, parentId: null },
    { type: 'category', label: 'Sixes', order: 6, parentId: null },
    {
      type: 'category',
      label: 'Upper Bonus',
      order: 7,
      parentId: null,
      scoringRule: {
        type: 'bonus',
        formula: '(Aces + Twos + Threes + Fours + Fives + Sixes) >= 63 ? 35 : 0',
      },
    },
    { type: 'group', label: 'Lower Section', order: 8, parentId: null },
    { type: 'category', label: 'Three of a Kind', order: 9, parentId: null },
    { type: 'category', label: 'Four of a Kind', order: 10, parentId: null },
    { type: 'category', label: 'Full House', order: 11, parentId: null },
    { type: 'category', label: 'Small Straight', order: 12, parentId: null },
    { type: 'category', label: 'Large Straight', order: 13, parentId: null },
    { type: 'category', label: 'Yahtzee', order: 14, parentId: null },
    { type: 'category', label: 'Chance', order: 15, parentId: null },
  ],
};

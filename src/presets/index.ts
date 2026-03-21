import type { Preset } from '../types/preset';
import { yahtzeePreset } from './yahtzee';
import { catanPreset } from './catan';
import { scrabblePreset } from './scrabble';
import { genericPreset } from './generic';

export const BUILT_IN_PRESETS: Preset[] = [
  yahtzeePreset,
  catanPreset,
  scrabblePreset,
  genericPreset,
];

export { yahtzeePreset, catanPreset, scrabblePreset, genericPreset };

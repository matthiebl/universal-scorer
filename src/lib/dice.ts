export interface DieResult {
  sides: number;
  result: number;
}

/** Roll a single die with `sides` faces. */
export function rollDie(sides: number): DieResult {
  return { sides, result: Math.floor(Math.random() * sides) + 1 };
}

/** Roll `count` dice each with `sides` faces. */
export function rollDice(count: number, sides: number): DieResult[] {
  return Array.from({ length: count }, () => rollDie(sides));
}

/** Format a dice spec as a label e.g. "2d6". */
export function diceLabel(count: number, sides: number): string {
  return `${count}d${sides}`;
}

export const COMMON_DICE = [2, 4, 6, 8, 10, 12, 20, 100] as const;

const CUSTOM_DIE_KEY = 'game-scorer:custom-die';

export function loadCustomDie(): number | null {
  const val = localStorage.getItem(CUSTOM_DIE_KEY);
  if (!val) return null;
  const n = parseInt(val, 10);
  return Number.isFinite(n) && n >= 2 ? n : null;
}

export function saveCustomDie(sides: number): void {
  localStorage.setItem(CUSTOM_DIE_KEY, String(sides));
}

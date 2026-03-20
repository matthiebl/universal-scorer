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

export const COMMON_DICE = [4, 6, 8, 10, 12, 20, 100] as const;

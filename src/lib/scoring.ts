import type { Game, ScoreRow, Player, ID } from '../types/game';
import { scoreKey } from '../types/game';

/** Get the raw entered value for a player in a row (null if not entered). */
export function getRawScore(game: Game, rowId: string, playerId: string): number | null {
  return game.scores[scoreKey(rowId, playerId)]?.value ?? null;
}

/**
 * Compute the effective display score for a player in a row.
 * Handles manual, sum, formula, and bonus scoring rules.
 * Returns null if the value hasn't been entered (manual) or can't be computed.
 */
export function computeScore(game: Game, row: ScoreRow, player: Player): number | null {
  const rule = row.scoringRule;

  if (!rule || rule.type === 'manual') {
    return getRawScore(game, row.id, player.id);
  }

  if (rule.type === 'sum') {
    const sourceIds = rule.sourceRowIds ?? [];
    if (sourceIds.length === 0) return null;
    let total = 0;
    for (const srcId of sourceIds) {
      const srcRow = game.rows.find((r) => r.id === srcId);
      if (!srcRow) continue;
      const v = computeScore(game, srcRow, player);
      total += v ?? 0;
    }
    return total;
  }

  if (rule.type === 'bonus' || rule.type === 'formula') {
    if (!rule.formula) return null;
    try {
      // Build a scope of rowLabel -> playerTotal mappings for the formula
      const scope: Record<string, number> = {};
      for (const r of game.rows) {
        const safeKey = r.label.replace(/\W+/g, '_');
        scope[safeKey] = computeScore(game, r, player) ?? 0;
      }
      // Evaluate in a sandboxed scope (no globals exposed)
      const fn = new Function(...Object.keys(scope), `return (${rule.formula});`);
      const result = fn(...Object.values(scope));
      return typeof result === 'number' && isFinite(result) ? result : null;
    } catch {
      return null;
    }
  }

  return null;
}

/** Compute total score across all non-group rows for a player. */
export function computePlayerTotal(game: Game, player: Player): number {
  return game.rows
    .filter((r) => r.type !== 'group')
    .reduce((sum, row) => sum + (computeScore(game, row, player) ?? 0), 0);
}

// -- Batch computation (avoids O(n²) per render) --

/** Key for the score map: `${rowId}_${playerId}` */
export type ScoreMap = Record<string, number | null>;

// Cache compiled formula functions so we don't invoke the JS parser repeatedly.
// Key: formula source string, Value: { paramNames, fn }
const formulaCache = new Map<string, { paramNames: string[]; fn: Function }>();

function getCompiledFormula(formula: string, paramNames: string[]): Function {
  let entry = formulaCache.get(formula);
  if (entry && entry.paramNames.length === paramNames.length) return entry.fn;
  const fn = new Function(...paramNames, `return (${formula});`);
  formulaCache.set(formula, { paramNames, fn });
  return fn;
}

/**
 * Compute all display scores for every (row, player) pair in one pass.
 * Uses memoization internally so formula/sum rows don't re-evaluate dependencies.
 * Compiled formula functions are cached across calls.
 */
export function computeAllScores(game: Game): ScoreMap {
  const map: ScoreMap = {};
  const rowById = new Map(game.rows.map((r) => [r.id, r]));

  // Precompute safe label keys once (avoids regex per row per formula eval)
  const safeKeys: string[] = game.rows.map((r) => r.label.replace(/\W+/g, '_'));

  function resolve(row: ScoreRow, playerId: string, visited: Set<string>): number | null {
    const key = `${row.id}_${playerId}`;
    if (key in map) return map[key];

    // Cycle guard
    if (visited.has(key)) { map[key] = null; return null; }
    visited.add(key);

    const rule = row.scoringRule;

    if (!rule || rule.type === 'manual') {
      const val = game.scores[scoreKey(row.id, playerId)]?.value ?? null;
      map[key] = val;
      return val;
    }

    if (rule.type === 'sum') {
      const sourceIds = rule.sourceRowIds ?? [];
      if (sourceIds.length === 0) { map[key] = null; return null; }
      let total = 0;
      for (const srcId of sourceIds) {
        const srcRow = rowById.get(srcId);
        if (!srcRow) continue;
        total += resolve(srcRow, playerId, visited) ?? 0;
      }
      map[key] = total;
      return total;
    }

    if (rule.type === 'bonus' || rule.type === 'formula') {
      if (!rule.formula) { map[key] = null; return null; }
      try {
        const values: number[] = new Array(game.rows.length);
        for (let i = 0; i < game.rows.length; i++) {
          values[i] = resolve(game.rows[i], playerId, visited) ?? 0;
        }
        const fn = getCompiledFormula(rule.formula, safeKeys);
        const result = fn(...values);
        const val = typeof result === 'number' && isFinite(result) ? result : null;
        map[key] = val;
        return val;
      } catch {
        map[key] = null;
        return null;
      }
    }

    map[key] = null;
    return null;
  }

  for (const player of game.players) {
    const visited = new Set<string>();
    for (const row of game.rows) {
      resolve(row, player.id, visited);
    }
  }

  return map;
}

/** Look up a pre-computed score from a ScoreMap. */
export function getScore(scoreMap: ScoreMap, rowId: ID, playerId: ID): number | null {
  return scoreMap[`${rowId}_${playerId}`] ?? null;
}

/** Compute total from a pre-computed ScoreMap for a player. */
export function getPlayerTotal(scoreMap: ScoreMap, game: Game, playerId: ID): number {
  return game.rows
    .filter((r) => r.type !== 'group')
    .reduce((sum, row) => sum + (scoreMap[`${row.id}_${playerId}`] ?? 0), 0);
}

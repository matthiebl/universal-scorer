import type { Game, ScoreRow, Player } from '../types/game';
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

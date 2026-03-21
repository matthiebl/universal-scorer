import { Fragment, useMemo } from 'react';
import type { Game, ID, ScoreRow } from '../../types/game';
import { computeAllScores, getScore } from '../../lib/scoring';
import type { ScoreMap } from '../../lib/scoring';
import { PlayerHeader } from './PlayerHeader';
import { ScoreCell } from './ScoreCell';
import { TotalsRow } from './TotalsRow';

interface ScoreTableProps {
  game: Game;
  onCellClick: (rowId: ID, playerId: ID) => void;
}

/**
 * Groups act as section dividers by order — a row belongs to whichever group
 * header immediately precedes it. No parentId needed.
 */
function buildTree(rows: ScoreRow[]): { group: ScoreRow | null; children: ScoreRow[] }[] {
  const sorted = [...rows].sort((a, b) => a.order - b.order);
  const sections: { group: ScoreRow | null; children: ScoreRow[] }[] = [];
  let current: { group: ScoreRow | null; children: ScoreRow[] } = { group: null, children: [] };

  for (const row of sorted) {
    if (row.type === 'group') {
      // Push current section (even if empty, to preserve the leading no-group section)
      if (current.group !== null || current.children.length > 0) {
        sections.push(current);
      }
      current = { group: row, children: [] };
    } else {
      current.children.push(row);
    }
  }
  // Always push the last section
  if (current.group !== null || current.children.length > 0) {
    sections.push(current);
  }

  return sections;
}

export function ScoreTable({ game, onCellClick }: ScoreTableProps) {
  const sortedPlayers = useMemo(
    () => [...game.players].sort((a, b) => a.order - b.order),
    [game.players],
  );
  const sections = useMemo(() => buildTree(game.rows), [game.rows]);
  const scoreMap: ScoreMap = useMemo(
    () => computeAllScores(game),
    [game.rows, game.players, game.scores],
  );
  const hasRows = game.rows.length > 0;

  if (game.players.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400 dark:text-zinc-500">
        <p>No players added yet</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <table className="border-separate border-spacing-0 min-w-full">
        <thead>
          <tr>
            <th className="pl-4 pr-3 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 sticky top-0 left-0 bg-zinc-50 dark:bg-zinc-950 z-20 min-w-22.5 border-b border-zinc-200 dark:border-zinc-700 after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-zinc-200 dark:after:bg-zinc-700">
              Round
            </th>
            {sortedPlayers.map((player) => (
              <PlayerHeader key={player.id} player={player} />
            ))}
          </tr>
        </thead>
        <tbody>
          {!hasRows ? (
            <tr>
              <td
                colSpan={sortedPlayers.length + 1}
                className="px-3 py-8 text-center text-sm text-zinc-400 dark:text-zinc-500"
              >
                Add a round to start scoring
              </td>
            </tr>
          ) : (
            sections.map((section) => (
              <Fragment key={section.group?.id ?? `ungrouped-${section.children[0]?.id}`}>
                {/* Group header row */}
                {section.group && (
                  <tr key={`group-${section.group.id}`} className="bg-zinc-100 dark:bg-zinc-800/70">
                    <td
                      colSpan={sortedPlayers.length + 1}
                      className="py-1.5 bg-zinc-100 dark:bg-zinc-800/70"
                    >
                      <span className="sticky left-4 inline-block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        {section.group.label}
                      </span>
                    </td>
                  </tr>
                )}
                {/* Child/ungrouped rows */}
                {section.children.map((row) => {
                  const isComputed = !!row.scoringRule && row.scoringRule.type !== 'manual';
                  return (
                    <tr key={row.id} className="border-b border-zinc-100 dark:border-zinc-800">
                      <td className="pl-4 pr-3 py-1 text-sm font-medium text-zinc-700 dark:text-zinc-300 sticky left-0 bg-zinc-50 dark:bg-zinc-950 z-10 after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-zinc-200 dark:after:bg-zinc-700">
                          {row.label}
                      </td>
                      {sortedPlayers.map((player) => (
                        <ScoreCell
                          key={player.id}
                          value={getScore(scoreMap, row.id, player.id)}
                          isComputed={isComputed}
                          playerColor={player.color}
                          rowId={row.id}
                          playerId={player.id}
                          onCellClick={onCellClick}
                        />
                      ))}
                    </tr>
                  );
                })}
                {/* Section subtotal row for groups */}
                {section.group && section.children.length > 0 && (
                  <tr key={`subtotal-${section.group.id}`} className="border-b-2 border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
                    <td className="pl-6 pr-3 py-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400 sticky left-0 bg-zinc-50 dark:bg-zinc-900 z-10 after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-zinc-200 dark:after:bg-zinc-700">
                      Subtotal
                    </td>
                    {sortedPlayers.map((player) => {
                      const subtotal = section.children.reduce(
                        (sum, row) => sum + (getScore(scoreMap, row.id, player.id) ?? 0),
                        0,
                      );
                      return (
                        <td key={player.id} className="px-2 py-1 text-center">
                          <span className="text-sm font-semibold font-mono text-zinc-600 dark:text-zinc-400">
                            {subtotal}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                )}
              </Fragment>
            ))
          )}
          {game.rows.filter((r) => r.type !== 'group').length > 0 && (
            <TotalsRow game={game} scoreMap={scoreMap} />
          )}
        </tbody>
      </table>
    </div>
  );
}

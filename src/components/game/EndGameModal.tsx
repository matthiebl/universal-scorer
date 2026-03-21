import { useState, useCallback, useMemo } from 'react';
import { BottomSheet } from '../layout/BottomSheet';
import { Button } from '../shared/Button';
import type { Game, ID } from '../../types/game';
import { computePlayerTotal } from '../../lib/scoring';

interface EndGameModalProps {
  open: boolean;
  onClose: () => void;
  game: Game;
  onEndGame: (winnerIds: ID[]) => void;
}

export function EndGameModal({ open, onClose, game, onEndGame }: EndGameModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<ID>>(new Set());

  const togglePlayer = useCallback((id: ID) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const sortedPlayers = useMemo(() => {
    if (!open) return [];
    return [...game.players]
      .map((p) => ({ ...p, total: computePlayerTotal(game, p) }))
      .sort((a, b) => b.total - a.total);
  }, [open, game.players, game.scores, game.rows]);

  if (!open) return null;

  const handleConfirm = () => {
    onEndGame(Array.from(selectedIds));
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="End Game">
      <div className="space-y-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Select the winner{game.players.length > 2 ? '(s)' : ''} — you can pick more than one for a tie.
        </p>

        <div className="space-y-2">
          {sortedPlayers.map((player) => {
            const selected = selectedIds.has(player.id);
            return (
              <button
                key={player.id}
                type="button"
                onClick={() => togglePlayer(player.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-colors min-h-[52px] ${
                  selected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                    : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50'
                }`}
                aria-pressed={selected}
                aria-label={`Select ${player.name} as winner`}
              >
                <div
                  className="w-8 h-8 rounded-full shrink-0"
                  style={{ backgroundColor: player.color }}
                />
                <span className="flex-1 text-left font-medium text-zinc-900 dark:text-zinc-100">
                  {player.name}
                </span>
                <span className="font-mono font-bold text-lg" style={{ color: player.color }}>
                  {player.total}
                </span>
                {selected && (
                  <svg className="w-5 h-5 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedIds.size === 0}
            className="flex-1"
          >
            {selectedIds.size === 0
              ? 'Select a winner'
              : `End Game${selectedIds.size > 1 ? ` (${selectedIds.size} winners)` : ''}`}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}

import { useState } from 'react';
import { useGame } from '../state/useGame';
import { BottomSheet } from '../components/layout/BottomSheet';
import { PlayerManager } from '../components/settings/PlayerManager';
import { RowManager } from '../components/settings/RowManager';
import { PlayerSetup } from '../components/home/PlayerSetup';
import type { Player } from '../types/game';
import { cn } from '../lib/cn';

type Tab = 'players' | 'rows';

interface GameSettingsScreenProps {
  open: boolean;
  onClose: () => void;
}

export function GameSettingsScreen({ open, onClose }: GameSettingsScreenProps) {
  const { game, dispatch } = useGame();
  const [tab, setTab] = useState<Tab>('players');
  const [newPlayers, setNewPlayers] = useState<Omit<Player, 'id' | 'order'>[]>([]);

  const sortedPlayers = [...game.players].sort((a, b) => a.order - b.order);
  const sortedRows = [...game.rows].sort((a, b) => a.order - b.order);

  const handlePlayerMoveUp = (playerId: string) => {
    const idx = sortedPlayers.findIndex((p) => p.id === playerId);
    if (idx <= 0) return;
    const ids = sortedPlayers.map((p) => p.id);
    [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
    dispatch({ type: 'REORDER_PLAYERS', playerIds: ids });
  };

  const handlePlayerMoveDown = (playerId: string) => {
    const idx = sortedPlayers.findIndex((p) => p.id === playerId);
    if (idx === -1 || idx === sortedPlayers.length - 1) return;
    const ids = sortedPlayers.map((p) => p.id);
    [ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]];
    dispatch({ type: 'REORDER_PLAYERS', playerIds: ids });
  };

  const handleAddNewPlayers = () => {
    for (const p of newPlayers) {
      dispatch({ type: 'ADD_PLAYER', name: p.name, color: p.color });
    }
    setNewPlayers([]);
  };

  const handleRowMoveUp = (rowId: string) => {
    const idx = sortedRows.findIndex((r) => r.id === rowId);
    if (idx <= 0) return;
    const ids = sortedRows.map((r) => r.id);
    [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
    dispatch({ type: 'REORDER_ROWS', rowIds: ids });
  };

  const handleRowMoveDown = (rowId: string) => {
    const idx = sortedRows.findIndex((r) => r.id === rowId);
    if (idx === -1 || idx === sortedRows.length - 1) return;
    const ids = sortedRows.map((r) => r.id);
    [ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]];
    dispatch({ type: 'REORDER_ROWS', rowIds: ids });
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Settings">
      <div className="space-y-4">
        {/* Tab bar */}
        <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1 gap-1">
          {(['players', 'rows'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all',
                tab === t
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200',
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Players tab */}
        {tab === 'players' && (
          <div className="space-y-5">
            <PlayerManager
              players={game.players}
              onUpdate={(id, name, color) => dispatch({ type: 'UPDATE_PLAYER', playerId: id, name, color })}
              onRemove={(id) => dispatch({ type: 'REMOVE_PLAYER', playerId: id })}
              onMoveUp={handlePlayerMoveUp}
              onMoveDown={handlePlayerMoveDown}
            />
            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
              <PlayerSetup players={newPlayers} onChange={setNewPlayers} />
              {newPlayers.length > 0 && (
                <button
                  onClick={handleAddNewPlayers}
                  className="mt-3 w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold"
                >
                  Add {newPlayers.length} player{newPlayers.length > 1 ? 's' : ''}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Rows tab */}
        {tab === 'rows' && (
          <RowManager
            rows={game.rows}
            onUpdate={(id, label) => dispatch({ type: 'UPDATE_ROW', rowId: id, updates: { label } })}
            onRemove={(id) => dispatch({ type: 'REMOVE_ROW', rowId: id })}
            onMoveUp={handleRowMoveUp}
            onMoveDown={handleRowMoveDown}
          />
        )}
      </div>
    </BottomSheet>
  );
}

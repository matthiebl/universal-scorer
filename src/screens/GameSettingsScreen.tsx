import { useState } from 'react';
import { useGame } from '../state/useGame';
import { BottomSheet } from '../components/layout/BottomSheet';
import { PlayerManager } from '../components/settings/PlayerManager';
import { RowManager } from '../components/settings/RowManager';
import { RoomManager } from '../components/settings/RoomManager';
import { PlayerSetup } from '../components/home/PlayerSetup';
import { Input } from '../components/shared/Input';
import { Button } from '../components/shared/Button';
import type { Player } from '../types/game';
import type { RoomStatus } from '../hooks/useRoomSync';
import { savePreset } from '../services/storage';
import { cn } from '../lib/cn';

type Tab = 'players' | 'rows' | 'room';

interface GameSettingsScreenProps {
  open: boolean;
  onClose: () => void;
  roomStatus: RoomStatus;
  roomError: string | null;
  onCreateRoom: () => Promise<string>;
  onLeaveRoom: () => void;
}

export function GameSettingsScreen({
  open, onClose,
  roomStatus, roomError,
  onCreateRoom, onLeaveRoom,
}: GameSettingsScreenProps) {
  const { game, dispatch } = useGame();
  const [tab, setTab] = useState<Tab>('players');
  const [newPlayers, setNewPlayers] = useState<Omit<Player, 'id' | 'order'>[]>([]);
  const [savePresetOpen, setSavePresetOpen] = useState(false);
  const [presetName, setPresetName] = useState('');

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

  const handleSavePreset = () => {
    const name = presetName.trim() || game.name;
    savePreset({
      id: crypto.randomUUID(),
      name,
      description: `Saved from "${game.name}"`,
      rows: game.rows.map(({ id: _id, ...rest }) => rest),
      isBuiltIn: false,
      isPublic: false,
      createdAt: Date.now(),
    });
    setPresetName('');
    setSavePresetOpen(false);
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

  const tabs: Tab[] = ['players', 'rows', 'room'];

  return (
    <>
    <BottomSheet open={open} onClose={onClose} title="Settings">
      <div className="space-y-4">
        {/* Tab bar */}
        <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-1 gap-1">
          {tabs.map((t) => (
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
          <>
            <RowManager
              rows={game.rows}
              onUpdate={(id, label) => dispatch({ type: 'UPDATE_ROW', rowId: id, updates: { label } })}
              onRemove={(id) => dispatch({ type: 'REMOVE_ROW', rowId: id })}
              onMoveUp={handleRowMoveUp}
              onMoveDown={handleRowMoveDown}
            />
            {game.rows.length > 0 && (
              <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
                <button
                  onClick={() => { setPresetName(game.name); setSavePresetOpen(true); }}
                  className="w-full py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-600 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Save rows as preset
                </button>
              </div>
            )}
          </>
        )}

        {/* Room tab */}
        {tab === 'room' && (
          <RoomManager
            roomCode={game.roomCode}
            status={roomStatus}
            error={roomError}
            onCreateRoom={onCreateRoom}
            onLeaveRoom={onLeaveRoom}
          />
        )}
      </div>
    </BottomSheet>

    {/* Save preset sheet */}
    <BottomSheet open={savePresetOpen} onClose={() => setSavePresetOpen(false)} title="Save as Preset">
      <div className="space-y-4">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Save the current row layout as a reusable preset for future games.
        </p>
        <Input
          label="Preset Name"
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && presetName.trim()) handleSavePreset(); }}
          autoFocus
        />
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setSavePresetOpen(false)} className="flex-1">Cancel</Button>
          <Button onClick={handleSavePreset} disabled={!presetName.trim()} className="flex-1">Save Preset</Button>
        </div>
      </div>
    </BottomSheet>
    </>
  );
}

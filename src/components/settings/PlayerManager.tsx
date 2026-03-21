import { useState } from 'react';
import type { Player } from '../../types/game';
import { ColorPicker } from '../shared/ColorPicker';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { cn } from '../../lib/cn';

interface PlayerManagerProps {
  players: Player[];
  onUpdate: (playerId: string, name: string, color: string) => void;
  onRemove: (playerId: string) => void;
  onMoveUp: (playerId: string) => void;
  onMoveDown: (playerId: string) => void;
}

export function PlayerManager({ players, onUpdate, onRemove, onMoveUp, onMoveDown }: PlayerManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const startEdit = (player: Player) => {
    setEditingId(player.id);
    setEditName(player.name);
    setEditColor(player.color);
  };

  const saveEdit = () => {
    if (!editingId || !editName.trim()) return;
    onUpdate(editingId, editName.trim(), editColor);
    setEditingId(null);
  };

  const sorted = [...players].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-2">
      {sorted.map((player, i) => (
        <div key={player.id} className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          {editingId === player.id ? (
            <div className="p-3 space-y-3">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(); }}
                autoFocus
              />
              <ColorPicker value={editColor} onChange={setEditColor} />
              <div className="flex gap-2">
                <Button size="sm" onClick={saveEdit} className="flex-1">Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="flex-1">Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-3 py-2">
              {/* Reorder arrows */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => onMoveUp(player.id)}
                  disabled={i === 0}
                  className={cn('p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200', i === 0 && 'opacity-30')}
                  aria-label="Move up"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => onMoveDown(player.id)}
                  disabled={i === sorted.length - 1}
                  className={cn('p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200', i === sorted.length - 1 && 'opacity-30')}
                  aria-label="Move down"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              <div className="w-7 h-7 rounded-full shrink-0" style={{ backgroundColor: player.color }} />
              <span className="flex-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">{player.name}</span>

              <button
                onClick={() => startEdit(player)}
                className="p-2.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                aria-label="Edit player"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H8v-2.414a2 2 0 01.586-1.414z" />
                </svg>
              </button>
              <button
                onClick={() => onRemove(player.id)}
                className="p-2.5 text-zinc-400 hover:text-red-500 transition-colors"
                aria-label="Remove player"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

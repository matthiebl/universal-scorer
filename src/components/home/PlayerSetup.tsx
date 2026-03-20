import { useState } from 'react';
import type { Player } from '../../types/game';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { ColorPicker, getNextColor } from '../shared/ColorPicker';

interface PlayerSetupProps {
  players: Omit<Player, 'id' | 'order'>[];
  onChange: (players: Omit<Player, 'id' | 'order'>[]) => void;
}

export function PlayerSetup({ players, onChange }: PlayerSetupProps) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(() => getNextColor(players.map((p) => p.color)));

  const addPlayer = () => {
    const name = newName.trim();
    if (!name) return;
    onChange([...players, { name, color: newColor }]);
    setNewName('');
    setNewColor(getNextColor([...players.map((p) => p.color), newColor]));
  };

  const removePlayer = (index: number) => {
    onChange(players.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Players</h3>

      {players.length > 0 && (
        <ul className="space-y-2">
          {players.map((player, index) => (
            <li key={index} className="flex items-center gap-3 py-1">
              <div
                className="w-6 h-6 rounded-full shrink-0"
                style={{ backgroundColor: player.color }}
              />
              <span className="flex-1 text-zinc-900 dark:text-zinc-100">{player.name}</span>
              <button
                type="button"
                onClick={() => removePlayer(index)}
                className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                aria-label={`Remove ${player.name}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-zinc-700">
        <Input
          placeholder="Player name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addPlayer();
            }
          }}
        />
        <ColorPicker value={newColor} onChange={setNewColor} />
        <Button
          variant="secondary"
          size="sm"
          onClick={addPlayer}
          disabled={!newName.trim()}
          className="w-full"
        >
          Add Player
        </Button>
      </div>
    </div>
  );
}

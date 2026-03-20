import { useState } from 'react';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import type { ScoreRowType } from '../../types/game';

interface AddRowButtonProps {
  nextRoundNumber: number;
  onAddRow: (label: string, type: ScoreRowType) => void;
}

type Mode = 'round' | 'category' | 'group' | null;

export function AddRowButton({ nextRoundNumber, onAddRow }: AddRowButtonProps) {
  const [mode, setMode] = useState<Mode>(null);
  const [customLabel, setCustomLabel] = useState('');

  const handleAddRound = () => {
    onAddRow(`Round ${nextRoundNumber}`, 'round');
  };

  const handleSubmit = (type: 'category' | 'group') => {
    const label = customLabel.trim();
    if (!label) return;
    onAddRow(label, type);
    setCustomLabel('');
    setMode(null);
  };

  return (
    <div className="px-4 py-3 space-y-2 border-t border-zinc-200 dark:border-zinc-800">
      {mode === null && (
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={handleAddRound} className="flex-1">
            + Round {nextRoundNumber}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setMode('category')} className="shrink-0">
            + Category
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setMode('group')} className="shrink-0">
            + Group
          </Button>
        </div>
      )}

      {(mode === 'category' || mode === 'group') && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {mode === 'group' ? 'New group section name' : 'New category name'}
          </p>
          <div className="flex gap-2">
            <Input
              placeholder={mode === 'group' ? 'e.g. Upper Section' : 'e.g. Large Straight'}
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit(mode);
                if (e.key === 'Escape') { setMode(null); setCustomLabel(''); }
              }}
              className="flex-1"
              autoFocus
            />
            <Button size="sm" onClick={() => handleSubmit(mode)} disabled={!customLabel.trim()}>
              Add
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setMode(null); setCustomLabel(''); }}>
              ✕
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

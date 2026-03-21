import { useState, useEffect } from 'react';
import type { Preset } from '../../types/preset';
import { BottomSheet } from '../layout/BottomSheet';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { cn } from '../../lib/cn';

interface PresetEditSheetProps {
  preset: Preset;
  open: boolean;
  onClose: () => void;
  onSave: (updated: Preset) => void;
}

export function PresetEditSheet({ preset, open, onClose, onSave }: PresetEditSheetProps) {
  const [name, setName] = useState(preset.name);
  const [description, setDescription] = useState(preset.description ?? '');
  const [increments, setIncrements] = useState<number[]>(preset.increments ?? []);
  const [incrementInput, setIncrementInput] = useState('');

  // Reset to preset values each time the sheet opens
  useEffect(() => {
    if (open) {
      setName(preset.name);
      setDescription(preset.description ?? '');
      setIncrements(preset.increments ?? []);
      setIncrementInput('');
    }
  }, [open, preset]);

  const handleAddIncrement = () => {
    const val = parseInt(incrementInput, 10);
    if (isNaN(val) || val === 0) return;
    if (increments.includes(val)) { setIncrementInput(''); return; }
    setIncrements((prev) => [...prev, val].sort((a, b) => a - b));
    setIncrementInput('');
  };

  const handleRemoveIncrement = (val: number) => {
    setIncrements((prev) => prev.filter((v) => v !== val));
  };

  const handleSave = () => {
    onSave({
      ...preset,
      name: name.trim() || preset.name,
      description: description.trim() || undefined,
      increments: increments.length > 0 ? increments : undefined,
    });
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Edit Preset">
      <div className="space-y-5">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional"
        />

        {/* Increments editor */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Quick Score Buttons</p>

          {increments.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {increments.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleRemoveIncrement(val)}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium transition-colors',
                    val < 0
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                  )}
                >
                  {val > 0 ? '+' : ''}{val}
                  <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Using defaults (−10 −5 −1 +1 +5 +10)</p>
          )}

          <div className="flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              placeholder="e.g. 25"
              value={incrementInput}
              onChange={(e) => setIncrementInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddIncrement(); }}
              className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleAddIncrement}
              disabled={!incrementInput || isNaN(parseInt(incrementInput, 10)) || parseInt(incrementInput, 10) === 0}
              className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium disabled:opacity-40 transition-colors"
            >
              Add
            </button>
          </div>
          {increments.length > 0 && (
            <button
              type="button"
              onClick={() => setIncrements([])}
              className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              Reset to defaults
            </button>
          )}
        </div>

        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          To edit rows, create a game from this preset, adjust rows in settings, then save as a new preset.
        </p>

        <div className="flex gap-3 pt-1">
          <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim()} className="flex-1">Save</Button>
        </div>
      </div>
    </BottomSheet>
  );
}

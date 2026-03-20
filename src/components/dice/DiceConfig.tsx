import { useState } from 'react';
import { cn } from '../../lib/cn';
import { COMMON_DICE } from '../../lib/dice';
import { BottomSheet } from '../layout/BottomSheet';

interface DiceConfigProps {
  count: number;
  sides: number;
  onCountChange: (count: number) => void;
  onSidesChange: (sides: number) => void;
}

export function DiceConfig({ count, sides, onCountChange, onSidesChange }: DiceConfigProps) {
  const [customOpen, setCustomOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const isCustom = !(COMMON_DICE as readonly number[]).includes(sides);

  const handleCustomSubmit = () => {
    const val = parseInt(customInput, 10);
    if (val >= 2 && val <= 1000) {
      onSidesChange(val);
      setCustomInput('');
      setCustomOpen(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Die type */}
        <div>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">Die Type</p>
          <div className="grid grid-cols-4 gap-2">
            {COMMON_DICE.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSidesChange(s)}
                className={cn(
                  'py-2.5 rounded-xl text-sm font-bold transition-all',
                  sides === s
                    ? 'bg-blue-600 text-white shadow-md scale-105'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700',
                )}
              >
                d{s}
              </button>
            ))}
            {/* Custom tile */}
            <button
              type="button"
              onClick={() => { setCustomInput(isCustom ? String(sides) : ''); setCustomOpen(true); }}
              className={cn(
                'py-2.5 rounded-xl text-sm font-bold transition-all',
                isCustom
                  ? 'bg-blue-600 text-white shadow-md scale-105'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700',
              )}
            >
              {isCustom ? `d${sides}` : 'dN'}
            </button>
          </div>
        </div>

        {/* Count */}
        <div>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
            Number of Dice: <span className="text-zinc-900 dark:text-zinc-100 font-bold">{count}</span>
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onCountChange(Math.max(1, count - 1))}
              className="w-11 h-11 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xl font-bold flex items-center justify-center active:scale-90 transition-transform"
              aria-label="Decrease count"
            >
              −
            </button>
            <div className="flex-1 text-center text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
              {count}
            </div>
            <button
              type="button"
              onClick={() => onCountChange(Math.min(20, count + 1))}
              className="w-11 h-11 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xl font-bold flex items-center justify-center active:scale-90 transition-transform"
              aria-label="Increase count"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Custom die drawer */}
      <BottomSheet open={customOpen} onClose={() => setCustomOpen(false)} title="Custom Die">
        <div className="space-y-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Enter the number of sides for your custom die (2–1000).
          </p>
          <input
            type="number"
            inputMode="numeric"
            min={2}
            max={1000}
            placeholder="e.g. 3"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCustomSubmit(); }}
            autoFocus
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-4 py-3 text-2xl font-mono text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleCustomSubmit}
            disabled={!customInput || parseInt(customInput, 10) < 2}
            className="w-full py-3 rounded-xl bg-blue-600 text-white text-lg font-bold disabled:opacity-50"
          >
            Use d{customInput || '?'}
          </button>
        </div>
      </BottomSheet>
    </>
  );
}

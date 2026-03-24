import { useState } from 'react';
import { cn } from '../../lib/cn';
import { COMMON_DICE, loadCustomDie, saveCustomDie } from '../../lib/dice';
import { BottomSheet } from '../layout/BottomSheet';

interface DiceConfigProps {
  count: number;
  sides: number;
  onCountChange: (count: number) => void;
  onSidesChange: (sides: number) => void;
}

const NUMPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'] as const;

export function DiceConfig({ count, sides, onCountChange, onSidesChange }: DiceConfigProps) {
  const [customOpen, setCustomOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const savedCustom = loadCustomDie();
  const isCustom = !(COMMON_DICE as readonly number[]).includes(sides) && sides !== savedCustom;

  const handleCustomSubmit = () => {
    const val = parseInt(customInput, 10);
    if (val >= 2 && val <= 1000) {
      saveCustomDie(val);
      onSidesChange(val);
      setCustomInput('');
      setCustomOpen(false);
    }
  };

  const handleNumpadPress = (key: string) => {
    if (key === 'del') {
      setCustomInput((prev) => prev.slice(0, -1));
    } else if (key === '') {
      return;
    } else {
      setCustomInput((prev) => {
        const next = prev + key;
        const val = parseInt(next, 10);
        if (val > 1000) return prev;
        return next;
      });
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Die type */}
        <div>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">Die Type</p>
          <div className="grid grid-cols-5 gap-2">
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
            {/* Saved custom die */}
            {savedCustom ? (
              <button
                type="button"
                onClick={() => onSidesChange(savedCustom)}
                className={cn(
                  'py-2.5 rounded-xl text-sm font-bold transition-all',
                  sides === savedCustom
                    ? 'bg-blue-600 text-white shadow-md scale-105'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700',
                )}
              >
                d{savedCustom}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setCustomInput(''); setCustomOpen(true); }}
                className="py-2.5 rounded-xl text-sm font-bold transition-all border-2 border-dashed border-zinc-300 dark:border-zinc-600 text-zinc-400 dark:text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-500"
              >
                dN
              </button>
            )}
            {/* Custom dN button */}
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
          {/* Display */}
          <div className="w-full rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-4 py-3 text-2xl font-mono text-center text-zinc-900 dark:text-zinc-100 min-h-12 flex items-center justify-center">
            {customInput || <span className="text-zinc-400">e.g. 3</span>}
          </div>
          {/* Numpad */}
          <div className="grid grid-cols-3 gap-2">
            {NUMPAD_KEYS.map((key, i) => (
              key === '' ? (
                <div key={i} />
              ) : (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleNumpadPress(key)}
                  className="py-3 rounded-xl text-xl font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95 transition-all"
                >
                  {key === 'del' ? (
                    <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l7-7h11v14H10L3 12z" />
                    </svg>
                  ) : key}
                </button>
              )
            ))}
          </div>
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

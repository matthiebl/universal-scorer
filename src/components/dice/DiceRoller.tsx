import { useState, useCallback } from 'react';
import { BottomSheet } from '../layout/BottomSheet';
import { DiceConfig } from './DiceConfig';
import { RollResult } from './RollResult';
import { RollHistory } from './RollHistory';
import { rollDice, diceLabel } from '../../lib/dice';
import type { DiceRoll } from '../../types/game';

interface DiceRollerProps {
  open: boolean;
  onClose: () => void;
  onRoll: (dice: { sides: number; result: number }[], total: number, label: string) => void;
  history: DiceRoll[];
}

export function DiceRoller({ open, onClose, onRoll, history }: DiceRollerProps) {
  const [count, setCount] = useState(1);
  const [sides, setSides] = useState<number>(6);
  const [lastResult, setLastResult] = useState<{ dice: { sides: number; result: number }[]; total: number } | null>(null);
  const [rolling, setRolling] = useState(false);

  const handleRoll = useCallback(() => {
    if (rolling) return;
    if (sides === -1 && import.meta.env.VITE_ENABLE_PRANKS === 'true') {
      window.location.href = 'youtube://www.youtube.com/watch?v=dQw4w9WgXcQ';
      setTimeout(() => {
        window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      }, 150);
      return;
    }
    setRolling(true);
    setLastResult(null);

    // Short animation delay
    setTimeout(() => {
      const dice = rollDice(count, sides);
      const total = dice.reduce((s, d) => s + d.result, 0);
      const label = diceLabel(count, sides);
      setLastResult({ dice, total });
      onRoll(dice, total, label);
      setRolling(false);
    }, 300);
  }, [count, sides, onRoll, rolling]);

  return (
    <BottomSheet open={open} onClose={onClose} title="Dice Roller">
      <div className="space-y-5">
        <DiceConfig
          count={count}
          sides={sides}
          onCountChange={setCount}
          onSidesChange={setSides}
        />

        {/* Roll button */}
        <button
          onClick={handleRoll}
          disabled={rolling}
          className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xl font-bold transition-all active:scale-95 disabled:opacity-60"
        >
          {rolling ? 'Rolling…' : sides === -1 ? 'Roll dR' : `Roll ${count}d${sides}`}
        </button>

        {lastResult && (
          <RollResult dice={lastResult.dice} total={lastResult.total} />
        )}

        {history.length > 0 && (
          <RollHistory history={history} />
        )}
      </div>
    </BottomSheet>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { BottomSheet } from '../layout/BottomSheet';
import { NumberPad } from './NumberPad';
import { IncrementButtons } from './IncrementButtons';
import { Button } from '../shared/Button';

interface ScoreEntryModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (value: number | null) => void;
  initialValue: number | null;
  playerName: string;
  playerColor: string;
  rowLabel: string;
}

export function ScoreEntryModal({
  open,
  onClose,
  onSave,
  initialValue,
  playerName,
  playerColor,
  rowLabel,
}: ScoreEntryModalProps) {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    if (open) {
      setDisplay(initialValue != null ? String(initialValue) : '');
    }
  }, [open, initialValue]);

  const currentValue = display === '' || display === '-' ? null : Number(display);

  const handleDigit = useCallback((digit: string) => {
    setDisplay((prev) => {
      if (prev === '0') return digit;
      return prev + digit;
    });
  }, []);

  const handleBackspace = useCallback(() => {
    setDisplay((prev) => prev.slice(0, -1));
  }, []);

  const handleNegate = useCallback(() => {
    setDisplay((prev) => {
      if (prev.startsWith('-')) return prev.slice(1);
      if (prev === '' || prev === '0') return '-';
      return '-' + prev;
    });
  }, []);

  const handleDecimal = useCallback(() => {
    setDisplay((prev) => {
      if (prev.includes('.')) return prev;
      if (prev === '' || prev === '-') return prev + '0.';
      return prev + '.';
    });
  }, []);

  const handleIncrement = useCallback((amount: number) => {
    setDisplay((prev) => {
      const current = prev === '' || prev === '-' ? 0 : Number(prev);
      const result = current + amount;
      return String(result);
    });
  }, []);

  const handleSave = () => {
    onSave(currentValue);
    onClose();
  };

  const handleClear = () => {
    onSave(null);
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={rowLabel}>
      <div className="space-y-4">
        {/* Player indicator */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full" style={{ backgroundColor: playerColor }} />
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{playerName}</span>
        </div>

        {/* Display */}
        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl px-4 py-3 text-right">
          <span className="text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
            {display || '0'}
          </span>
        </div>

        {/* Increment buttons */}
        <IncrementButtons onIncrement={handleIncrement} />

        {/* Number pad */}
        <NumberPad
          onDigit={handleDigit}
          onBackspace={handleBackspace}
          onNegate={handleNegate}
          onDecimal={handleDecimal}
        />

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button variant="ghost" onClick={handleClear} className="flex-1">
            Clear
          </Button>
          <Button onClick={handleSave} className="flex-2">
            Save Score
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}

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
  increments?: number[];
}

function applyOp(left: number, op: string, right: number): number {
  let result: number;
  switch (op) {
    case '+':  result = left + right; break;
    case '−':  result = left - right; break;
    case '×':  result = left * right; break;
    case '÷':  result = right !== 0 ? left / right : 0; break;
    default:   return right;
  }
  // Avoid floating-point artifacts like 0.1 + 0.2 = 0.30000000000000004
  return Math.round(result * 1e10) / 1e10;
}

export function ScoreEntryModal({
  open,
  onClose,
  onSave,
  initialValue,
  playerName,
  playerColor,
  rowLabel,
  increments,
}: ScoreEntryModalProps) {
  const [display, setDisplay] = useState('');
  const [pendingOp, setPendingOp] = useState<string | null>(null);
  const [leftVal, setLeftVal] = useState<number | null>(null);
  // True immediately after an operator is pressed — next digit starts a fresh operand
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  useEffect(() => {
    if (open) {
      setDisplay(initialValue != null ? String(initialValue) : '');
      setPendingOp(null);
      setLeftVal(null);
      setWaitingForOperand(false);
    }
  }, [open, initialValue]);

  const currentValue = display === '' || display === '-' ? null : Number(display);

  const handleDigit = useCallback((digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay((prev) => (prev === '0' ? digit : prev + digit));
    }
  }, [waitingForOperand]);

  const handleBackspace = useCallback(() => {
    if (waitingForOperand) {
      // Cancel the pending operator
      setPendingOp(null);
      setLeftVal(null);
      setWaitingForOperand(false);
    } else {
      setDisplay((prev) => prev.slice(0, -1));
    }
  }, [waitingForOperand]);

  const handleNegate = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('-');
      setWaitingForOperand(false);
    } else {
      setDisplay((prev) => {
        if (prev.startsWith('-')) return prev.slice(1);
        if (prev === '' || prev === '0') return '-';
        return '-' + prev;
      });
    }
  }, [waitingForOperand]);

  const handleDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    setDisplay((prev) => {
      if (prev.includes('.')) return prev;
      if (prev === '' || prev === '-') return prev + '0.';
      return prev + '.';
    });
  }, [waitingForOperand]);

  const handleOperator = useCallback((op: string) => {
    const current = currentValue ?? 0;
    if (leftVal !== null && pendingOp && !waitingForOperand) {
      // Chain: evaluate the previous op first
      const result = applyOp(leftVal, pendingOp, current);
      setDisplay(String(result));
      setLeftVal(result);
    } else {
      setLeftVal(current);
    }
    setPendingOp(op);
    setWaitingForOperand(true);
  }, [currentValue, leftVal, pendingOp, waitingForOperand]);

  const handleEquals = useCallback(() => {
    if (leftVal === null || pendingOp === null) return;
    const right = currentValue ?? 0;
    const result = applyOp(leftVal, pendingOp, right);
    setDisplay(String(result));
    setLeftVal(null);
    setPendingOp(null);
    setWaitingForOperand(false);
  }, [currentValue, leftVal, pendingOp]);

  const handleIncrement = useCallback((amount: number) => {
    setPendingOp(null);
    setLeftVal(null);
    setWaitingForOperand(false);
    setDisplay((prev) => {
      const current = prev === '' || prev === '-' ? 0 : Number(prev);
      return String(current + amount);
    });
  }, []);

  const handleSave = () => {
    // If an operation is pending, evaluate it first
    let value = currentValue;
    if (leftVal !== null && pendingOp !== null) {
      value = applyOp(leftVal, pendingOp, currentValue ?? 0);
    }
    onSave(value);
    onClose();
  };

  const handleClear = () => {
    onSave(null);
    onClose();
  };

  // Display hint: show "5 +" when waiting for the right operand
  const hint = leftVal !== null && pendingOp ? `${leftVal} ${pendingOp}` : null;

  return (
    <BottomSheet open={open} onClose={onClose} title={rowLabel}>
      <div className="space-y-4">
        {/* Player indicator */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full" style={{ backgroundColor: playerColor }} />
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{playerName}</span>
        </div>

        {/* Display */}
        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl px-4 py-3 text-right min-h-16 flex flex-col justify-end">
          {hint && (
            <span className="text-sm font-mono text-zinc-400 dark:text-zinc-500">{hint}</span>
          )}
          <span className="text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
            {display || '0'}
          </span>
        </div>

        {/* Increment buttons */}
        <IncrementButtons onIncrement={handleIncrement} increments={increments} />

        {/* Number pad */}
        <NumberPad
          onDigit={handleDigit}
          onBackspace={handleBackspace}
          onNegate={handleNegate}
          onDecimal={handleDecimal}
          onOperator={handleOperator}
          onEquals={handleEquals}
          activeOperator={waitingForOperand ? pendingOp : null}
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

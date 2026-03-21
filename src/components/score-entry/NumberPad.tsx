interface NumberPadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onNegate: () => void;
  onDecimal: () => void;
  onOperator: (op: string) => void;
  onEquals: () => void;
  activeOperator?: string | null;
}

const btnBase = 'min-h-14 rounded-xl text-xl font-semibold transition-colors active:scale-95';
const btnDigit = `${btnBase} bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 active:bg-zinc-200 dark:active:bg-zinc-700`;
const btnAction = `${btnBase} bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 active:bg-zinc-300 dark:active:bg-zinc-600 text-base`;
const btnEquals = `${btnBase} bg-blue-600 hover:bg-blue-700 text-white active:bg-blue-800`;

export function NumberPad({ onDigit, onBackspace, onNegate, onDecimal, onOperator, onEquals, activeOperator }: NumberPadProps) {
  const btnOp = (op: string) =>
    `${btnBase} text-base transition-colors ${
      activeOperator === op
        ? 'bg-blue-500 text-white'
        : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 active:bg-amber-200 dark:active:bg-amber-900/60'
    }`;

  return (
    <div className="space-y-2">
      {/* Digits + operators: 4-column grid */}
      <div className="grid grid-cols-4 gap-2">
        <button type="button" onClick={() => onDigit('7')} className={btnDigit}>7</button>
        <button type="button" onClick={() => onDigit('8')} className={btnDigit}>8</button>
        <button type="button" onClick={() => onDigit('9')} className={btnDigit}>9</button>
        <button type="button" onClick={() => onOperator('÷')} className={btnOp('÷')}>÷</button>

        <button type="button" onClick={() => onDigit('4')} className={btnDigit}>4</button>
        <button type="button" onClick={() => onDigit('5')} className={btnDigit}>5</button>
        <button type="button" onClick={() => onDigit('6')} className={btnDigit}>6</button>
        <button type="button" onClick={() => onOperator('×')} className={btnOp('×')}>×</button>

        <button type="button" onClick={() => onDigit('1')} className={btnDigit}>1</button>
        <button type="button" onClick={() => onDigit('2')} className={btnDigit}>2</button>
        <button type="button" onClick={() => onDigit('3')} className={btnDigit}>3</button>
        <button type="button" onClick={() => onOperator('−')} className={btnOp('−')}>−</button>

        <button type="button" onClick={onNegate} className={btnAction}>+/−</button>
        <button type="button" onClick={() => onDigit('0')} className={btnDigit}>0</button>
        <button type="button" onClick={onDecimal} className={btnAction}>.</button>
        <button type="button" onClick={() => onOperator('+')} className={btnOp('+')}>+</button>
      </div>

      {/* Bottom row: backspace + equals */}
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={onBackspace} className={btnAction} aria-label="Backspace">
          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l7-7 11 0v14H10L3 12z" />
          </svg>
        </button>
        <button type="button" onClick={onEquals} className={btnEquals}>=</button>
      </div>
    </div>
  );
}

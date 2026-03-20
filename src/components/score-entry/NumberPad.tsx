import { cn } from '../../lib/cn';

interface NumberPadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onNegate: () => void;
  onDecimal: () => void;
}

const keys = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['+/-', '0', '.'],
];

export function NumberPad({ onDigit, onBackspace, onNegate, onDecimal }: NumberPadProps) {
  const handleKey = (key: string) => {
    if (key === '+/-') onNegate();
    else if (key === '.') onDecimal();
    else onDigit(key);
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      {keys.flat().map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => handleKey(key)}
          className={cn(
            'min-h-[52px] rounded-xl text-xl font-medium transition-colors',
            'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100',
            'active:bg-zinc-200 dark:active:bg-zinc-700',
            key === '+/-' && 'text-base',
          )}
        >
          {key}
        </button>
      ))}
      <button
        type="button"
        onClick={onBackspace}
        className={cn(
          'min-h-[52px] rounded-xl text-xl font-medium transition-colors',
          'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300',
          'active:bg-zinc-300 dark:active:bg-zinc-600',
        )}
        aria-label="Backspace"
      >
        <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l7-7 11 0v14H10L3 12z" />
        </svg>
      </button>
    </div>
  );
}

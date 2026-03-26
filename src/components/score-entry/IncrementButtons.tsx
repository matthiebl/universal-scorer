import { cn } from '../../lib/cn';

interface IncrementButtonsProps {
  onIncrement: (amount: number) => void;
  increments?: number[];
}

const DEFAULT_INCREMENTS = [-10, -5, -1, +1, +5, +10];

export function IncrementButtons({ onIncrement, increments = DEFAULT_INCREMENTS }: IncrementButtonsProps) {
  return (
    <div className="flex gap-2 justify-center flex-wrap">
      {increments.map((amount) => (
        <button
          key={amount}
          type="button"
          onClick={() => onIncrement(amount)}
          className={cn(
            'px-4 py-3 min-h-12 rounded-xl text-base font-medium transition-colors',
            amount < 0
              ? 'bg-red-100 text-red-700 active:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:active:bg-red-900/50'
              : 'bg-green-100 text-green-700 active:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:active:bg-green-900/50',
          )}
        >
          {amount > 0 ? '+' : ''}{amount}
        </button>
      ))}
    </div>
  );
}

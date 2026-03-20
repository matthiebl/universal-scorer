import { cn } from '../../lib/cn';

interface IncrementButtonsProps {
  onIncrement: (amount: number) => void;
}

const increments = [-10, -5, -1, +1, +5, +10];

export function IncrementButtons({ onIncrement }: IncrementButtonsProps) {
  return (
    <div className="flex gap-1.5 justify-center">
      {increments.map((amount) => (
        <button
          key={amount}
          type="button"
          onClick={() => onIncrement(amount)}
          className={cn(
            'px-3 py-2 min-h-[40px] rounded-lg text-sm font-medium transition-colors',
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

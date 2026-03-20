import { memo } from 'react';
import { cn } from '../../lib/cn';

interface ScoreCellProps {
  value: number | null;
  isComputed: boolean;
  playerColor: string;
  onClick: () => void;
}

export const ScoreCell = memo(function ScoreCell({ value, isComputed, playerColor, onClick }: ScoreCellProps) {
  const hasValue = value != null;

  return (
    <td className="px-1 py-1 text-center">
      <button
        type="button"
        onClick={onClick}
        disabled={isComputed}
        className={cn(
          'w-full min-h-11 rounded-lg text-base font-mono font-medium transition-all',
          'border border-transparent',
          hasValue && !isComputed
            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
            : hasValue && isComputed
            ? 'bg-zinc-100/60 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 cursor-default'
            : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-300 dark:text-zinc-600 border-dashed border-zinc-200 dark:border-zinc-700',
          !isComputed && 'active:scale-95 active:bg-zinc-200 dark:active:bg-zinc-700',
        )}
        style={hasValue && !isComputed ? { borderColor: playerColor + '40' } : undefined}
      >
        {hasValue ? value : '\u2014'}
      </button>
    </td>
  );
});

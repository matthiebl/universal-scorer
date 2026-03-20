import type { DiceRoll } from '../../types/game';

interface RollHistoryProps {
  history: DiceRoll[];
}

export function RollHistory({ history }: RollHistoryProps) {
  const recent = [...history].reverse().slice(0, 8);

  return (
    <div>
      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">Recent Rolls</p>
      <div className="space-y-1.5">
        {recent.map((roll) => (
          <div
            key={roll.id}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800"
          >
            <span className="text-sm text-zinc-500 dark:text-zinc-400">{roll.label}</span>
            <div className="flex items-center gap-2">
              {roll.dice.length > 1 && (
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  [{roll.dice.map((d) => d.result).join(', ')}]
                </span>
              )}
              <span className="text-base font-mono font-bold text-zinc-900 dark:text-zinc-100">
                {roll.total}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

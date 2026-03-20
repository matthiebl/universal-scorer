interface RollResultProps {
  dice: { sides: number; result: number }[];
  total: number;
}

export function RollResult({ dice, total }: RollResultProps) {
  const isNatMax = dice.length === 1 && dice[0].result === dice[0].sides;
  const isNatOne = dice.length === 1 && dice[0].result === 1;

  return (
    <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl p-4 text-center space-y-3">
      {/* Individual dice */}
      {dice.length > 1 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {dice.map((d, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 flex items-center justify-center text-base font-mono font-bold text-zinc-900 dark:text-zinc-100 shadow-sm"
            >
              {d.result}
            </div>
          ))}
        </div>
      )}

      {/* Total */}
      <div>
        <div
          className={
            isNatMax
              ? 'text-5xl font-black font-mono text-green-500'
              : isNatOne
              ? 'text-5xl font-black font-mono text-red-500'
              : 'text-5xl font-black font-mono text-zinc-900 dark:text-zinc-100'
          }
        >
          {total}
        </div>
        {isNatMax && <p className="text-sm font-medium text-green-500 mt-1">Natural max!</p>}
        {isNatOne && <p className="text-sm font-medium text-red-500 mt-1">Natural 1!</p>}
        {dice.length > 1 && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Total</p>
        )}
      </div>
    </div>
  );
}

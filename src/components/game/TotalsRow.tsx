import type { Game } from '../../types/game';
import { computePlayerTotal } from '../../lib/scoring';

interface TotalsRowProps {
  game: Game;
}

export function TotalsRow({ game }: TotalsRowProps) {
  const sortedPlayers = [...game.players].sort((a, b) => a.order - b.order);

  return (
    <tr className="border-t-2 border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800/50">
      <td className="pl-4 pr-3 py-2 text-sm font-bold text-zinc-900 dark:text-zinc-100 sticky left-0 bg-zinc-100 dark:bg-zinc-800/50 z-10 after:absolute after:inset-y-0 after:right-0 after:w-px after:bg-zinc-300 dark:after:bg-zinc-600">
        Total
      </td>
      {sortedPlayers.map((player) => (
        <td key={player.id} className="px-2 py-2 text-center">
          <span className="text-lg font-bold font-mono" style={{ color: player.color }}>
            {computePlayerTotal(game, player)}
          </span>
        </td>
      ))}
    </tr>
  );
}

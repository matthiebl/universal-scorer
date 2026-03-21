import { memo } from 'react';
import type { Player } from '../../types/game';

interface PlayerHeaderProps {
  player: Player;
}

export const PlayerHeader = memo(function PlayerHeader({ player }: PlayerHeaderProps) {
  return (
    <th className="px-2 py-2 text-center w-18 bg-zinc-50 dark:bg-zinc-950 sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-700">
      <div className="flex flex-col items-center gap-1">
        <div
          className="w-7 h-7 rounded-full shrink-0"
          style={{ backgroundColor: player.color }}
        />
        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-full">
          {player.name}
        </span>
      </div>
    </th>
  );
});

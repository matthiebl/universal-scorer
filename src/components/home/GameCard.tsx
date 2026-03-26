import { cn } from '../../lib/cn';
import { loadSavedPresets } from '../../services/storage';
import type { Game } from '../../types/game';

function resolvePresetName(presetId?: string): string | null {
  if (!presetId) return null;
  const saved = loadSavedPresets().find((p) => p.id === presetId);
  return saved?.name ?? null;
}

interface GameCardProps {
  game: Game;
  onClick: () => void;
  onDelete: () => void;
  onCopySetup?: () => void;
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function GameCard({ game, onClick, onDelete, onCopySetup }: GameCardProps) {
  const presetName = resolvePresetName(game.presetId);

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'relative w-full text-left bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800',
        'p-4 active:bg-zinc-50 dark:active:bg-zinc-800/50 transition-colors cursor-pointer',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-950',
      )}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{game.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex -space-x-1.5">
              {game.players.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="w-5 h-5 rounded-full border-2 border-white dark:border-zinc-900"
                  style={{ backgroundColor: p.color }}
                  title={p.name}
                />
              ))}
              {game.players.length > 5 && (
                <div className="w-5 h-5 rounded-full bg-zinc-300 dark:bg-zinc-600 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[10px] font-medium">
                  +{game.players.length - 5}
                </div>
              )}
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {game.players.length} player{game.players.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              {game.status === 'completed' ? 'Completed' : 'Active'} &middot; {timeAgo(game.updatedAt)}
              {presetName && <> &middot; {presetName}</>}
            </p>
            {game.roomCode && game.status === 'active' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                <span className="text-[11px] font-mono font-semibold tracking-wider">{game.roomCode}</span>
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onCopySetup && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopySetup();
              }}
              className="p-2 rounded-lg text-zinc-400 hover:text-blue-500 transition-colors"
              aria-label="Use this game's setup"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
            aria-label="Delete game"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

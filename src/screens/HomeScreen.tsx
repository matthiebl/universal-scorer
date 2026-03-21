import { useState } from 'react';
import { useNavigate } from 'react-router';
import type { Player, Game } from '../types/game';
import type { Preset } from '../types/preset';
import { createEmptyGame } from '../state/gameReducer';
import { useGameList } from '../state/useGameList';
import { saveGame } from '../services/storage';
import { Button } from '../components/shared/Button';
import { GameCard } from '../components/home/GameCard';
import { NewGameDialog } from '../components/home/NewGameDialog';
import { useTheme } from '../hooks/useTheme';

export function HomeScreen() {
  const { games, refresh, deleteGame } = useGameList();
  const [showNewGame, setShowNewGame] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleCreate = (name: string, players: Omit<Player, 'id' | 'order'>[], preset: Preset | null) => {
    const game: Game = {
      ...createEmptyGame(name),
      presetId: preset?.id,
      increments: preset?.increments,
      players: players.map((p, i) => ({
        ...p,
        id: crypto.randomUUID(),
        order: i,
      })),
      rows: preset
        ? preset.rows.map((r, i) => ({ ...r, id: crypto.randomUUID(), order: i }))
        : [],
    };
    saveGame(game);
    refresh();
    navigate(`/game/${game.id}`);
  };

  const handleDelete = (gameId: string) => {
    deleteGame(gameId);
  };

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-14">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Game Scorer</h1>
          <div className="flex items-center gap-1">
          <button
            onClick={() => navigate('/join')}
            className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-sm font-medium"
            aria-label="Join room"
          >
            Join
          </button>
          <button
            onClick={() => navigate('/presets')}
            className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-sm font-medium"
            aria-label="Presets"
          >
            Presets
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        {games.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">No games yet</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Create your first game to start tracking scores</p>
            <Button onClick={() => setShowNewGame(true)} size="lg">
              New Game
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onClick={() => navigate(`/game/${game.id}`)}
                onDelete={() => handleDelete(game.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      {games.length > 0 && (
        <div className="fixed bottom-6 right-6 max-w-lg">
          <Button
            onClick={() => setShowNewGame(true)}
            size="lg"
            className="rounded-full shadow-lg px-5"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Game
            </span>
          </Button>
        </div>
      )}

      <NewGameDialog
        open={showNewGame}
        onClose={() => setShowNewGame(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}

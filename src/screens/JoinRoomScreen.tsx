import { useState } from 'react';
import { useNavigate } from 'react-router';
import { normalizeRoomCode } from '../lib/roomCode';
import { joinRoom } from '../services/roomSync';
import { saveGame } from '../services/storage';
import { Button } from '../components/shared/Button';

export function JoinRoomScreen() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalized = normalizeRoomCode(code);
  const canJoin = normalized.length === 4;

  const handleJoin = async () => {
    if (!canJoin || loading) return;
    if (normalized.startsWith('R') && import.meta.env.VITE_ENABLE_PRANKS === 'true') {
      window.location.href = 'youtube://www.youtube.com/watch?v=dQw4w9WgXcQ';
      setTimeout(() => {
        window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      }, 150);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const game = await joinRoom(normalized);
      if (!game) {
        setError('Room not found. Check the code and try again.');
        return;
      }
      // Save the game locally so GameScreenWrapper can load it.
      saveGame(game);
      navigate(`/game/${game.id}`);
    } catch {
      setError('Something went wrong. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-10 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => navigate('/')}
            className="p-2 -ml-2 rounded-lg text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Back"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Join Room</h1>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 flex flex-col items-center justify-center gap-6 py-12">
        <div className="text-center">
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Enter the 4-character room code to join a game in progress.</p>
        </div>

        <input
          type="text"
          inputMode="text"
          autoCapitalize="characters"
          autoFocus
          maxLength={4}
          placeholder="A2B3"
          value={code}
          onChange={(e) => {
            setError(null);
            setCode(normalizeRoomCode(e.target.value).slice(0, 4));
          }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleJoin(); }}
          className="w-full text-center text-4xl font-mono font-bold tracking-[0.25em] rounded-2xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-4 py-5 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
        />

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <Button
          onClick={handleJoin}
          disabled={!canJoin || loading}
          size="lg"
          className="w-full"
        >
          {loading ? 'Joining…' : 'Join Game'}
        </Button>
      </main>
    </div>
  );
}

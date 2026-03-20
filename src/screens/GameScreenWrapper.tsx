import { useParams, Navigate } from 'react-router';
import { GameProvider } from '../state/GameProvider';
import { GameScreen } from './GameScreen';
import { loadGame } from '../services/storage';

export function GameScreenWrapper() {
  const { id } = useParams<{ id: string }>();

  if (!id) return <Navigate to="/" replace />;

  const exists = loadGame(id) !== null;
  if (!exists) return <Navigate to="/" replace />;

  return (
    <GameProvider gameId={id}>
      <GameScreen />
    </GameProvider>
  );
}

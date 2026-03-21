import { createContext, useReducer, useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import type { Game } from '../types/game';
import type { GameAction } from './gameActions';
import { gameReducer, createEmptyGame } from './gameReducer';
import { saveGame, loadGame } from '../services/storage';

interface GameContextValue {
  game: Game;
  dispatch: (action: GameAction) => void;
}

export const GameContext = createContext<GameContextValue | null>(null);

interface GameProviderProps {
  gameId: string;
  children: ReactNode;
}

export function GameProvider({ gameId, children }: GameProviderProps) {
  const [game, rawDispatch] = useReducer(gameReducer, null, () => {
    const saved = loadGame(gameId);
    return saved ?? createEmptyGame('New Game');
  });

  const dispatch = useCallback(
    (action: GameAction) => {
      rawDispatch(action);
    },
    [],
  );

  // Debounced persistence to localStorage (500ms)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gameRef = useRef(game);
  gameRef.current = game;

  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveGame(game);
      saveTimerRef.current = null;
    }, 500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [game]);

  // Flush pending save on unmount to avoid data loss
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveGame(gameRef.current);
      }
    };
  }, []);

  const contextValue = useMemo(() => ({ game, dispatch }), [game, dispatch]);

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

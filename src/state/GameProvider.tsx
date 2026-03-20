import { createContext, useReducer, useCallback, useEffect, type ReactNode } from 'react';
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

  // Persist to localStorage on every state change
  useEffect(() => {
    saveGame(game);
  }, [game]);

  return (
    <GameContext.Provider value={{ game, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

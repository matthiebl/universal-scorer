import { useState, useCallback } from 'react';
import type { Game } from '../types/game';
import { loadAllGames, saveGame, deleteGame as removeGame } from '../services/storage';

export function useGameList() {
  const [games, setGames] = useState<Game[]>(() => loadAllGames());

  const refresh = useCallback(() => {
    setGames(loadAllGames());
  }, []);

  const addGame = useCallback((game: Game) => {
    saveGame(game);
    setGames(loadAllGames());
  }, []);

  const deleteGame = useCallback((gameId: string) => {
    removeGame(gameId);
    setGames(loadAllGames());
  }, []);

  return { games, refresh, addGame, deleteGame };
}

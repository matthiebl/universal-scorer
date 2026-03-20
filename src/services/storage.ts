import type { Game } from '../types/game';

const GAMES_KEY = 'game-scorer:games';

function getGamesMap(): Record<string, Game> {
  try {
    const raw = localStorage.getItem(GAMES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setGamesMap(map: Record<string, Game>): void {
  localStorage.setItem(GAMES_KEY, JSON.stringify(map));
}

export function loadAllGames(): Game[] {
  const map = getGamesMap();
  return Object.values(map).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function loadGame(id: string): Game | null {
  const map = getGamesMap();
  return map[id] ?? null;
}

export function saveGame(game: Game): void {
  const map = getGamesMap();
  map[game.id] = game;
  setGamesMap(map);
}

export function deleteGame(id: string): void {
  const map = getGamesMap();
  delete map[id];
  setGamesMap(map);
}

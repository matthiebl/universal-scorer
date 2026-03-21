import type { Game } from '../types/game';
import type { Preset } from '../types/preset';

const GAMES_KEY = 'game-scorer:games';
const PRESETS_KEY = 'game-scorer:presets';

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

// --- Preset storage ---

function getPresetsMap(): Record<string, Preset> {
  try {
    const raw = localStorage.getItem(PRESETS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setPresetsMap(map: Record<string, Preset>): void {
  localStorage.setItem(PRESETS_KEY, JSON.stringify(map));
}

export function loadSavedPresets(): Preset[] {
  const map = getPresetsMap();
  return Object.values(map).sort((a, b) => b.createdAt - a.createdAt);
}

export function savePreset(preset: Preset): void {
  const map = getPresetsMap();
  map[preset.id] = preset;
  setPresetsMap(map);
}

export function deletePreset(id: string): void {
  const map = getPresetsMap();
  delete map[id];
  setPresetsMap(map);
}

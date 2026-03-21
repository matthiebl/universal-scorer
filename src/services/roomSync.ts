import { ref, set, get, onValue, off, serverTimestamp } from 'firebase/database';
import type { DatabaseReference } from 'firebase/database';
import { db } from './firebase';
import type { Game } from '../types/game';
import { generateRoomCode } from '../lib/roomCode';

export interface RoomMeta {
  createdAt: number;
  lastActivity: object; // server timestamp
}

export interface Room {
  code: string;
  game: Game;
  meta: RoomMeta;
}

function roomRef(code: string): DatabaseReference {
  return ref(db, `rooms/${code}`);
}

/** Create a new room for a game. Returns the room code. */
export async function createRoom(game: Game): Promise<string> {
  // Try up to 5 codes to avoid collisions
  for (let i = 0; i < 5; i++) {
    const code = generateRoomCode();
    const snap = await get(roomRef(code));
    if (!snap.exists()) {
      await set(roomRef(code), {
        game: { ...game, roomCode: code },
        meta: { createdAt: Date.now(), lastActivity: serverTimestamp() },
      });
      return code;
    }
  }
  throw new Error('Failed to generate a unique room code. Please try again.');
}

/** Join an existing room. Returns the current game snapshot or null if not found. */
export async function joinRoom(code: string): Promise<Game | null> {
  const snap = await get(roomRef(code));
  if (!snap.exists()) return null;
  return (snap.val() as Room).game;
}

/** Push a local game state update to the room. */
export async function pushGameUpdate(code: string, game: Game): Promise<void> {
  await set(ref(db, `rooms/${code}/game`), game);
  await set(ref(db, `rooms/${code}/meta/lastActivity`), serverTimestamp());
}

/** Subscribe to remote game updates. Returns an unsubscribe function. */
export function subscribeToRoom(
  code: string,
  onUpdate: (game: Game) => void,
  onNotFound: () => void,
): () => void {
  const r = ref(db, `rooms/${code}/game`);
  const handler = onValue(r, (snap) => {
    if (!snap.exists()) {
      onNotFound();
    } else {
      onUpdate(snap.val() as Game);
    }
  });
  return () => off(r, 'value', handler);
}

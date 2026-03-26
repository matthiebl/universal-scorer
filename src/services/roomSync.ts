import { ref, set, get, onValue, serverTimestamp } from 'firebase/database';
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
  const code = generateRoomCode();
  const sanitizedGame = JSON.parse(JSON.stringify({ ...game, roomCode: code })) as Game;
  await set(roomRef(code), {
    game: sanitizedGame,
    meta: { createdAt: Date.now(), lastActivity: serverTimestamp() },
  });
  return code;
}

/** Join an existing room. Returns the current game snapshot or null if not found. */
export async function joinRoom(code: string): Promise<Game | null> {
  const snap = await get(roomRef(code));
  if (!snap.exists()) return null;
  return (snap.val() as Room).game;
}

/** Push a local game state update to the room. */
export async function pushGameUpdate(code: string, game: Game): Promise<void> {
  // Firebase rejects undefined values — JSON round-trip strips them cleanly
  const sanitized = JSON.parse(JSON.stringify(game)) as Game;
  await set(ref(db, `rooms/${code}/game`), sanitized);
  await set(ref(db, `rooms/${code}/meta/lastActivity`), serverTimestamp());
}

/** Subscribe to remote game updates. Returns an unsubscribe function. */
export function subscribeToRoom(
  code: string,
  onUpdate: (game: Game) => void,
  onNotFound: () => void,
  onError: (err: Error) => void,
): () => void {
  const r = ref(db, `rooms/${code}/game`);
  // onValue returns the unsubscribe function in the modular SDK.
  // The third argument is a cancel callback — called if the subscription is
  // rejected (e.g. permission denied). Without it, errors are silently dropped
  // and the listener stops firing.
  const unsubscribe = onValue(
    r,
    (snap) => {
      if (!snap.exists()) {
        onNotFound();
      } else {
        onUpdate(snap.val() as Game);
      }
    },
    (err) => onError(err),
  );
  return unsubscribe;
}

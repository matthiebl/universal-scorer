import { useEffect, useRef, useCallback, useState } from 'react';
import type { Game, ScoreEntry } from '../types/game';
import type { GameAction } from '../state/gameActions';
import { createRoom, joinRoom, fetchRoomGame, pushGameUpdate, subscribeToRoom } from '../services/roomSync';

export type RoomStatus = 'offline' | 'connecting' | 'online' | 'error';

interface UseRoomSyncResult {
  status: RoomStatus;
  error: string | null;
  startRoom: () => Promise<string>;
  joinRoomByCode: (code: string) => Promise<boolean>;
  leaveRoom: () => void;
}

function scoresDiffer(
  a: Record<string, ScoreEntry>,
  b: Record<string, ScoreEntry>,
): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return true;
  return aKeys.some(
    (k) => !b[k] || a[k].value !== b[k].value || a[k].timestamp !== b[k].timestamp,
  );
}

/**
 * Syncs a game with a Firebase Realtime Database room.
 *
 * - Subscribes to Firebase for remote changes (onValue).
 * - Pushes every local change to Firebase (debounced 400ms).
 * - After each successful push, polls Firebase once after a random 1–5s delay
 *   to reconcile any concurrent edits missed by the subscription.
 * - Uses fromRemoteRef to skip pushing updates that came from Firebase
 *   (prevents echo loops without relying on timestamp comparisons).
 */
export function useRoomSync(
  game: Game,
  dispatch: React.Dispatch<GameAction>,
): UseRoomSyncResult {
  const [status, setStatus] = useState<RoomStatus>('offline');
  const [error, setError] = useState<string | null>(null);

  const roomCodeRef = useRef<string | null>(game.roomCode ?? null);
  // Always-current game state — read by poll callback without stale closures.
  const gameRef = useRef(game);
  gameRef.current = game;
  // Set to true immediately before dispatching a REMOTE_UPDATE so the push
  // effect knows not to echo it back to Firebase.
  const fromRemoteRef = useRef(false);
  // True when there are local changes waiting to be pushed that haven't been
  // sent to Firebase yet. Survives a remote-update echo so the merged state
  // still gets pushed even though the original timer was cancelled.
  const localDirtyRef = useRef(false);
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  // Keep dispatch stable in callbacks without needing it in dep arrays.
  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;

  const stopListening = useCallback(() => {
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
  }, []);

  // Fetch remote state, merge by timestamp, and reconcile both sides.
  const runPoll = useCallback(async (code: string) => {
    const remoteGame = await fetchRoomGame(code);
    if (!remoteGame) return;

    const local = gameRef.current;
    const remoteScores = remoteGame.scores ?? {};
    const localScores = local.scores ?? {};

    // Same merge logic as the REMOTE_UPDATE reducer case.
    const mergedScores: Record<string, ScoreEntry> = { ...remoteScores };
    for (const [key, localEntry] of Object.entries(localScores)) {
      const remoteEntry = remoteScores[key];
      if (!remoteEntry || localEntry.timestamp > remoteEntry.timestamp) {
        mergedScores[key] = localEntry;
      }
    }

    const remoteAhead = scoresDiffer(mergedScores, localScores);
    const localAhead  = scoresDiffer(mergedScores, remoteScores);

    if (remoteAhead) {
      // Remote had newer cells — update local state with the merged result.
      fromRemoteRef.current = true;
      dispatchRef.current({ type: 'REMOTE_UPDATE', game: { ...remoteGame, scores: mergedScores } });
    }

    if (localAhead) {
      // Local had newer cells Firebase doesn't know about — push the merged state.
      await pushGameUpdate(code, { ...local, scores: mergedScores });
    }
  }, []);

  const startListening = useCallback((code: string) => {
    stopListening();
    setStatus('connecting');

    unsubscribeRef.current = subscribeToRoom(
      code,
      (remoteGame) => {
        // Mark update as remote BEFORE dispatching so the push effect sees it.
        fromRemoteRef.current = true;
        dispatchRef.current({ type: 'REMOTE_UPDATE', game: remoteGame });
        setStatus('online');
        setError(null);
      },
      () => {
        console.error('[RoomSync] room not found or deleted:', code);
        setStatus('error');
        setError('Room not found or was deleted.');
        stopListening();
      },
      (err) => {
        console.error('[RoomSync] subscription error:', err);
        setStatus('error');
        setError(`Sync error: ${err.message}`);
        stopListening();
      },
    );
  }, [stopListening]);

  // Push local changes to Firebase, debounced by 400ms.
  // Skips remote-originated updates to prevent echo loops, but reschedules
  // the push if local changes survived the merge (localDirtyRef).
  useEffect(() => {
    const code = roomCodeRef.current;
    if (!code || status !== 'online') return;

    const doPush = () => {
      // Cancel any pending poll — a fresh push supersedes it.
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);

      pushTimerRef.current = setTimeout(() => {
        localDirtyRef.current = false;
        pushGameUpdate(code, game)
          .then(() => {
            // Schedule a reconciliation poll at a random 1–5s delay.
            const jitter = 1000 + Math.random() * 4000;
            pollTimerRef.current = setTimeout(() => runPoll(code), jitter);
          })
          .catch((err) => {
            console.error('[RoomSync] push failed:', err);
            setStatus('error');
            setError(String(err));
          });
      }, 400);
    };

    if (fromRemoteRef.current) {
      fromRemoteRef.current = false;
      // The effect cleanup already cancelled the pending timer. If we had
      // local changes that survived the merge, reschedule the push so they
      // still make it to Firebase.
      if (localDirtyRef.current) doPush();
      return () => {
        if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
      };
    }

    // Local change — mark dirty and schedule the push.
    localDirtyRef.current = true;
    if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    doPush();

    return () => {
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    };
  }, [game, status, runPoll]);

  // If the game already has a roomCode on mount, reconnect.
  useEffect(() => {
    if (game.roomCode && status === 'offline') {
      roomCodeRef.current = game.roomCode;
      startListening(game.roomCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount.
  useEffect(() => () => {
    stopListening();
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
  }, [stopListening]);

  const startRoom = useCallback(async (): Promise<string> => {
    setStatus('connecting');
    setError(null);
    try {
      const code = await createRoom(game);
      roomCodeRef.current = code;
      // Mark as remote so the initial subscription echo isn't pushed back.
      fromRemoteRef.current = true;
      dispatchRef.current({ type: 'REMOTE_UPDATE', game: { ...game, roomCode: code } });
      startListening(code);
      return code;
    } catch (err) {
      console.error('[RoomSync] createRoom failed:', err);
      setStatus('error');
      setError(String(err));
      throw err;
    }
  }, [game, startListening]);

  const joinRoomByCode = useCallback(async (code: string): Promise<boolean> => {
    setStatus('connecting');
    setError(null);
    try {
      const remoteGame = await joinRoom(code);
      if (!remoteGame) {
        setStatus('error');
        setError('Room not found. Check the code and try again.');
        return false;
      }
      roomCodeRef.current = code;
      fromRemoteRef.current = true;
      dispatchRef.current({ type: 'REMOTE_UPDATE', game: remoteGame });
      startListening(code);
      return true;
    } catch (err) {
      console.error('[RoomSync] joinRoom failed:', err);
      setStatus('error');
      setError(String(err));
      return false;
    }
  }, [startListening]);

  const leaveRoom = useCallback(() => {
    stopListening();
    roomCodeRef.current = null;
    fromRemoteRef.current = false;
    setStatus('offline');
    setError(null);
    dispatchRef.current({ type: 'REMOTE_UPDATE', game: { ...game, roomCode: undefined } });
  }, [stopListening, game]);

  return { status, error, startRoom, joinRoomByCode, leaveRoom };
}

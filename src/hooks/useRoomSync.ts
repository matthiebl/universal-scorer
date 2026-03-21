import { useEffect, useRef, useCallback, useState } from 'react';
import type { Game } from '../types/game';
import type { GameAction } from '../state/gameActions';
import { createRoom, joinRoom, pushGameUpdate, subscribeToRoom } from '../services/roomSync';

export type RoomStatus = 'offline' | 'connecting' | 'online' | 'error';

interface UseRoomSyncResult {
  status: RoomStatus;
  error: string | null;
  startRoom: () => Promise<string>;
  joinRoomByCode: (code: string) => Promise<boolean>;
  leaveRoom: () => void;
}

/**
 * Syncs a game with a Firebase Realtime Database room.
 *
 * - Subscribes to Firebase for remote changes (onValue).
 * - Pushes every local change to Firebase (debounced 400ms).
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
  // Set to true immediately before dispatching a REMOTE_UPDATE so the push
  // effect knows not to echo it back to Firebase.
  const fromRemoteRef = useRef(false);
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  // Keep dispatch stable in callbacks without needing it in dep arrays.
  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;

  const stopListening = useCallback(() => {
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
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
  // Skips remote-originated updates to prevent echo loops.
  useEffect(() => {
    const code = roomCodeRef.current;
    if (!code || status !== 'online') return;

    // This update came from Firebase — don't push it back.
    if (fromRemoteRef.current) {
      fromRemoteRef.current = false;
      return;
    }

    if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    pushTimerRef.current = setTimeout(() => {
      pushGameUpdate(code, game).catch((err) => {
        console.error('[RoomSync] push failed:', err);
        setStatus('error');
        setError(String(err));
      });
    }, 400);

    return () => {
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    };
  }, [game, status]);

  // If the game already has a roomCode on mount, reconnect.
  useEffect(() => {
    if (game.roomCode && status === 'offline') {
      roomCodeRef.current = game.roomCode;
      startListening(game.roomCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount.
  useEffect(() => () => stopListening(), [stopListening]);

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

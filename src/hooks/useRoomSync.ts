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
 * - Pushes every local dispatch to Firebase (debounced).
 * - Receives remote updates and dispatches REMOTE_UPDATE to the reducer.
 * - Skips re-pushing updates that originated from remote (loop prevention).
 */
export function useRoomSync(
  game: Game,
  dispatch: React.Dispatch<GameAction>,
): UseRoomSyncResult {
  const [status, setStatus] = useState<RoomStatus>('offline');
  const [error, setError] = useState<string | null>(null);

  // Ref to the active room code so callbacks always see latest value.
  const roomCodeRef = useRef<string | null>(game.roomCode ?? null);
  // Track whether the last game update came from remote (to avoid push loops).
  const isRemoteUpdateRef = useRef(false);
  // Debounce timer for outgoing pushes.
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Unsubscribe fn for the current listener.
  const unsubscribeRef = useRef<(() => void) | null>(null);

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
        // Only apply if the remote game is newer than local.
        if (remoteGame.updatedAt > game.updatedAt || isRemoteUpdateRef.current === false) {
          isRemoteUpdateRef.current = true;
          dispatch({ type: 'REMOTE_UPDATE', game: remoteGame });
          isRemoteUpdateRef.current = false;
        }
        setStatus('online');
        setError(null);
      },
      () => {
        setStatus('error');
        setError('Room not found or was deleted.');
        stopListening();
      },
    );
  }, [dispatch, game.updatedAt, stopListening]);

  // Push local changes to Firebase, debounced by 400ms.
  useEffect(() => {
    const code = roomCodeRef.current;
    if (!code || status !== 'online' || isRemoteUpdateRef.current) return;

    if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    pushTimerRef.current = setTimeout(() => {
      pushGameUpdate(code, game).catch((err) => {
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
      dispatch({ type: 'REMOTE_UPDATE', game: { ...game, roomCode: code } });
      startListening(code);
      return code;
    } catch (err) {
      setStatus('error');
      setError(String(err));
      throw err;
    }
  }, [game, dispatch, startListening]);

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
      dispatch({ type: 'REMOTE_UPDATE', game: remoteGame });
      startListening(code);
      return true;
    } catch (err) {
      setStatus('error');
      setError(String(err));
      return false;
    }
  }, [dispatch, startListening]);

  const leaveRoom = useCallback(() => {
    stopListening();
    roomCodeRef.current = null;
    setStatus('offline');
    setError(null);
    dispatch({ type: 'REMOTE_UPDATE', game: { ...game, roomCode: undefined } });
  }, [stopListening, dispatch, game]);

  return { status, error, startRoom, joinRoomByCode, leaveRoom };
}

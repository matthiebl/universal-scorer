import type { RoomStatus } from '../../hooks/useRoomSync';
import { cn } from '../../lib/cn';

interface RoomManagerProps {
  roomCode: string | undefined;
  status: RoomStatus;
  error: string | null;
  onCreateRoom: () => void;
  onLeaveRoom: () => void;
}

function StatusBadge({ status }: { status: RoomStatus }) {
  const map: Record<RoomStatus, { label: string; className: string }> = {
    offline:    { label: 'Offline',     className: 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400' },
    connecting: { label: 'Connecting…', className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' },
    online:     { label: 'Live',        className: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
    error:      { label: 'Error',       className: 'bg-red-100 dark:bg-red-900/30 text-red-500' },
  };
  const { label, className } = map[status];
  return (
    <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', className)}>
      {label}
    </span>
  );
}

export function RoomManager({ roomCode, status, error, onCreateRoom, onLeaveRoom }: RoomManagerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Online Room</p>
        <StatusBadge status={status} />
      </div>

      {roomCode ? (
        <div className="space-y-3">
          <div className="rounded-xl bg-zinc-100 dark:bg-zinc-800 p-4 text-center">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Room Code</p>
            <p className="text-4xl font-mono font-bold tracking-[0.2em] text-zinc-900 dark:text-zinc-100">
              {roomCode}
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2">
              Share this code so others can join at the Join Room screen
            </p>
          </div>
          <button
            onClick={onLeaveRoom}
            className="w-full py-2.5 rounded-xl border border-red-200 dark:border-red-800 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Leave Room
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Start an online room to sync scores with other players in real time. Share the code and anyone with it can join.
          </p>
          <button
            onClick={onCreateRoom}
            disabled={status === 'connecting'}
            className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold disabled:opacity-60 transition-colors"
          >
            {status === 'connecting' ? 'Creating…' : 'Create Room'}
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

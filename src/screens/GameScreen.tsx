import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useGame } from '../state/useGame';
import { scoreKey } from '../types/game';
import type { ID } from '../types/game';
import { ScoreTable } from '../components/game/ScoreTable';
import { AddRowButton } from '../components/game/AddRowButton';
import { EndGameModal } from '../components/game/EndGameModal';
import { ScoreEntryModal } from '../components/score-entry/ScoreEntryModal';
import { DiceRoller } from '../components/dice/DiceRoller';
import { GameSettingsScreen } from './GameSettingsScreen';
import { useRoomSync } from '../hooks/useRoomSync';
import { fireConfetti } from '../lib/confetti';
import { cn } from '../lib/cn';

interface CellSelection {
  rowId: ID;
  playerId: ID;
}

export function GameScreen() {
  const { game, dispatch } = useGame();
  const navigate = useNavigate();
  const [selectedCell, setSelectedCell] = useState<CellSelection | null>(null);
  const [diceOpen, setDiceOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [endGameOpen, setEndGameOpen] = useState(false);

  const { status: roomStatus, error: roomError, startRoom, leaveRoom } = useRoomSync(game, dispatch);

  const handleCellClick = useCallback((rowId: ID, playerId: ID) => {
    setSelectedCell({ rowId, playerId });
  }, []);

  const handleSaveScore = useCallback(
    (value: number | null) => {
      if (!selectedCell) return;
      dispatch({
        type: 'SET_SCORE',
        rowId: selectedCell.rowId,
        playerId: selectedCell.playerId,
        value,
      });
    },
    [selectedCell, dispatch],
  );

  const handleAddRow = useCallback(
    (label: string, type: import('../types/game').ScoreRowType) => {
      dispatch({ type: 'ADD_ROW', row: { label, type, parentId: null } });
    },
    [dispatch],
  );

  const handleDiceRoll = useCallback(
    (dice: { sides: number; result: number }[], total: number, label: string) => {
      dispatch({ type: 'ADD_DICE_ROLL', dice, total, label });
    },
    [dispatch],
  );

  const selectedPlayer = selectedCell
    ? game.players.find((p) => p.id === selectedCell.playerId)
    : null;
  const selectedRow = selectedCell
    ? game.rows.find((r) => r.id === selectedCell.rowId)
    : null;
  const selectedEntry = selectedCell
    ? game.scores[scoreKey(selectedCell.rowId, selectedCell.playerId)]
    : undefined;

  const handleEndGame = useCallback(
    (winnerIds: ID[]) => {
      dispatch({ type: 'END_GAME', winnerIds });
      setTimeout(() => fireConfetti(), 150);
    },
    [dispatch],
  );

  const handleReopenGame = useCallback(() => {
    dispatch({ type: 'SET_STATUS', status: 'active' });
  }, [dispatch]);

  const winners = game.winnerIds
    ?.map((id) => game.players.find((p) => p.id === id))
    .filter(Boolean) ?? [];

  const roundCount = game.rows.filter((r) => r.type === 'round').length;

  return (
    <div className="h-dvh flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-lg mx-auto flex items-center px-4 h-14 gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 -ml-2 rounded-lg text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Back to games"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 truncate flex-1">
            {game.name}
          </h1>

          {/* Room status dot (shown when in a room) */}
          {game.roomCode && (
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Room status"
            >
              <span className={cn(
                'w-2 h-2 rounded-full',
                roomStatus === 'online'     ? 'bg-green-500' :
                roomStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                roomStatus === 'error'      ? 'bg-red-500' :
                'bg-zinc-400',
              )} />
              <span className="text-zinc-500 dark:text-zinc-400 font-mono tracking-wider">
                {game.roomCode}
              </span>
            </button>
          )}

          {/* Settings button */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Game settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          {/* Dice button */}
          <button
            onClick={() => setDiceOpen(true)}
            className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Open dice roller"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.25" fill="currentColor" stroke="none" />
              <circle cx="15.5" cy="8.5" r="1.25" fill="currentColor" stroke="none" />
              <circle cx="8.5" cy="15.5" r="1.25" fill="currentColor" stroke="none" />
              <circle cx="15.5" cy="15.5" r="1.25" fill="currentColor" stroke="none" />
            </svg>
          </button>
        </div>
      </header>

      {/* Winner banner */}
      {game.status === 'completed' && winners.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 px-4 py-3">
          <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-amber-600 dark:text-amber-400 text-lg" role="img" aria-label="Trophy">&#127942;</span>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200 truncate">
                {winners.length === 1
                  ? `${winners[0]!.name} wins!`
                  : `${winners.map((w) => w!.name).join(' & ')} win!`}
              </p>
            </div>
            <button
              onClick={handleReopenGame}
              className="shrink-0 text-xs font-medium text-amber-700 dark:text-amber-300 underline underline-offset-2 min-h-11 flex items-center"
              aria-label="Reopen game"
            >
              Reopen
            </button>
          </div>
        </div>
      )}

      {/* Score Table */}
      <main className="flex-1 min-h-0 flex flex-col">
        <div className="w-fit min-w-[min(32rem,100%)] max-w-full mx-auto flex-1 min-h-0 overflow-auto">
          <ScoreTable game={game} onCellClick={handleCellClick} />
          {game.status === 'active' && (
            <AddRowButton
              nextRoundNumber={roundCount + 1}
              onAddRow={handleAddRow}
            />
          )}
        </div>
      </main>

      {/* End Game button (footer) */}
      {game.status === 'active' && game.players.length > 0 && game.rows.length > 0 && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-lg px-4 py-3">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => setEndGameOpen(true)}
              className="w-full py-3 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold transition-colors active:opacity-80 min-h-12"
            >
              End Game
            </button>
          </div>
        </div>
      )}

      {/* Score Entry Modal */}
      <ScoreEntryModal
        open={selectedCell !== null}
        onClose={() => setSelectedCell(null)}
        onSave={handleSaveScore}
        initialValue={selectedEntry?.value ?? null}
        playerName={selectedPlayer?.name ?? ''}
        playerColor={selectedPlayer?.color ?? '#888'}
        rowLabel={selectedRow?.label ?? ''}
        increments={game.increments}
      />

      {/* Settings */}
      <GameSettingsScreen
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        roomStatus={roomStatus}
        roomError={roomError}
        onCreateRoom={startRoom}
        onLeaveRoom={leaveRoom}
      />

      {/* Dice Roller */}
      <DiceRoller
        open={diceOpen}
        onClose={() => setDiceOpen(false)}
        onRoll={handleDiceRoll}
        history={game.diceHistory}
      />

      {/* End Game Modal */}
      <EndGameModal
        open={endGameOpen}
        onClose={() => setEndGameOpen(false)}
        game={game}
        onEndGame={handleEndGame}
      />
    </div>
  );
}

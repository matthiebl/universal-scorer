import type { Game, ScoreEntry } from '../types/game';
import { scoreKey } from '../types/game';
import type { GameAction } from './gameActions';

export function gameReducer(state: Game, action: GameAction): Game {
  const now = Date.now();

  switch (action.type) {
    case 'SET_SCORE': {
      const key = scoreKey(action.rowId, action.playerId);
      const existing = state.scores[key];
      const entry: ScoreEntry = {
        id: existing?.id ?? crypto.randomUUID(),
        playerId: action.playerId,
        rowId: action.rowId,
        value: action.value,
        note: action.note ?? existing?.note,
        timestamp: now,
      };
      return {
        ...state,
        scores: { ...state.scores, [key]: entry },
        updatedAt: now,
      };
    }

    case 'ADD_PLAYER': {
      const id = crypto.randomUUID();
      const order = state.players.length;
      return {
        ...state,
        players: [...state.players, { id, name: action.name, color: action.color, order }],
        updatedAt: now,
      };
    }

    case 'REMOVE_PLAYER': {
      const newScores = { ...state.scores };
      for (const key of Object.keys(newScores)) {
        if (key.endsWith(`_${action.playerId}`)) {
          delete newScores[key];
        }
      }
      return {
        ...state,
        players: state.players
          .filter((p) => p.id !== action.playerId)
          .map((p, i) => ({ ...p, order: i })),
        scores: newScores,
        updatedAt: now,
      };
    }

    case 'UPDATE_PLAYER': {
      return {
        ...state,
        players: state.players.map((p) =>
          p.id === action.playerId
            ? { ...p, ...(action.name !== undefined && { name: action.name }), ...(action.color !== undefined && { color: action.color }) }
            : p,
        ),
        updatedAt: now,
      };
    }

    case 'REORDER_PLAYERS': {
      const playerMap = new Map(state.players.map((p) => [p.id, p]));
      return {
        ...state,
        players: action.playerIds
          .map((id, i) => {
            const player = playerMap.get(id);
            return player ? { ...player, order: i } : null;
          })
          .filter((p): p is NonNullable<typeof p> => p !== null),
        updatedAt: now,
      };
    }

    case 'ADD_ROW': {
      const id = crypto.randomUUID();
      const order = state.rows.length;
      return {
        ...state,
        rows: [...state.rows, { ...action.row, id, order }],
        updatedAt: now,
      };
    }

    case 'REMOVE_ROW': {
      const newScores = { ...state.scores };
      for (const key of Object.keys(newScores)) {
        if (key.startsWith(`${action.rowId}_`)) {
          delete newScores[key];
        }
      }
      return {
        ...state,
        rows: state.rows
          .filter((r) => r.id !== action.rowId)
          .map((r, i) => ({ ...r, order: i })),
        scores: newScores,
        updatedAt: now,
      };
    }

    case 'UPDATE_ROW': {
      return {
        ...state,
        rows: state.rows.map((r) =>
          r.id === action.rowId ? { ...r, ...action.updates } : r,
        ),
        updatedAt: now,
      };
    }

    case 'REORDER_ROWS': {
      const rowMap = new Map(state.rows.map((r) => [r.id, r]));
      return {
        ...state,
        rows: action.rowIds
          .map((id, i) => {
            const row = rowMap.get(id);
            return row ? { ...row, order: i } : null;
          })
          .filter((r): r is NonNullable<typeof r> => r !== null),
        updatedAt: now,
      };
    }

    case 'ADD_DICE_ROLL': {
      return {
        ...state,
        diceHistory: [
          ...state.diceHistory,
          {
            id: crypto.randomUUID(),
            dice: action.dice,
            total: action.total,
            timestamp: now,
            label: action.label,
          },
        ],
        updatedAt: now,
      };
    }

    case 'SET_STATUS': {
      return { ...state, status: action.status, updatedAt: now };
    }

    case 'SET_NAME': {
      return { ...state, name: action.name, updatedAt: now };
    }

    case 'REMOTE_UPDATE': {
      // Firebase omits empty objects/arrays, so normalise missing fields.
      return {
        ...action.game,
        scores: action.game.scores ?? {},
        players: action.game.players ?? [],
        rows: action.game.rows ?? [],
        diceHistory: action.game.diceHistory ?? [],
      };
    }

    case 'LOAD_GAME': {
      return {
        ...action.game,
        scores: action.game.scores ?? {},
        players: action.game.players ?? [],
        rows: action.game.rows ?? [],
        diceHistory: action.game.diceHistory ?? [],
      };
    }

    default:
      return state;
  }
}

export function createEmptyGame(name: string): Game {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    name,
    players: [],
    rows: [],
    scores: {},
    diceHistory: [],
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };
}

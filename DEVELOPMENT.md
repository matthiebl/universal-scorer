# Development

## Design Decisions

### Flat Score Storage

Scores are stored as `Record<string, ScoreEntry>` keyed by `${rowId}_${playerId}` rather than nested objects. This gives O(1) lookups and makes Firebase partial updates simple — changing one score doesn't rewrite the entire scores object.

### State: Context + useReducer

A single `Game` object is the entire state for an active game. `GameProvider` wraps the game screen and handles reducer dispatch, debounced localStorage saves (500ms with flush-on-unmount), and a memoized context value so consumers only re-render when `game` actually changes.

### Scoring Engine

Four scoring types in `src/lib/scoring.ts`:

| Type | Behavior |
|------|----------|
| `manual` | User enters value directly |
| `sum` | Auto-sums specified source rows via `sourceRowIds` |
| `formula` | Evaluates a JS expression using row labels as variables |
| `bonus` | Like formula, typically for conditional bonuses (e.g. Yahtzee upper section >= 63 → +35) |

`computeAllScores()` batch-computes all (row, player) pairs in one pass. Compiled `new Function()` formulas are cached by source string, row labels are sanitized to JS identifiers once, and a visited set prevents infinite recursion from circular references.

### Score Table Performance

With templates like Yahtzee (16 rows x 6 players = 96 cells), naive rendering is sluggish. Key optimizations:

- `ScoreCell` accepts primitive props (`rowId`, `playerId`, `onCellClick`) instead of an inline closure, so `React.memo` can skip re-rendering unchanged cells
- `PlayerHeader` and `TotalsRow` are memo-wrapped
- `EndGameModal` guards its score computation behind `open` — returns early when closed
- Context value is memoized to prevent cascading re-renders

### Multiplayer Sync

Uses Firebase Realtime Database (not Firestore) for room sync because score updates are frequent and latency matters.

- **Room codes** are 6 alphanumeric characters, excluding confusable chars (I, O, 0, 1)
- **No authentication** — the room code is the access control
- **Echo prevention** — a `fromRemoteRef` flag prevents `REMOTE_UPDATE` dispatches from being pushed back to Firebase
- **Debounced push** (400ms) batches local changes before syncing
- The full `Game` object is stored at `rooms/{code}/game`

### Presets

Built-in presets are hardcoded TypeScript files exporting row templates with scoring rules. Custom presets save to localStorage. Community sharing uses Firestore (`ScorerPresets` collection) — users can publish/unpublish, and others can browse public presets. Each preset can define custom `increments` for the quick-entry number pad.

### Mobile-First UI

- Touch targets minimum 44px
- Score entry via bottom sheet modal with large number pad
- Sticky table header so player columns stay visible while scrolling
- Table uses `border-separate border-spacing-0` because `border-collapse` breaks sticky positioning
- Table width is `w-fit` with a min-width — compact on small screens, expands when players need room

### Firebase

Two products, both optional:

- **Realtime Database** — multiplayer room sync (`rooms/{code}/game`)
- **Firestore** — community preset storage (`ScorerPresets` collection)

Config loaded from `VITE_FIREBASE_*` env vars in `src/services/firebase.ts`.

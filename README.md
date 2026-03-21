# Game Scorer

A universal score tracker for card and board games. Mobile-first — designed for players sitting around a table with their phones.

## Features

- **Flexible scoring** — manual entry, auto-sum rows, formula/bonus rows (e.g. Yahtzee upper bonus), and grouped sections with subtotals
- **Game presets** — Yahtzee, Catan, Scrabble, and a generic template to start games quickly. Create and share your own via community publishing
- **Multiplayer rooms** — real-time score sync across devices using shareable 6-character room codes
- **Dice roller** — configurable dice with roll history
- **End game flow** — select winner(s) with confetti
- **Dark mode** — system-aware with manual toggle

## Getting Started

```bash
npm install
npm run dev
```

Local games work entirely offline via localStorage. For multiplayer rooms and community presets, configure Firebase environment variables:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_DATABASE_URL
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

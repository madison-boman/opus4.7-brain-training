# NeuroNova — Brain Training App

A polished, fully self-contained brain-training mobile app built with **React Native + Expo**. Inspired by apps like Lumosity and Elevate, NeuroNova ships with five fully playable mini-games, a complete progression system, animated rewards, and beautiful mobile UI patterns — all backed by **mock data only** (no backend required).

> Drop into Expo, launch on iOS / Android / Web, and play.

---

## Features

### Five Fully-Playable Games
| Game | Type | Skill |
|------|------|-------|
| **Light Sequence** | Simon-says pattern memory | Memory · Focus |
| **Shadow Matcher** | Drag-and-drop shape silhouettes | Problem solving · Focus |
| **Peek-a-Boo Grid** | Flash-memory grid recall | Memory · Reaction |
| **Number Sort** | Drag-and-drop ascending sort | Logic · Focus |
| **Math Sprint** | Mental arithmetic with combos | Problem solving · Reaction |

Every game ships with:
- Animated intro + difficulty selection (4 tiers)
- Real timers, scoring, combo multipliers, sound-effect placeholders (haptics)
- Difficulty scaling per round
- Polished completion screen with confetti, XP, chest, and achievement reveals

### Five Tabs
- **Home** — daily challenges, streak, XP/level progress, recent performance, recommended games
- **Games** — full library with skill filters, locked/unlocked states, featured "Daily Mix"
- **Progress** — memory / focus / reaction / logic / problem-solving charts (radar + line) and per-game stats
- **Achievements** — drag-to-reorder pinned badges, trophy progression, category filters, detail screen
- **Profile** — rank, brain titles, settings, showcase, full lifetime stats

### Progression System
- XP curve with auto level-up and rank titles ("Apprentice" → "Mind Sovereign")
- Animated XP bars and reward chests
- Achievement unlocks with bronze/silver/gold/platinum trophies
- Brain-coin currency
- Streak tracking with "Week Warrior" and "Iron Mind" achievements
- Per-skill cognitive index that evolves after every session

### Polish
- Reanimated micro-interactions (confetti, level-up banner, badge bursts, chest wiggle)
- Linear-gradient cards everywhere
- Custom SVG radar chart and line charts
- Dark, neon-cosmic theme with consistent typography + spacing
- Optimized layout for mobile (responsive Dimensions-based sizing, safe-area-aware)

---

## Run It

```bash
npm install
npx expo start
```

Open in iOS Simulator / Android Emulator / Expo Go / Web.

---

## Architecture

```
App.tsx                       # Providers + navigator
src/
  navigation/RootNavigator.tsx  # Stack + bottom tabs
  store/GameStore.tsx           # Single source of truth (mock data, XP, sessions, achievements)
  data/                         # Mock games, achievements, daily challenges
  theme/                        # Palette, gradients, spacing, typography, shadows
  components/                   # Reusable UI (cards, charts, confetti, chest, badge, HUD…)
  screens/                      # Tabs + games + result screens
  utils/                        # XP curve, helpers
```

Game state lives in a React Context (`GameStore`) that exposes `submitSession()`, achievement unlocks, daily-challenge progress, streaks and skill deltas. There is **no backend** — everything is computed and persisted in memory for the session.

---

## Built With
- Expo SDK 51, React 18, TypeScript
- React Navigation (native stack + bottom tabs)
- React Native Reanimated 3 (animations)
- React Native Gesture Handler (drag-and-drop)
- React Native SVG (charts)
- Expo Linear Gradient + Expo Haptics


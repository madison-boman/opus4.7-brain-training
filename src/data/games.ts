import { gradients } from '../theme';

export type SkillKey = 'memory' | 'focus' | 'reaction' | 'logic' | 'problem';

export const SKILL_META: Record<
  SkillKey,
  { label: string; color: string; icon: string }
> = {
  memory: { label: 'Memory', color: '#7C5CFF', icon: 'flash' },
  focus: { label: 'Focus', color: '#22D3EE', icon: 'eye' },
  reaction: { label: 'Reaction', color: '#FF6BCB', icon: 'speedometer' },
  logic: { label: 'Logic', color: '#3EE6A8', icon: 'extension-puzzle' },
  problem: { label: 'Problem Solving', color: '#FFD166', icon: 'bulb' },
};

export type GameId =
  | 'lightSequence'
  | 'shadowMatcher'
  | 'peekABoo'
  | 'numberSort'
  | 'mathSprint';

export interface GameMeta {
  id: GameId;
  title: string;
  tagline: string;
  description: string;
  emoji: string;
  gradient: readonly [string, string];
  primarySkill: SkillKey;
  secondarySkill: SkillKey;
  unlockLevel: number;
  bestScore?: number;
  difficultyTiers: string[];
  hidden?: boolean;
}

export const GAMES: GameMeta[] = [
  {
    id: 'lightSequence',
    title: 'Light Sequence',
    tagline: 'Repeat the glowing pattern',
    description:
      'A flashing pattern of colored panels appears. Tap them in the same order to keep the sequence alive.',
    emoji: '⚡️',
    gradient: gradients.primary,
    primarySkill: 'memory',
    secondarySkill: 'focus',
    unlockLevel: 1,
    difficultyTiers: ['Spark', 'Flash', 'Storm', 'Lightning'],
  },
  {
    id: 'shadowMatcher',
    title: 'Shadow Matcher',
    tagline: 'Drag shapes to their shadows',
    description:
      'Snap colorful shapes into their matching silhouettes. Each level the timer tightens.',
    emoji: '🌓',
    gradient: gradients.rose,
    primarySkill: 'problem',
    secondarySkill: 'focus',
    unlockLevel: 1,
    difficultyTiers: ['Calm', 'Quick', 'Rapid', 'Blitz'],
  },
  {
    id: 'peekABoo',
    title: 'Peek-a-Boo Grid',
    tagline: 'Remember the flashes',
    description:
      'Stars flash on a 3×3 grid for 2 seconds. Tap every cell that lit up before they vanished.',
    emoji: '✨',
    gradient: gradients.galaxy,
    primarySkill: 'memory',
    secondarySkill: 'reaction',
    unlockLevel: 1,
    difficultyTiers: ['Glimmer', 'Flicker', 'Strobe', 'Supernova'],
  },
  {
    id: 'numberSort',
    title: 'Number Sort',
    tagline: 'Drag numbers into order',
    description:
      'Drag scrambled tiles into ascending order before the clock runs out. Combos award bonus XP.',
    emoji: '🔢',
    gradient: gradients.forest,
    primarySkill: 'logic',
    secondarySkill: 'focus',
    unlockLevel: 2,
    difficultyTiers: ['Easy', 'Steady', 'Sharp', 'Genius'],
    hidden: true,
  },
  {
    id: 'mathSprint',
    title: 'Math Sprint',
    tagline: 'Solve before time burns out',
    description:
      'Lightning quick arithmetic. Build a combo by answering correctly in a row.',
    emoji: '➗',
    gradient: gradients.fire,
    primarySkill: 'problem',
    secondarySkill: 'reaction',
    unlockLevel: 3,
    difficultyTiers: ['Warmup', 'Sprint', 'Marathon', 'Inferno'],
    hidden: true,
  },
];

// Games surfaced in the UI. `GAMES` stays the full catalog so any saved
// references (sessions, achievements, gameById) keep resolving even when a
// game is hidden.
export const VISIBLE_GAMES: GameMeta[] = GAMES.filter((g) => !g.hidden);

export const gameById = (id: GameId): GameMeta =>
  GAMES.find((g) => g.id === id)!;

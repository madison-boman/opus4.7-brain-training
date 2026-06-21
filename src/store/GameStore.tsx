import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ACHIEVEMENTS, AchievementDef } from '../data/achievements';
import { GAMES, GameId, SkillKey } from '../data/games';
import {
  daysAgoKey,
  levelFromXp,
  rankColors,
  shuffle,
  titleForLevel,
  todayKey,
} from '../utils/helpers';

export interface GameSession {
  id: string;
  gameId: GameId;
  score: number;
  accuracy: number;
  combo: number;
  durationMs: number;
  difficultyTier: number;
  xpEarned: number;
  date: string;
  timestamp: number;
  skillDeltas: Record<SkillKey, number>;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  gameId: GameId;
  goal: number;
  metric: 'score' | 'combo' | 'accuracy';
  xpReward: number;
  progress: number;
  completed: boolean;
  emoji: string;
}

export interface SkillSnapshot {
  date: string;
  values: Record<SkillKey, number>;
}

const initialSkills: Record<SkillKey, number> = {
  memory: 540,
  focus: 510,
  reaction: 480,
  logic: 520,
  problem: 495,
};

const seedHistory = (): SkillSnapshot[] => {
  const series: SkillSnapshot[] = [];
  let cur = { ...initialSkills };
  for (let i = 13; i >= 0; i--) {
    cur = {
      memory: cur.memory + Math.round((Math.random() - 0.4) * 18),
      focus: cur.focus + Math.round((Math.random() - 0.4) * 16),
      reaction: cur.reaction + Math.round((Math.random() - 0.4) * 20),
      logic: cur.logic + Math.round((Math.random() - 0.4) * 14),
      problem: cur.problem + Math.round((Math.random() - 0.4) * 16),
    };
    series.push({ date: daysAgoKey(i), values: { ...cur } });
  }
  return series;
};

const seedSessions = (): GameSession[] => {
  const samples: GameSession[] = [];
  const ids = GAMES.map((g) => g.id);
  for (let i = 0; i < 12; i++) {
    const gameId = ids[Math.floor(Math.random() * ids.length)];
    const tier = Math.floor(Math.random() * 3);
    const score = 600 + Math.floor(Math.random() * 1400) + tier * 200;
    const accuracy = 0.7 + Math.random() * 0.28;
    const combo = 2 + Math.floor(Math.random() * 9);
    const dur = 60_000 + Math.floor(Math.random() * 90_000);
    const ts = Date.now() - i * (1000 * 60 * 60 * 14) - Math.floor(Math.random() * 1000 * 60 * 60 * 5);
    samples.push({
      id: `seed-${i}`,
      gameId,
      score,
      accuracy,
      combo,
      durationMs: dur,
      difficultyTier: tier,
      xpEarned: Math.round(score / 8),
      date: new Date(ts).toDateString(),
      timestamp: ts,
      skillDeltas: { memory: 0, focus: 0, reaction: 0, logic: 0, problem: 0 },
    });
  }
  return samples.sort((a, b) => b.timestamp - a.timestamp);
};

const buildDailies = (): DailyChallenge[] => {
  const pool: Omit<DailyChallenge, 'progress' | 'completed'>[] = [
    {
      id: 'd1',
      title: 'Memory Bootcamp',
      description: 'Reach a sequence of 8 in Light Sequence.',
      gameId: 'lightSequence',
      goal: 8,
      metric: 'score',
      xpReward: 120,
      emoji: '⚡️',
    },
    {
      id: 'd2',
      title: 'Eagle Eye',
      description: 'Score 1500+ on Peek-a-Boo Grid.',
      gameId: 'peekABoo',
      goal: 1500,
      metric: 'score',
      xpReward: 140,
      emoji: '👁️',
    },
    {
      id: 'd3',
      title: 'Combo Streak',
      description: 'Build a 7x combo in Math Sprint.',
      gameId: 'mathSprint',
      goal: 7,
      metric: 'combo',
      xpReward: 110,
      emoji: '🔥',
    },
    {
      id: 'd4',
      title: 'Order Keeper',
      description: 'Sort a 9-tile board in Number Sort.',
      gameId: 'numberSort',
      goal: 9,
      metric: 'score',
      xpReward: 130,
      emoji: '🔢',
    },
    {
      id: 'd5',
      title: 'Snap Master',
      description: 'Match 10 shapes in Shadow Matcher without missing.',
      gameId: 'shadowMatcher',
      goal: 10,
      metric: 'accuracy',
      xpReward: 150,
      emoji: '🌓',
    },
  ];
  return shuffle(pool)
    .slice(0, 3)
    .map((p) => ({ ...p, progress: 0, completed: false }));
};

interface State {
  totalXp: number;
  streak: number;
  longestStreak: number;
  trophies: number;
  brainCoins: number;
  bestScores: Partial<Record<GameId, number>>;
  unlockedAchievements: Record<string, number>;
  pinnedAchievements: string[];
  skills: Record<SkillKey, number>;
  skillHistory: SkillSnapshot[];
  sessions: GameSession[];
  dailies: DailyChallenge[];
  lastTrainingDate: string | null;
  username: string;
  avatarSeed: number;
}

const initialState: State = {
  totalXp: 1850,
  streak: 4,
  longestStreak: 9,
  trophies: 6,
  brainCoins: 320,
  bestScores: {
    lightSequence: 9,
    shadowMatcher: 12,
    peekABoo: 1820,
    numberSort: 7,
    mathSprint: 26,
  },
  unlockedAchievements: {
    'first-steps': Date.now() - 1000 * 60 * 60 * 24 * 9,
    'streak-3': Date.now() - 1000 * 60 * 60 * 24 * 4,
    'memory-master': Date.now() - 1000 * 60 * 60 * 24 * 2,
    'rapid-fire': Date.now() - 1000 * 60 * 60 * 26,
    'quick-thinker': Date.now() - 1000 * 60 * 60 * 18,
    'level-10': Date.now() - 1000 * 60 * 60 * 24 * 6,
  },
  pinnedAchievements: ['memory-master', 'rapid-fire', 'quick-thinker'],
  skills: { ...initialSkills, memory: 612, focus: 588, reaction: 540, logic: 568, problem: 555 },
  skillHistory: seedHistory(),
  sessions: seedSessions(),
  dailies: buildDailies(),
  lastTrainingDate: daysAgoKey(0),
  username: 'Nova',
  avatarSeed: 7,
};

interface SubmitSessionPayload {
  gameId: GameId;
  score: number;
  accuracy: number;
  combo: number;
  durationMs: number;
  difficultyTier: number;
  skillDeltas: Partial<Record<SkillKey, number>>;
  metricForDaily?: { metric: 'score' | 'combo' | 'accuracy'; value: number };
}

interface SubmitResult {
  session: GameSession;
  xpEarned: number;
  leveledUp: boolean;
  newLevel: number;
  unlockedAchievements: AchievementDef[];
  isNewBest: boolean;
  completedDailies: DailyChallenge[];
  brainCoinsEarned: number;
}

interface StoreContextValue extends State {
  level: number;
  xpInLevel: number;
  xpForCurrent: number;
  xpProgress: number;
  rankTitle: string;
  rankGradient: readonly [string, string];
  submitSession: (payload: SubmitSessionPayload) => SubmitResult;
  togglePinAchievement: (id: string) => void;
  reorderPinned: (ids: string[]) => void;
  refreshDailies: () => void;
  resetProgress: () => void;
  unlockAchievementById: (id: string) => AchievementDef | null;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export const GameStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<State>(initialState);

  const levelInfo = useMemo(() => levelFromXp(state.totalXp), [state.totalXp]);

  const unlockAchievementById = useCallback(
    (id: string): AchievementDef | null => {
      const def = ACHIEVEMENTS.find((a) => a.id === id);
      if (!def) return null;
      let unlocked: AchievementDef | null = null;
      setState((prev) => {
        if (prev.unlockedAchievements[id]) return prev;
        unlocked = def;
        return {
          ...prev,
          unlockedAchievements: {
            ...prev.unlockedAchievements,
            [id]: Date.now(),
          },
          totalXp: prev.totalXp + def.xpReward,
          trophies: prev.trophies + 1,
        };
      });
      return unlocked;
    },
    [],
  );

  const submitSession = useCallback(
    (payload: SubmitSessionPayload): SubmitResult => {
      const baseXp =
        Math.round(payload.score / 6) + payload.combo * 6 + Math.round(payload.accuracy * 80);
      const tierBonus = (payload.difficultyTier + 1) * 12;
      const xpEarned = Math.max(40, baseXp + tierBonus);
      const session: GameSession = {
        id: `s-${Date.now()}`,
        gameId: payload.gameId,
        score: payload.score,
        accuracy: payload.accuracy,
        combo: payload.combo,
        durationMs: payload.durationMs,
        difficultyTier: payload.difficultyTier,
        xpEarned,
        date: todayKey(),
        timestamp: Date.now(),
        skillDeltas: {
          memory: payload.skillDeltas.memory ?? 0,
          focus: payload.skillDeltas.focus ?? 0,
          reaction: payload.skillDeltas.reaction ?? 0,
          logic: payload.skillDeltas.logic ?? 0,
          problem: payload.skillDeltas.problem ?? 0,
        },
      };

      const previousLevel = levelInfo.level;
      let newTotalXp = state.totalXp + xpEarned;
      let unlocked: AchievementDef[] = [];

      // Calculate streak
      const today = todayKey();
      const yesterday = daysAgoKey(1);
      let streak = state.streak;
      let longestStreak = state.longestStreak;
      if (state.lastTrainingDate !== today) {
        if (state.lastTrainingDate === yesterday) streak = state.streak + 1;
        else streak = 1;
        if (streak > longestStreak) longestStreak = streak;
      }

      // Best score
      const prevBest = state.bestScores[payload.gameId] ?? 0;
      const isNewBest = payload.score > prevBest;
      const bestScores = isNewBest
        ? { ...state.bestScores, [payload.gameId]: payload.score }
        : state.bestScores;

      // Updated skills
      const newSkills = { ...state.skills };
      (Object.keys(newSkills) as SkillKey[]).forEach((k) => {
        const d = session.skillDeltas[k];
        newSkills[k] = Math.max(200, Math.min(1500, newSkills[k] + d));
      });

      // Skill history (today)
      let history = [...state.skillHistory];
      const todayIdx = history.findIndex((h) => h.date === today);
      if (todayIdx >= 0) {
        history[todayIdx] = { date: today, values: { ...newSkills } };
      } else {
        history.push({ date: today, values: { ...newSkills } });
        if (history.length > 14) history = history.slice(history.length - 14);
      }

      // Daily challenge progress
      const dailies = state.dailies.map((d) => {
        if (d.completed || d.gameId !== payload.gameId) return d;
        if (!payload.metricForDaily) return d;
        if (payload.metricForDaily.metric !== d.metric) return d;
        const newProgress = Math.max(d.progress, payload.metricForDaily.value);
        const completed = newProgress >= d.goal;
        return { ...d, progress: newProgress, completed };
      });
      const completedDailies = dailies.filter(
        (d) => d.completed && !state.dailies.find((sd) => sd.id === d.id)?.completed,
      );
      newTotalXp += completedDailies.reduce((acc, d) => acc + d.xpReward, 0);

      // Achievement unlocks
      const newUnlocks: Record<string, number> = { ...state.unlockedAchievements };
      const tryUnlock = (id: string) => {
        if (newUnlocks[id]) return;
        const def = ACHIEVEMENTS.find((a) => a.id === id);
        if (!def) return;
        newUnlocks[id] = Date.now();
        newTotalXp += def.xpReward;
        unlocked.push(def);
      };
      tryUnlock('first-steps');
      if (streak >= 3) tryUnlock('streak-3');
      if (streak >= 7) tryUnlock('streak-7');
      if (streak >= 30) tryUnlock('streak-30');
      if (payload.gameId === 'lightSequence' && payload.score >= 12) tryUnlock('memory-master');
      if (payload.gameId === 'peekABoo' && payload.accuracy >= 0.99 && payload.difficultyTier >= 2)
        tryUnlock('photographic');
      if (payload.gameId === 'mathSprint' && payload.combo >= 10) tryUnlock('quick-thinker');
      if (payload.gameId === 'shadowMatcher' && payload.combo >= 8) tryUnlock('rapid-fire');
      if (payload.accuracy >= 0.95) {
        const accSessions = state.sessions.filter((s) => s.accuracy >= 0.95).length + 1;
        if (accSessions >= 5) tryUnlock('sharp-shooter');
      }
      const playedTodayIds = new Set(
        state.sessions.filter((s) => s.date === today).map((s) => s.gameId),
      );
      playedTodayIds.add(payload.gameId);
      if (playedTodayIds.size >= GAMES.length) tryUnlock('completionist');

      const trophies = state.trophies + unlocked.length;

      // Level-up checks (level achievements)
      const newLevel = levelFromXp(newTotalXp).level;
      if (newLevel >= 10) tryUnlock('level-10');
      if (newLevel >= 25) tryUnlock('level-25');

      const brainCoinsEarned = Math.round(xpEarned / 4);

      setState((prev) => ({
        ...prev,
        totalXp: newTotalXp,
        streak,
        longestStreak,
        trophies,
        brainCoins: prev.brainCoins + brainCoinsEarned,
        bestScores,
        unlockedAchievements: newUnlocks,
        skills: newSkills,
        skillHistory: history,
        sessions: [session, ...prev.sessions].slice(0, 60),
        dailies,
        lastTrainingDate: today,
      }));

      return {
        session,
        xpEarned,
        leveledUp: newLevel > previousLevel,
        newLevel,
        unlockedAchievements: unlocked,
        isNewBest,
        completedDailies,
        brainCoinsEarned,
      };
    },
    [state, levelInfo.level],
  );

  const togglePinAchievement = useCallback((id: string) => {
    setState((prev) => {
      const has = prev.pinnedAchievements.includes(id);
      const pinned = has
        ? prev.pinnedAchievements.filter((p) => p !== id)
        : [...prev.pinnedAchievements, id].slice(-6);
      return { ...prev, pinnedAchievements: pinned };
    });
  }, []);

  const reorderPinned = useCallback((ids: string[]) => {
    setState((prev) => ({ ...prev, pinnedAchievements: ids }));
  }, []);

  const refreshDailies = useCallback(() => {
    setState((prev) => ({ ...prev, dailies: buildDailies() }));
  }, []);

  const resetProgress = useCallback(() => {
    setState({ ...initialState, sessions: [], skillHistory: seedHistory(), dailies: buildDailies() });
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
      ...state,
      level: levelInfo.level,
      xpInLevel: levelInfo.into,
      xpForCurrent: levelInfo.need,
      xpProgress: levelInfo.progress,
      rankTitle: titleForLevel(levelInfo.level),
      rankGradient: rankColors(levelInfo.level),
      submitSession,
      togglePinAchievement,
      reorderPinned,
      refreshDailies,
      resetProgress,
      unlockAchievementById,
    }),
    [state, levelInfo, submitSession, togglePinAchievement, reorderPinned, refreshDailies, resetProgress, unlockAchievementById],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useGameStore = (): StoreContextValue => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useGameStore must be used inside GameStoreProvider');
  return ctx;
};

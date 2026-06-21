import { GameId } from '../data/games';
import { GameSession } from '../store/GameStore';
import { AchievementDef } from '../data/achievements';

export type RootStackParamList = {
  Tabs: undefined;
  Game: { gameId: GameId };
  GameResult: {
    gameId: GameId;
    score: number;
    accuracy: number;
    combo: number;
    durationMs: number;
    difficultyTier: number;
    xpEarned: number;
    leveledUp: boolean;
    newLevel: number;
    isNewBest: boolean;
    brainCoinsEarned: number;
    unlockedAchievementIds: string[];
    completedDailyIds: string[];
  };
  AchievementDetail: { id: string };
};

export type TabParamList = {
  Home: undefined;
  Games: undefined;
  Progress: undefined;
  Achievements: undefined;
  Profile: undefined;
};

export type SessionLike = GameSession;
export type AchievementLike = AchievementDef;

import { gradients } from '../theme';

export type AchievementCategory = 'streak' | 'mastery' | 'speed' | 'memory' | 'logic' | 'milestone';

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: readonly [string, string];
  category: AchievementCategory;
  xpReward: number;
  trophy?: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first-steps',
    title: 'First Steps',
    description: 'Finish your first training session.',
    icon: 'footsteps',
    gradient: gradients.primary,
    category: 'milestone',
    xpReward: 50,
    trophy: 'bronze',
  },
  {
    id: 'streak-3',
    title: 'On a Roll',
    description: 'Maintain a 3 day streak.',
    icon: 'flame',
    gradient: gradients.fire,
    category: 'streak',
    xpReward: 75,
    trophy: 'bronze',
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: 'Train every day for a full week.',
    icon: 'flame',
    gradient: gradients.sunset,
    category: 'streak',
    xpReward: 200,
    trophy: 'silver',
  },
  {
    id: 'streak-30',
    title: 'Iron Mind',
    description: 'Hit a 30 day streak.',
    icon: 'shield',
    gradient: gradients.gold,
    category: 'streak',
    xpReward: 800,
    trophy: 'gold',
  },
  {
    id: 'memory-master',
    title: 'Memory Master',
    description: 'Reach a 12-step Light Sequence.',
    icon: 'flash',
    gradient: gradients.galaxy,
    category: 'memory',
    xpReward: 250,
    trophy: 'silver',
  },
  {
    id: 'photographic',
    title: 'Photographic',
    description: 'Score 100% on Peek-a-Boo at Strobe difficulty.',
    icon: 'aperture',
    gradient: gradients.rose,
    category: 'memory',
    xpReward: 350,
    trophy: 'gold',
  },
  {
    id: 'quick-thinker',
    title: 'Quick Thinker',
    description: 'Build a 10x combo in Math Sprint.',
    icon: 'bulb',
    gradient: gradients.fire,
    category: 'logic',
    xpReward: 200,
    trophy: 'silver',
  },
  {
    id: 'rapid-fire',
    title: 'Rapid Fire',
    description: 'Average reaction below 350ms in Shadow Matcher.',
    icon: 'speedometer',
    gradient: gradients.ice,
    category: 'speed',
    xpReward: 220,
    trophy: 'silver',
  },
  {
    id: 'sharp-shooter',
    title: 'Sharp Shooter',
    description: 'Achieve 95% accuracy across 5 sessions.',
    icon: 'locate',
    gradient: gradients.forest,
    category: 'mastery',
    xpReward: 300,
    trophy: 'gold',
  },
  {
    id: 'level-10',
    title: 'Brain Hacker',
    description: 'Reach level 10.',
    icon: 'rocket',
    gradient: gradients.primary,
    category: 'milestone',
    xpReward: 400,
    trophy: 'gold',
  },
  {
    id: 'level-25',
    title: 'Cognition Master',
    description: 'Reach level 25.',
    icon: 'planet',
    gradient: gradients.galaxy,
    category: 'milestone',
    xpReward: 1000,
    trophy: 'platinum',
  },
  {
    id: 'completionist',
    title: 'Completionist',
    description: 'Play every game in a single day.',
    icon: 'trophy',
    gradient: gradients.gold,
    category: 'mastery',
    xpReward: 500,
    trophy: 'gold',
  },
];

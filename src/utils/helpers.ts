export const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

export const random = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const shuffle = <T,>(arr: T[]): T[] => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

export const formatNumber = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
};

export const formatTime = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const xpForLevel = (level: number): number =>
  Math.round(120 * Math.pow(level, 1.55));

export const totalXpUpToLevel = (level: number): number => {
  let total = 0;
  for (let i = 1; i < level; i++) total += xpForLevel(i);
  return total;
};

export const levelFromXp = (totalXp: number) => {
  let level = 1;
  let acc = 0;
  while (acc + xpForLevel(level) <= totalXp) {
    acc += xpForLevel(level);
    level += 1;
  }
  const into = totalXp - acc;
  const need = xpForLevel(level);
  return { level, into, need, progress: need === 0 ? 0 : into / need };
};

export const titleForLevel = (level: number): string => {
  if (level >= 60) return 'Mind Sovereign';
  if (level >= 50) return 'Cortex Overlord';
  if (level >= 40) return 'Synaptic Sage';
  if (level >= 30) return 'Neural Architect';
  if (level >= 22) return 'Cognition Master';
  if (level >= 16) return 'Mind Shaper';
  if (level >= 10) return 'Brain Hacker';
  if (level >= 6) return 'Sharp Thinker';
  if (level >= 3) return 'Curious Mind';
  return 'Apprentice';
};

export const rankColors = (level: number): readonly [string, string] => {
  if (level >= 50) return ['#FFD166', '#FF9F4A'] as const;
  if (level >= 40) return ['#FF6BCB', '#7C5CFF'] as const;
  if (level >= 30) return ['#5A3FE0', '#22D3EE'] as const;
  if (level >= 20) return ['#3EE6A8', '#22D3EE'] as const;
  if (level >= 10) return ['#7C5CFF', '#22D3EE'] as const;
  return ['#4F8DFF', '#22D3EE'] as const;
};

export const todayKey = () => new Date().toDateString();

export const daysAgoKey = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toDateString();
};

export const prettyDate = (date: Date) =>
  date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export const sample = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const palette = {
  bg: '#0B0B1F',
  bgElevated: '#13132B',
  surface: '#1B1B38',
  surfaceAlt: '#23234A',
  border: 'rgba(255,255,255,0.08)',
  text: '#F5F6FF',
  textDim: '#9D9FBF',
  textMuted: '#6C6F94',

  primary: '#7C5CFF',
  primaryDeep: '#5A3FE0',
  accent: '#22D3EE',
  pink: '#FF6BCB',
  green: '#3EE6A8',
  yellow: '#FFD166',
  red: '#FF5E7A',
  blue: '#4F8DFF',
  purple: '#9D6CFF',
  orange: '#FF9F4A',

  shadow: 'rgba(0,0,0,0.4)',
};

export const gradients = {
  primary: ['#7C5CFF', '#22D3EE'] as const,
  sunset: ['#FF6BCB', '#FF9F4A'] as const,
  forest: ['#3EE6A8', '#22D3EE'] as const,
  fire: ['#FF5E7A', '#FFD166'] as const,
  galaxy: ['#5A3FE0', '#22D3EE'] as const,
  night: ['#0B0B1F', '#1B1B38'] as const,
  card: ['#1B1B38', '#23234A'] as const,
  gold: ['#FFD166', '#FF9F4A'] as const,
  ice: ['#4F8DFF', '#22D3EE'] as const,
  rose: ['#FF6BCB', '#7C5CFF'] as const,
};

export const radii = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const typography = {
  display: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.5 },
  h1: { fontSize: 26, fontWeight: '800' as const, letterSpacing: -0.3 },
  h2: { fontSize: 20, fontWeight: '700' as const },
  h3: { fontSize: 17, fontWeight: '700' as const },
  body: { fontSize: 15, fontWeight: '500' as const },
  caption: { fontSize: 13, fontWeight: '500' as const },
  tiny: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.5 },
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 12,
  }),
};

export const colors = {
  bg: '#07090A',
  bgElevated: '#0E1311',
  card: 'rgba(255,255,255,0.06)',
  cardSolid: '#141A17',
  cardAlt: 'rgba(255,255,255,0.10)',
  text: '#F5F7F6',
  muted: '#97A39D',
  faint: '#5E6A64',
  accent: '#3DDC84',
  accent2: '#B4F461',
  accentDark: '#14532D',
  warm: '#FF8A3D',
  warn: '#FFB547',
  bad: '#FF6B6B',
  blue: '#5AC8FA',
  violet: '#A78BFA',
  border: 'rgba(255,255,255,0.09)',
};

export const gradients = {
  accent: ['#B4F461', '#3DDC84', '#16A34A'] as const,
  warm: ['#FFB547', '#FF7A1A', '#E23D28'] as const,
  calm: ['#5AC8FA', '#3DDC84'] as const,
  violet: ['#C4B5FD', '#7C3AED'] as const,
  card: ['rgba(255,255,255,0.10)', 'rgba(255,255,255,0.03)'] as const,
};

export const radius = { sm: 12, md: 18, lg: 26, pill: 999 };

export const type = {
  hero: { fontSize: 34, fontWeight: '900' as const, letterSpacing: -0.8 },
  h1: { fontSize: 26, fontWeight: '800' as const, letterSpacing: -0.5 },
  h2: { fontSize: 19, fontWeight: '800' as const, letterSpacing: -0.3 },
  body: { fontSize: 15, lineHeight: 22 },
  small: { fontSize: 12.5, lineHeight: 17 },
  label: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 1.1, textTransform: 'uppercase' as const },
};

// Design tokens for everything built from the auto-build roadmap onwards.
// The demo screens keep using src/theme.ts (dark look, neon accent) so nothing
// that already works changes; new screens import from here instead, and the
// two meet on the shared palette re-exported below.
import { colors as demoColors, gradients, radius as demoRadius, type as demoType } from '../theme';

export const brand = {
  // FitPlate green: the brand colour for buttons, highlights and charts.
  primary: '#1E8A5A',
  primaryPressed: '#17704A',
  primarySoft: 'rgba(30,138,90,0.16)',
  onPrimary: '#FFFFFF',
} as const;

export const colors = {
  ...demoColors,
  primary: brand.primary,
  primaryPressed: brand.primaryPressed,
  primarySoft: brand.primarySoft,
  onPrimary: brand.onPrimary,
  // Trend arrows and gentle status colours; never alarm-red for health copy.
  trendUp: demoColors.warn,
  trendDown: demoColors.accent,
  info: demoColors.blue,
} as const;

// 4-point spacing scale.
export const spacing = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

export const radius = { ...demoRadius, xs: 6 } as const;

export const typography = {
  ...demoType,
  // Large step text for guided cook mode and workout player.
  step: { fontSize: 24, lineHeight: 32, fontWeight: '700' as const },
  number: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
} as const;

// Minimum touch target (Apple HIG / Material) for one-thumb use.
export const touchTarget = 44;

export { gradients };

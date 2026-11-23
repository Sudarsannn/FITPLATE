import { describe, expect, it } from '@jest/globals';

import { colors } from '../theme';

const channel = (c: number) => {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const lum = (hex: string) => {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};
const ratio = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
/** The raised card colour: 10 percent white over the page background. */
const cardAltOnBg = () => {
  const h = colors.bg.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => Math.round(parseInt(h.slice(i, i + 2), 16) * 0.9 + 25.5));
  return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');
};

describe('text contrast (WCAG AA, 4.5:1 for small text)', () => {
  const surfaces = () => [colors.bg, colors.bgElevated, colors.cardSolid, cardAltOnBg()];
  it.each(['text', 'muted', 'faint', 'accent', 'warn', 'bad', 'blue', 'warm'] as const)('%s text is readable on every surface', (name) => {
    for (const surface of surfaces()) expect(ratio(colors[name], surface)).toBeGreaterThanOrEqual(4.5);
  });
});

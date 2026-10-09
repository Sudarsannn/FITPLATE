import { describe, expect, it } from '@jest/globals';

import { featureFlags, isEnabled, type FeatureFlag } from '../config/featureFlags';
import { brand, colors, spacing } from '../config/theme';

describe('feature flags', () => {
  it('ships every unfinished feature switched off', () => {
    for (const flag of Object.keys(featureFlags) as FeatureFlag[]) {
      expect(isEnabled(flag)).toBe(false);
    }
  });

  it('reads an overridden flag set', () => {
    const flags = { ...featureFlags, voiceSteps: true };
    expect(isEnabled('voiceSteps', flags)).toBe(true);
    expect(isEnabled('cloudSync', flags)).toBe(false);
  });
});

describe('theme tokens', () => {
  it('uses FitPlate green as the brand primary', () => {
    expect(brand.primary).toBe('#1E8A5A');
    expect(colors.primary).toBe(brand.primary);
  });

  it('keeps the demo palette available to new screens', () => {
    expect(colors.bg).toBe('#07090A');
    expect(colors.accent).toBe('#3DDC84');
  });

  it('has an increasing spacing scale', () => {
    const values = Object.values(spacing);
    expect([...values].sort((a, b) => a - b)).toEqual(values);
  });
});

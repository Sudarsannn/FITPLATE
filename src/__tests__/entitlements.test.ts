import { describe, expect, it } from '@jest/globals';

import { ALL_GATED, entitled, FEATURE_INFO, FEATURE_TIERS, hasPaidFeatures, lockedFeatures, planFromToggles, PLUS_PREVIEW_TOGGLE, type GatedFeature, type Tier } from '../config/entitlements';

const tiers = (over: Partial<Record<GatedFeature, Tier>>): Record<GatedFeature, Tier> => ({ ...FEATURE_TIERS, ...over });

describe('entitlements', () => {
  it('ships with everything free (an open decision for the owner)', () => {
    expect(ALL_GATED.every((f) => FEATURE_TIERS[f] === 'free')).toBe(true);
    expect(hasPaidFeatures()).toBe(false);
    expect(lockedFeatures('free')).toEqual([]);
  });
  it('flipping a feature to plus locks it for the free plan and unlocks it for plus', () => {
    const t = tiers({ charts: 'plus' });
    expect(entitled('charts', 'free', t)).toBe(false);
    expect(entitled('charts', 'plus', t)).toBe(true);
    expect(entitled('prices', 'free', t)).toBe(true);
    expect(lockedFeatures('free', t)).toEqual(['charts']);
    expect(lockedFeatures('plus', t)).toEqual([]);
    expect(hasPaidFeatures(t)).toBe(true);
  });
  it('flipping it back unlocks it again', () => {
    expect(entitled('charts', 'free', tiers({ charts: 'plus' }))).toBe(false);
    expect(entitled('charts', 'free', tiers({ charts: 'free' }))).toBe(true);
  });
  it('the preview switch is the only thing that makes a plan plus', () => {
    expect(planFromToggles(undefined)).toBe('free');
    expect(planFromToggles({})).toBe('free');
    expect(planFromToggles({ [PLUS_PREVIEW_TOGGLE]: false })).toBe('free');
    expect(planFromToggles({ [PLUS_PREVIEW_TOGGLE]: true })).toBe('plus');
  });
  it('every gated feature has a name and a blurb for the upgrade screen', () => {
    for (const f of ALL_GATED) {
      expect(FEATURE_INFO[f].name.length).toBeGreaterThan(3);
      expect(FEATURE_INFO[f].blurb.length).toBeGreaterThan(10);
    }
  });
});

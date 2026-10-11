import { describe, expect, it } from '@jest/globals';

import { shouldUseLite } from '../services/liteMode';

describe('shouldUseLite', () => {
  it('keeps videos on a normal connection without Reduce motion', () => {
    expect(shouldUseLite({ reduceMotion: false })).toBe(false);
    expect(shouldUseLite({ reduceMotion: false, saveData: false, effectiveType: '4g' })).toBe(false);
    expect(shouldUseLite({ reduceMotion: false, effectiveType: '3g' })).toBe(false);
  });

  it('switches to lite for Reduce motion, Data Saver or 2G', () => {
    expect(shouldUseLite({ reduceMotion: true })).toBe(true);
    expect(shouldUseLite({ reduceMotion: false, saveData: true })).toBe(true);
    expect(shouldUseLite({ reduceMotion: false, effectiveType: '2g' })).toBe(true);
    expect(shouldUseLite({ reduceMotion: false, effectiveType: 'slow-2g' })).toBe(true);
  });

  it('ignores unknown network labels', () => {
    expect(shouldUseLite({ reduceMotion: false, effectiveType: 'wifi' })).toBe(false);
  });
});

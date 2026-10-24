import { describe, expect, it } from '@jest/globals';

import { stepIcon, whyItWorks } from '../services/cookGuide';
import { MUSIC_MOODS, MUSIC_SERVICES } from '../services/music';

describe('cook guide', () => {
  it('picks a picture from the step words', () => {
    expect(stepIcon('Chop the onion finely')).toBe('cut-outline');
    expect(stepIcon('Heat the oil in a kadai')).toBe('flame-outline');
    expect(stepIcon('Do something unusual')).toBe('sparkles-outline');
  });
  it('explains only techniques the step names', () => {
    expect(whyItWorks('Add the cumin for the tadka')).toMatch(/fat/);
    expect(whyItWorks('Pressure cook for 3 whistles')).toMatch(/120/);
    expect(whyItWorks('Garnish with coriander')).toBeNull();
  });
});

describe('music links', () => {
  it('builds a search link for every service and mood', () => {
    for (const kind of ['cooking', 'workout'] as const)
      for (const m of MUSIC_MOODS[kind]) for (const s of MUSIC_SERVICES) expect(s.url(m.query)).toMatch(/^https:\/\/.+/);
    expect(MUSIC_SERVICES.find((s) => s.id === 'apple')!.url('cooking playlist')).toBe('https://music.apple.com/search?term=cooking%20playlist');
  });
});

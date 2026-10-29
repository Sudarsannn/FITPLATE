import { describe, expect, it, jest } from '@jest/globals';

import { stepSpeech } from '../lib/speak';

jest.mock('expo-speech', () => ({ speak: jest.fn(), stop: jest.fn() }));

describe('stepSpeech', () => {
  it('reads the title, the instruction and the timer', () => {
    expect(stepSpeech({ title: 'Temper the spices.', text: 'Heat oil and add cumin.', timerSec: 90 })).toBe('Temper the spices. Heat oil and add cumin. Timer: 1 minute 30 seconds.');
  });
  it('skips a title that repeats the text and a missing timer', () => {
    expect(stepSpeech({ title: 'Stir well', text: 'Stir well', timerSec: null })).toBe('Stir well');
  });
  it('says whole minutes plainly', () => {
    expect(stepSpeech({ text: 'Simmer.', timerSec: 600 })).toBe('Simmer. Timer: 10 minutes.');
  });
});

import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { ringAlarm } from '../lib/alarm';

const mockNotify = jest.fn(async () => {});
jest.mock('expo-haptics', () => ({ notificationAsync: (...a: unknown[]) => mockNotify(...(a as [])), NotificationFeedbackType: { Warning: 'warning' } }));
jest.mock('react-native', () => ({ Platform: { OS: 'ios' } }));

describe('timer alarm', () => {
  afterEach(() => {
    jest.useRealTimers();
    mockNotify.mockClear();
  });
  it('buzzes three times on a phone, 700 ms apart', () => {
    jest.useFakeTimers();
    ringAlarm();
    jest.advanceTimersByTime(2000);
    expect(mockNotify).toHaveBeenCalledTimes(3);
  });
});

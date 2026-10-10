import { describe, expect, it, jest } from '@jest/globals';

import { addDays, dayKey, type DayLog } from '../lib/store';
import { lastSevenDaysActivity } from '../services/activity';

// The store module also sets up Firebase sign-in, which Jest cannot load (ESM).
// These tests only need its date helpers, so Firebase is stubbed out. Jest
// hoists these calls above the imports.
jest.mock('firebase/auth', () => ({ onAuthStateChanged: jest.fn(), signOut: jest.fn() }));
jest.mock('../lib/firebase', () => ({ firebaseConfigured: false, getFirebaseAuth: () => null }));

const now = new Date(2026, 9, 10, 12, 0);
const day = (exercise: DayLog['exercise']): DayLog => ({ meals: [], exercise, water: 0 });

describe('lastSevenDaysActivity', () => {
  it('returns zeros when nothing is logged', () => {
    expect(lastSevenDaysActivity({}, now)).toEqual({ sessions: 0, minutes: 0, kcal: 0, activeDays: 0 });
  });

  it('sums workouts from today and the six days before', () => {
    const days = {
      [dayKey(now)]: day([{ type: 'Walk', minutes: 30, kcal: 120, at: 0 }]),
      [dayKey(addDays(now, -6))]: day([
        { type: 'Yoga', minutes: 20, kcal: 60, at: 0 },
        { type: 'Run', minutes: 15, kcal: 150, at: 0 },
      ]),
    };
    expect(lastSevenDaysActivity(days, now)).toEqual({ sessions: 3, minutes: 65, kcal: 330, activeDays: 2 });
  });

  it('ignores workouts older than seven days and days with no workout', () => {
    const days = {
      [dayKey(addDays(now, -7))]: day([{ type: 'Walk', minutes: 30, kcal: 120, at: 0 }]),
      [dayKey(addDays(now, -1))]: day([]),
    };
    expect(lastSevenDaysActivity(days, now)).toEqual({ sessions: 0, minutes: 0, kcal: 0, activeDays: 0 });
  });
});

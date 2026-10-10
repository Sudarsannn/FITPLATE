import { describe, expect, it } from '@jest/globals';

import { ALL_TAB_ROUTES, dishLibraryHref, LEGACY_TABS, profileHref, SHELL_TABS, visibleTabs } from '../config/tabs';

describe('tab shell', () => {
  it('shows the five Day 2 tabs in order when the new shell is on', () => {
    expect(visibleTabs(true).map((t) => t.label)).toEqual(['Today', 'Cook', 'Track', 'Move', 'Profile']);
  });

  it('keeps the demo four tabs when the new shell is off', () => {
    expect(visibleTabs(false).map((t) => t.name)).toEqual(['index', 'discover', 'plan', 'progress']);
  });

  it('keeps Today as the first tab in both shells, so the calorie ring stays the home screen', () => {
    expect(SHELL_TABS[0].name).toBe('index');
    expect(LEGACY_TABS[0].name).toBe('index');
  });

  it('registers every tab route exactly once, so old links still resolve', () => {
    expect(new Set(ALL_TAB_ROUTES).size).toBe(ALL_TAB_ROUTES.length);
    for (const t of [...SHELL_TABS, ...LEGACY_TABS]) expect(ALL_TAB_ROUTES).toContain(t.name);
  });

  it('never names a tab route "profile", which is already a stack screen', () => {
    expect(ALL_TAB_ROUTES).not.toContain('profile');
  });

  it('gives every tab a label and two icons', () => {
    for (const t of SHELL_TABS) {
      expect(t.label.length).toBeGreaterThan(0);
      expect(t.icon).not.toBe(t.iconOutline);
    }
  });

  it('points links at the right screens for each shell', () => {
    expect(dishLibraryHref(true)).toBe('/cook');
    expect(dishLibraryHref(false)).toBe('/discover');
    expect(profileHref(true)).toBe('/me');
    expect(profileHref(false)).toBe('/profile');
  });
});

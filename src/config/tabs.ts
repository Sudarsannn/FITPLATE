import type { Ionicons } from '@expo/vector-icons';

import { featureFlags } from './featureFlags';

type IconName = keyof typeof Ionicons.glyphMap;

export type TabDef = {
  /** Route file name inside src/app/(tabs)/. */
  name: string;
  label: string;
  icon: IconName;
  iconOutline: IconName;
};

// The demo's four tabs. They stay as files so old links keep working even
// after the new shell takes over the tab bar.
export const LEGACY_TABS: readonly TabDef[] = [
  { name: 'index', label: 'Today', icon: 'flame', iconOutline: 'flame-outline' },
  { name: 'discover', label: 'Discover', icon: 'compass', iconOutline: 'compass-outline' },
  { name: 'plan', label: 'Plan', icon: 'calendar', iconOutline: 'calendar-outline' },
  { name: 'progress', label: 'Progress', icon: 'stats-chart', iconOutline: 'stats-chart-outline' },
];

// Day 2 shell. The Profile tab's file is `me` because `/profile` is already
// the stack screen opened from the Today avatar, and two routes cannot share a URL.
export const SHELL_TABS: readonly TabDef[] = [
  { name: 'index', label: 'Today', icon: 'flame', iconOutline: 'flame-outline' },
  { name: 'cook', label: 'Cook', icon: 'restaurant', iconOutline: 'restaurant-outline' },
  { name: 'track', label: 'Track', icon: 'stats-chart', iconOutline: 'stats-chart-outline' },
  { name: 'move', label: 'Move', icon: 'barbell', iconOutline: 'barbell-outline' },
  { name: 'me', label: 'Profile', icon: 'person-circle', iconOutline: 'person-circle-outline' },
];

/** Every route file in (tabs), so the layout can register each one exactly once. */
export const ALL_TAB_ROUTES: readonly string[] = Array.from(new Set([...LEGACY_TABS, ...SHELL_TABS].map((t) => t.name)));

export function visibleTabs(newShell: boolean = featureFlags.newTabShell): readonly TabDef[] {
  return newShell ? SHELL_TABS : LEGACY_TABS;
}

/** Where "find a dish" and "see all" links go in the current shell. */
export function dishLibraryHref(newShell: boolean = featureFlags.newTabShell): '/cook' | '/discover' {
  return newShell ? '/cook' : '/discover';
}

/** Where the Today avatar goes: the Profile tab in the new shell, the stack screen before it. */
export function profileHref(newShell: boolean = featureFlags.newTabShell): '/me' | '/profile' {
  return newShell ? '/me' : '/profile';
}

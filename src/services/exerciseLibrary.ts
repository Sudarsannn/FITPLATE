/**
 * Day 21: search and filters for the Move tab, on the shared rules in
 * search.ts. Chips come only from research fields, and a chip is shown only
 * when at least one exercise matches it, so the library grows with each import.
 */
import type { Exercise } from '../models/exercise';
import { shortExerciseName } from './fitness';
import type { FilterGroup, FilterOption, SearchDoc } from './search';

export const exerciseDoc = (e: Exercise): SearchDoc => ({
  id: e.id,
  name: shortExerciseName(e.name),
  aliases: [e.name, ...e.otherNames],
  tags: e.tags,
  extra: [...e.musclesPrimary, ...e.musclesSecondary, ...(e.searchTags?.bodyRegion ?? [])],
});

export const byNumber = (a: Exercise, b: Exercise) => (a.number ?? 999) - (b.number ?? 999) || a.name.localeCompare(b.name);

const minutesOf = (e: Exercise) => e.searchTags?.typicalMinutes ?? null;
const hasNoGear = (e: Exercise) => e.gymAccess.includes('none') || (e.gymAccess.length === 0 && e.equipment.every((x) => /optional/i.test(x)));

const ACCESS: { id: string; label: string; test: (e: Exercise) => boolean }[] = [
  { id: 'none', label: 'No equipment', test: hasNoGear },
  { id: 'home_equipment', label: 'Home equipment', test: (e) => e.gymAccess.includes('home_equipment') },
  { id: 'basic_gym', label: 'Basic gym', test: (e) => e.gymAccess.includes('basic_gym') },
  { id: 'full_gym', label: 'Full gym', test: (e) => e.gymAccess.includes('full_gym') },
];

const REGIONS: [string, string][] = [
  ['upper', 'Upper body'],
  ['lower', 'Lower body'],
  ['core', 'Core'],
  ['full_body', 'Full body'],
];
const LEVELS: [string, string][] = [
  ['beginner', 'Beginner'],
  ['intermediate', 'Intermediate'],
  ['advanced', 'Advanced'],
];
const TIMES: { id: string; label: string; test: (m: number) => boolean }[] = [
  { id: 'u5', label: 'Under 5 min', test: (m) => m < 5 },
  { id: '5to10', label: '5 to 10 min', test: (m) => m >= 5 && m <= 10 },
  { id: 'o10', label: 'Over 10 min', test: (m) => m > 10 },
];

export function exerciseFilterGroups(items: readonly Exercise[]): FilterGroup<Exercise>[] {
  const keep = (opts: FilterOption<Exercise>[]) => opts.filter((o) => items.some(o.test));
  const groups: FilterGroup<Exercise>[] = [
    { id: 'gear', label: 'What I have', mode: 'any', options: keep(ACCESS.map((a) => ({ id: a.id, label: a.label, test: a.test }))) },
    { id: 'muscle', label: 'Muscle group', mode: 'any', options: keep(REGIONS.map(([id, label]) => ({ id, label, test: (e: Exercise) => e.searchTags?.bodyRegion.includes(id) ?? false }))) },
    { id: 'level', label: 'Level', mode: 'any', options: keep(LEVELS.map(([id, label]) => ({ id, label, test: (e: Exercise) => e.level === id }))) },
    {
      id: 'home',
      label: 'Flat-friendly and quiet',
      mode: 'any',
      options: keep([
        { id: 'flat', label: 'Flat-friendly', test: (e) => e.flatFriendly === true },
        { id: 'quiet', label: 'Quiet', test: (e) => e.searchTags?.noise === 'quiet' },
      ]),
    },
    { id: 'time', label: 'Time', mode: 'any', options: keep(TIMES.map((t) => ({ id: t.id, label: t.label, test: (e: Exercise) => { const m = minutesOf(e); return m != null && t.test(m); } }))) },
  ];
  return groups.filter((g) => g.options.length > 0);
}

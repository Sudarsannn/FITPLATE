import { DEFAULT_SURVEY } from '../../models/survey';
import type { DocSchema } from './repository';

/**
 * Every user collection and its current schema version. Bump `version` and
 * add a migration whenever a document type changes; never rename or delete a
 * field users already have data in (SPEC-ADDENDA §5). Keep docs/DATA_MODEL.md
 * in step with this file.
 */
export const SCHEMAS = {
  // v2 (22 Oct 2026): the profile survey's answers under `survey`.
  profile: { collection: 'profile', version: 2, migrations: { 1: (d) => ({ ...d, survey: { ...DEFAULT_SURVEY } }) } },
  mealLogs: { collection: 'mealLogs', version: 1, migrations: {} },
  waterLogs: { collection: 'waterLogs', version: 1, migrations: {} },
  supplementLogs: { collection: 'supplementLogs', version: 1, migrations: {} },
  workoutLogs: { collection: 'workoutLogs', version: 1, migrations: {} },
  favourites: { collection: 'favourites', version: 1, migrations: {} },
  mealPlans: { collection: 'mealPlans', version: 1, migrations: {} },
  savings: { collection: 'savings', version: 1, migrations: {} },
  // Priority plan P2-b: the rest of the per-user data (PDF section 5.2).
  settings: { collection: 'settings', version: 1, migrations: {} },
  shoppingLists: { collection: 'shoppingLists', version: 1, migrations: {} },
  weightLogs: { collection: 'weightLogs', version: 1, migrations: {} },
  ratings: { collection: 'ratings', version: 1, migrations: {} },
  cookCompletions: { collection: 'cookCompletions', version: 1, migrations: {} },
} satisfies Record<string, DocSchema>;

export type CollectionName = keyof typeof SCHEMAS;

/**
 * Logs only ever add entries (P2 sync rules): a document in these collections
 * is never rewritten after it is created, except to soft-delete it. Firestore
 * rules enforce the same (firestore.rules). Water is a per-day counter, so it
 * is not on this list.
 */
export const APPEND_ONLY: readonly CollectionName[] = ['mealLogs', 'supplementLogs', 'workoutLogs', 'weightLogs', 'cookCompletions', 'savings'];
export const COLLECTIONS = Object.keys(SCHEMAS) as CollectionName[];

import type { DocSchema } from './repository';

/**
 * Every user collection and its current schema version. Bump `version` and
 * add a migration whenever a document type changes; never rename or delete a
 * field users already have data in (SPEC-ADDENDA §5). Keep docs/DATA_MODEL.md
 * in step with this file.
 */
export const SCHEMAS = {
  profile: { collection: 'profile', version: 1, migrations: {} },
  mealLogs: { collection: 'mealLogs', version: 1, migrations: {} },
  waterLogs: { collection: 'waterLogs', version: 1, migrations: {} },
  supplementLogs: { collection: 'supplementLogs', version: 1, migrations: {} },
  workoutLogs: { collection: 'workoutLogs', version: 1, migrations: {} },
  favourites: { collection: 'favourites', version: 1, migrations: {} },
  mealPlans: { collection: 'mealPlans', version: 1, migrations: {} },
  savings: { collection: 'savings', version: 1, migrations: {} },
} satisfies Record<string, DocSchema>;

export type CollectionName = keyof typeof SCHEMAS;
export const COLLECTIONS = Object.keys(SCHEMAS) as CollectionName[];

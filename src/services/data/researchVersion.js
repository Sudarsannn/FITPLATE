// Shared by the app (TypeScript imports this file) and the import script
// (scripts/server/import-research.js), so both name a research snapshot the same way.

/**
 * The research ledger's version: the newest research date it records, plus how
 * many versions it records in all. "2026-10-15#412" is newer than
 * "2026-10-15#398" and than "2026-10-14#…".
 */
function researchVersion(ledger) {
  let latest = '0000-00-00';
  let entries = 0;
  for (const [key, section] of Object.entries(ledger || {})) {
    if (key === 'schema' || !section || typeof section !== 'object') continue;
    for (const versions of Object.values(section)) {
      if (!Array.isArray(versions)) continue;
      for (const v of versions) {
        entries += 1;
        if (v && typeof v.date === 'string' && v.date > latest) latest = v.date;
      }
    }
  }
  return `${latest}#${entries}`;
}

/** Positive when a is newer than b, negative when older, 0 when equal. */
function compareResearchVersions(a, b) {
  const [da, na] = String(a).split('#');
  const [db, nb] = String(b).split('#');
  if (da !== db) return da > db ? 1 : -1;
  return (Number(na) || 0) - (Number(nb) || 0);
}

module.exports = { researchVersion, compareResearchVersions };

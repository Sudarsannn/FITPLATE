#!/usr/bin/env node
/**
 * Priority plan P2-c: copy the research library bundled in the app
 * (src/data/research) to the shared, read-only `research/…` area of Firestore.
 * Sudarsan runs this on his Mac (the build can't write to his server):
 *
 *   npm run research:import -- --dry-run            # counts only, writes nothing
 *   GOOGLE_APPLICATION_CREDENTIALS=~/fitplate-admin.json npm run research:import
 *
 * The key file is a Firebase service account key (Firebase console → Project
 * settings → Service accounts → Generate new private key). Keep it outside
 * the FitPlate folder and never commit or paste it anywhere.
 *
 * Layout written:
 *   research/meta                { version, counts, importedAt }   ← written LAST
 *   research/extras              { aliases, links }
 *   research/{kind}/items/{id}   one item per document
 * Items no longer in the bundle are deleted. The app only switches to the
 * server copy when meta.version is newer than its bundle and every count matches.
 */
const fs = require('fs');
const path = require('path');
const { researchVersion } = require('../../src/services/data/researchVersion.js');

const ROOT = path.join(__dirname, '..', '..', 'src', 'data', 'research');
// App kind → folder under src/data/research.
const KINDS = {
  dishes: 'dishes',
  ingredients: 'ingredients',
  nutrients: 'nutrients',
  hydration: 'hydration',
  guidance: 'guidance',
  conditions: 'conditions',
  exercises: 'exercises',
  fitnessGuides: 'fitness-guides',
};
const NOT_ITEMS = new Set(['aliases.json']);
const BATCH = 400;

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function loadBundle() {
  const kinds = {};
  for (const [kind, folder] of Object.entries(KINDS)) {
    const dir = path.join(ROOT, folder);
    const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json') && !NOT_ITEMS.has(f)).sort() : [];
    kinds[kind] = files.map((f) => readJson(path.join(dir, f)));
    for (const item of kinds[kind]) {
      if (!item || typeof item.id !== 'string' || !item.id) throw new Error(`${folder}: an item has no id`);
    }
  }
  const ledger = readJson(path.join(ROOT, 'ledger.json'));
  return {
    version: researchVersion(ledger),
    kinds,
    aliases: readJson(path.join(ROOT, 'ingredients', 'aliases.json')),
    links: readJson(path.join(ROOT, 'links.json')),
  };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const bundle = loadBundle();
  const counts = Object.fromEntries(Object.entries(bundle.kinds).map(([k, items]) => [k, items.length]));
  console.log(`Research version ${bundle.version}`);
  for (const [k, n] of Object.entries(counts)) console.log(`  ${k.padEnd(14)} ${n}`);
  if (dryRun) {
    console.log('Dry run: nothing written.');
    return;
  }
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('Set GOOGLE_APPLICATION_CREDENTIALS to your service account key file first (see the top of this script).');
    process.exit(1);
  }

  const { initializeApp, applicationDefault } = require('firebase-admin/app');
  const { getFirestore } = require('firebase-admin/firestore');
  initializeApp({ credential: applicationDefault() });
  const db = getFirestore();

  let writes = 0;
  for (const [kind, items] of Object.entries(bundle.kinds)) {
    const col = db.collection('research').doc(kind).collection('items');
    const existing = await col.listDocuments();
    const keep = new Set(items.map((i) => i.id));
    const stale = existing.filter((d) => !keep.has(d.id));
    for (let i = 0; i < items.length; i += BATCH) {
      const batch = db.batch();
      for (const item of items.slice(i, i + BATCH)) batch.set(col.doc(item.id), item);
      await batch.commit();
      writes += Math.min(BATCH, items.length - i);
    }
    for (let i = 0; i < stale.length; i += BATCH) {
      const batch = db.batch();
      for (const d of stale.slice(i, i + BATCH)) batch.delete(d);
      await batch.commit();
    }
    console.log(`  ${kind}: ${items.length} written${stale.length ? `, ${stale.length} removed` : ''}`);
  }
  await db.collection('research').doc('extras').set({ aliases: bundle.aliases, links: bundle.links });
  // Meta goes last: the app ignores the server copy until this says it is complete.
  await db.collection('research').doc('meta').set({ version: bundle.version, counts, importedAt: new Date().toISOString() });
  console.log(`Done: ${writes + 2} documents written. The app picks this up on its next start.`);
}

main().catch((e) => {
  console.error(e && e.message ? e.message : e);
  process.exit(1);
});

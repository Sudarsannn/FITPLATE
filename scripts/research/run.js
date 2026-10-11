#!/usr/bin/env node
/**
 * Daily data sync runner (auto-build spec section C).
 *
 *   node scripts/research/run.js --today 2026-10-11 --build Day04 [--src /mnt/project-files] [--dry-run] [--report out.json]
 *
 * 1. Parses every dish and ingredient research file under --src.
 * 2. Compares item versions (item id + research date) with the ledger in
 *    src/data/research/ledger.json; anything new is backlog, oldest first.
 * 3. Takes at most the per-run caps (10 dishes, 30 ingredients) into the ledger.
 * 4. Rebuilds every ledgered item from all its versions (merge rules + price
 *    engine), validates it, and writes src/data/research/<type>/<id>.json.
 * 5. Regenerates each index.ts and prints a JSON report for the build file.
 *
 * The importers are TypeScript; a small Babel hook lets Node load them
 * directly so the app and this script share one parser.
 */
const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');

require.extensions['.ts'] = function compileTs(module, filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const { code } = babel.transformSync(source, {
    filename,
    babelrc: false,
    configFile: false,
    presets: [require.resolve('@babel/preset-typescript')],
    plugins: [require.resolve('@babel/plugin-transform-modules-commonjs')],
  });
  module._compile(code, filename);
};

const ROOT = path.resolve(__dirname, '..', '..');
const { parseDishFile } = require(path.join(ROOT, 'src/services/data/dishImporter.ts'));
const { parseIngredientFile } = require(path.join(ROOT, 'src/services/data/ingredientImporter.ts'));
const { buildDish, buildIngredient, buildIngredientIndex, validateDish, validateIngredient } = require(path.join(ROOT, 'src/services/data/buildItems.ts'));
const { renderIndex } = require(path.join(ROOT, 'src/services/data/researchIndex.ts'));

const CAPS = { dishes: 10, ingredients: 30 };

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
}
const flag = (name) => process.argv.includes(`--${name}`);

const today = arg('today');
const build = arg('build');
const src = arg('src', '/mnt/project-files');
const dryRun = flag('dry-run');
const reportPath = arg('report');
if (!/^\d{4}-\d{2}-\d{2}$/.test(today || '') || !build) {
  console.error('usage: run.js --today YYYY-MM-DD --build DayNN [--src DIR] [--dry-run] [--report FILE]');
  process.exit(2);
}

const DATA = path.join(ROOT, 'src/data/research');
const LEDGER = path.join(DATA, 'ledger.json');

function listFiles(dir, prefix) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.startsWith(prefix) && /\d{4}-\d{2}-\d{2}\.md$/.test(f))
    .filter((f) => f.match(/(\d{4}-\d{2}-\d{2})/)[1] <= today)
    .sort();
}

function loadLedger() {
  if (!fs.existsSync(LEDGER)) return { schema: 'fitplate.ledger.v1', dishes: {}, ingredients: {} };
  return JSON.parse(fs.readFileSync(LEDGER, 'utf8'));
}

/** Parses a whole stream; returns versions in file order and per-file stats. */
function parseStream(kind) {
  const dir = path.join(src, kind === 'dishes' ? 'dish-research' : 'ingredient-research');
  const files = listFiles(dir, kind === 'dishes' ? 'FitPlate_Dishes_' : 'FitPlate_Ingredients_');
  const versions = [];
  const fileStats = [];
  const errors = [];
  for (const file of files) {
    const text = fs.readFileSync(path.join(dir, file), 'utf8');
    if (kind === 'dishes') {
      const items = parseDishFile(text, file);
      versions.push(...items);
      fileStats.push({ file, items: items.length });
    } else {
      const { items, errors: errs } = parseIngredientFile(text, file);
      // The same ingredient twice in one file counts once (first row wins).
      const seen = new Set();
      for (const it of items) {
        if (seen.has(it.id)) {
          errors.push(`${file}: duplicate row for ${it.id}; first kept`);
          continue;
        }
        seen.add(it.id);
        versions.push(it);
      }
      errors.push(...errs.map((e) => `${file}: ${e}`));
      fileStats.push({ file, items: seen.size });
    }
  }
  return { versions, fileStats, errors };
}

const key = (v) => `${v.id}@${v.date}`;

function plan(kind, parsed, ledger) {
  const done = new Set();
  for (const [id, list] of Object.entries(ledger[kind])) for (const v of list) done.add(`${id}@${v.date}`);
  const backlog = parsed.versions.filter((v) => !done.has(key(v)));
  const take = backlog.slice(0, CAPS[kind]);
  return { backlog, take };
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

const ledger = loadLedger();
const dishes = parseStream('dishes');
const ingredients = parseStream('ingredients');
const dishPlan = plan('dishes', dishes, ledger);
const ingPlan = plan('ingredients', ingredients, ledger);

for (const [kind, p] of [['dishes', dishPlan], ['ingredients', ingPlan]]) {
  for (const v of p.take) {
    (ledger[kind][v.id] = ledger[kind][v.id] || []).push({ date: v.date, file: v.file, build });
  }
}

// Rebuild every ledgered item from all its versions.
const versionsOf = (kind, parsed) => {
  const map = new Map();
  for (const v of parsed.versions) {
    const entries = ledger[kind][v.id];
    if (entries && entries.some((e) => e.date === v.date)) (map.get(v.id) || map.set(v.id, []).get(v.id)).push(v);
  }
  return map;
};

const report = {
  today,
  build,
  dryRun,
  caps: CAPS,
  streams: {},
  needsReview: [],
  invalid: [],
  parseErrors: [...dishes.errors, ...ingredients.errors],
};

const ingVersions = versionsOf('ingredients', ingredients);
const builtIngredients = [];
for (const [id, list] of ingVersions) {
  const item = buildIngredient(list, today);
  const errs = validateIngredient(item);
  if (errs.length) report.invalid.push({ type: 'ingredient', id, errors: errs });
  else builtIngredients.push(item);
  if (item.needsReview.length) report.needsReview.push({ type: 'ingredient', id, issues: item.needsReview });
}
builtIngredients.sort((a, b) => a.id.localeCompare(b.id));
const index = buildIngredientIndex(builtIngredients);

const dishVersions = versionsOf('dishes', dishes);
const builtDishes = [];
for (const [id, list] of dishVersions) {
  const dish = buildDish(list, today, index);
  const errs = validateDish(dish);
  if (errs.length) report.invalid.push({ type: 'dish', id, errors: errs });
  else builtDishes.push(dish);
  if (dish.needsReview.length) report.needsReview.push({ type: 'dish', id, issues: dish.needsReview });
}
builtDishes.sort((a, b) => a.number - b.number);

// Validators run over the whole parsed backlog too, so problems show before those dishes are ingested.
report.backlogReview = dishes.versions
  .filter((v) => v.needsReview.length > 0 && !dishVersions.has(v.id))
  .map((v) => ({ id: v.id, date: v.date, issues: v.needsReview }));

for (const [kind, parsed, p, built] of [
  ['dishes', dishes, dishPlan, builtDishes],
  ['ingredients', ingredients, ingPlan, builtIngredients],
]) {
  report.streams[kind] = {
    files: parsed.fileStats,
    versionsSeen: parsed.versions.length,
    ingestedThisRun: p.take.map(key),
    backlogBefore: p.backlog.length,
    backlogAfter: p.backlog.length - p.take.length,
    itemsInApp: built.length,
  };
}
report.links = {
  dishIngredientLines: builtDishes.reduce((n, d) => n + d.ingredients.length, 0),
  linked: builtDishes.reduce((n, d) => n + d.ingredients.filter((i) => i.ingredientId).length, 0),
};
report.dishes = builtDishes.map((d) => ({
  id: d.id,
  kcal: d.nutritionPerServing.kcal,
  orderPrice: d.orderPrice && d.orderPrice.currentEstimate,
  allergens: d.allergens,
  claims: d.dietClaims,
  steps: d.steps.length,
  ingredients: d.ingredients.length,
}));
report.ingredients = builtIngredients.map((i) => ({ id: i.id, unit: i.standardUnit, price: i.price && i.price.currentEstimate, trend: i.price && i.price.trend, seasonal: i.seasonal }));

if (!dryRun) {
  for (const [dir, items, nameOf, type] of [
    ['dishes', builtDishes, (d) => d.id, 'Dish'],
    ['ingredients', builtIngredients, (i) => i.id, 'Ingredient'],
  ]) {
    const out = path.join(DATA, dir);
    fs.mkdirSync(out, { recursive: true });
    const keep = new Set(items.map((i) => `${nameOf(i)}.json`));
    for (const f of fs.readdirSync(out)) if (f.endsWith('.json') && !keep.has(f)) fs.unlinkSync(path.join(out, f));
    for (const item of items) {
      // An ingredient's needsReview is report-only; the Ingredient type doesn't carry it.
      const data = type === 'Ingredient' ? Object.fromEntries(Object.entries(item).filter(([k]) => k !== 'needsReview')) : item;
      writeJson(path.join(out, `${nameOf(item)}.json`), data);
    }
    fs.writeFileSync(path.join(out, 'index.ts'), renderIndex(type, items.map(nameOf)));
  }
  writeJson(LEDGER, ledger);
}

const json = JSON.stringify(report, null, 2);
if (reportPath) fs.writeFileSync(reportPath, json + '\n');
else console.log(json);

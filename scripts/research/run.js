#!/usr/bin/env node
/**
 * Daily data sync runner (auto-build spec section C).
 *
 *   node scripts/research/run.js --today 2026-10-15 --build Day05 [--src /mnt/project-files] [--dry-run] [--report out.json]
 *
 * 1. Parses every research file of the four streams under --src (dishes,
 *    ingredients, nutrients incl. hydration/guidance/health profiles, fitness).
 * 2. Compares item versions (item id + research date) with the ledger in
 *    src/data/research/ledger.json; anything new is backlog, oldest first.
 * 3. Takes at most the per-run caps (10 dishes, 30 ingredients) into the ledger.
 * 4. Rebuilds every ledgered item from all its versions (merge rules + price
 *    engine), validates it, and writes src/data/research/<type>/<id>.json.
 * 5. Cross-links the streams (spec F): alias map, micronutrient estimates,
 *    good-source dishes, variant families, "Used in" checks; writes
 *    ingredients/aliases.json and links.json.
 * 6. Regenerates each index.ts and prints a JSON report for the build file.
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
const nutrientImporter = require(path.join(ROOT, 'src/services/data/nutrientImporter.ts'));
const exerciseImporter = require(path.join(ROOT, 'src/services/data/exerciseImporter.ts'));
const crossLinks = require(path.join(ROOT, 'src/services/data/crossLinks.ts'));
const { assignFamilies } = require(path.join(ROOT, 'src/services/data/tags.ts'));

const CAPS = { dishes: 10, ingredients: 30, nutrients: 6, fitness: 8 };
const STREAMS = {
  dishes: { dir: 'dish-research', prefix: 'FitPlate_Dishes_' },
  ingredients: { dir: 'ingredient-research', prefix: 'FitPlate_Ingredients_' },
  nutrients: { dir: 'nutrient-research', prefix: 'FitPlate_Nutrients_' },
  fitness: { dir: 'fitness-research', prefix: 'FitPlate_Fitness_' },
};

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
  const empty = { schema: 'fitplate.ledger.v1', dishes: {}, ingredients: {}, nutrients: {}, fitness: {} };
  if (!fs.existsSync(LEDGER)) return empty;
  return { ...empty, ...JSON.parse(fs.readFileSync(LEDGER, 'utf8')) };
}

/**
 * Parses a whole stream; returns versions in file order and per-file stats.
 * Nutrient and fitness items are keyed `kind:id` in the ledger, since one file
 * can hold a vitamin and a guidance topic, or an exercise and a guide.
 */
function parseStream(kind) {
  const dir = path.join(src, STREAMS[kind].dir);
  const files = listFiles(dir, STREAMS[kind].prefix);
  const versions = [];
  const fileStats = [];
  const errors = [];
  for (const file of files) {
    const text = fs.readFileSync(path.join(dir, file), 'utf8');
    let items;
    let errs = [];
    if (kind === 'dishes') items = parseDishFile(text, file);
    else if (kind === 'ingredients') ({ items, errors: errs } = parseIngredientFile(text, file));
    else if (kind === 'nutrients') ({ items, errors: errs } = nutrientImporter.parseNutrientFile(text, file));
    else ({ items, errors: errs } = exerciseImporter.parseFitnessFile(text, file));
    // The same item twice in one file counts once (first wins).
    const seen = new Set();
    for (const it of items) {
      const id = itemKey(kind, it);
      if (seen.has(id)) {
        errors.push(`${file}: duplicate entry for ${id}; first kept`);
        continue;
      }
      seen.add(id);
      versions.push({ ...it, ledgerId: id, date: it.date || file.match(/(\d{4}-\d{2}-\d{2})/)[1], file });
    }
    errors.push(...errs.map((e) => `${file}: ${e}`));
    fileStats.push({ file, items: seen.size });
  }
  return { versions, fileStats, errors };
}

function itemKey(kind, it) {
  if (kind === 'nutrients' || kind === 'fitness') return `${it.kind}:${it.id}`;
  return it.id;
}

const key = (v) => `${v.ledgerId}@${v.date}`;

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
const nutrients = parseStream('nutrients');
const fitness = parseStream('fitness');
const dishPlan = plan('dishes', dishes, ledger);
const ingPlan = plan('ingredients', ingredients, ledger);
const nutPlan = plan('nutrients', nutrients, ledger);
const fitPlan = plan('fitness', fitness, ledger);

for (const [kind, p] of [['dishes', dishPlan], ['ingredients', ingPlan], ['nutrients', nutPlan], ['fitness', fitPlan]]) {
  for (const v of p.take) {
    (ledger[kind][v.ledgerId] = ledger[kind][v.ledgerId] || []).push({ date: v.date, file: v.file, build });
  }
}

// Rebuild every ledgered item from all its versions.
const versionsOf = (kind, parsed) => {
  const map = new Map();
  for (const v of parsed.versions) {
    const entries = ledger[kind][v.ledgerId];
    if (entries && entries.some((e) => e.date === v.date)) (map.get(v.ledgerId) || map.set(v.ledgerId, []).get(v.ledgerId)).push(v);
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
  parseErrors: [...dishes.errors, ...ingredients.errors, ...nutrients.errors, ...fitness.errors],
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

// F1: alias map. A first pass links dish lines by English name to learn their
// Indian names; the dishes are then built with the enlarged index.
const dishVersions = versionsOf('dishes', dishes);
const latestDishLines = [...dishVersions.values()].map((list) => ({ ingredients: [...list].sort((a, b) => a.date.localeCompare(b.date)).pop().ingredients }));
const aliasResult = crossLinks.buildAliasMap(builtIngredients, latestDishLines);
const index = crossLinks.indexWithAliases(builtIngredients, aliasResult.aliases);

const builtDishes = [];
for (const [id, list] of dishVersions) {
  const dish = buildDish(list, today, index);
  const errs = validateDish(dish);
  if (errs.length) report.invalid.push({ type: 'dish', id, errors: errs });
  else builtDishes.push(dish);
  if (dish.needsReview.length) report.needsReview.push({ type: 'dish', id, issues: dish.needsReview });
}
builtDishes.sort((a, b) => a.number - b.number);

// Nutrient stream: vitamins/minerals, hydration, guidance and health profiles.
const topics = { nutrient: [], hydration: [], guidance: [], condition: [] };
for (const [id, list] of versionsOf('nutrients', nutrients)) {
  const { kind, item } = nutrientImporter.buildTopic(list, today);
  const validate = { nutrient: nutrientImporter.validateNutrient, hydration: nutrientImporter.validateHydration, guidance: nutrientImporter.validateGuidance, condition: nutrientImporter.validateCondition }[kind];
  const errs = validate(item);
  if (errs.length) report.invalid.push({ type: kind, id, errors: errs });
  else topics[kind].push(item);
  if (item.needsReview && item.needsReview.length) report.needsReview.push({ type: kind, id, issues: item.needsReview });
}
// Fitness stream: exercises and guides.
const fit = { exercise: [], guidance: [] };
for (const [id, list] of versionsOf('fitness', fitness)) {
  const kind = list[0].kind;
  const item = kind === 'exercise' ? exerciseImporter.buildExercise(list, today) : exerciseImporter.buildGuidance(list, today);
  // Fitness validators only flag (rep-counter angles, MET checks); they never block an item
  // that has a name, so the library can still show it with its "needs review" notes.
  const errs = kind === 'exercise' ? exerciseImporter.validateExercise(item) : exerciseImporter.validateGuidance(item);
  if (!item.id || !item.name) report.invalid.push({ type: `fitness ${kind}`, id, errors: ['no id or name', ...errs] });
  else fit[kind].push(item);
  const issues = [...new Set([...(item.needsReview || []), ...errs])];
  if (issues.length) report.needsReview.push({ type: `fitness ${kind}`, id, issues });
}
for (const list of [...Object.values(topics), ...Object.values(fit)]) list.sort((a, b) => a.id.localeCompare(b.id));

// F2–F7 cross-links.
const nutrientLinks = topics.nutrient.map((n) => nutrientImporter.nutrientCrossLinks(n));
const micro = crossLinks.buildMicroTable(
  builtIngredients,
  nutrientLinks.map((l) => ({ id: l.id, unit: l.unit, topFoodSources: l.foodSources.map((f) => ({ food: f.food, per100g: f.per100g })) })),
  index,
);
const ingById = new Map(builtIngredients.map((i) => [i.id, i]));
const kcalChecks = [];
for (const d of builtDishes) {
  d.microNutrientsEstimate = crossLinks.dishMicros(d, micro.table);
  const fromIng = crossLinks.dishKcalFromIngredients(d, ingById);
  const own = d.nutritionPerServing.kcal;
  if (fromIng && own && fromIng.coveragePct >= 80 && Math.abs(fromIng.kcal - own) / own > 0.25) {
    kcalChecks.push({ id: d.id, dishFile: own, fromIngredients: fromIng.kcal, coveragePct: fromIng.coveragePct });
  }
}
const families = assignFamilies(builtDishes);
for (const d of builtDishes) d.familyId = families.familyOf.get(d.id) || null;
const goodSource = crossLinks.goodSourceLinks(
  topics.nutrient.map((n) => ({ id: n.id, goodSourceDishes: n.goodSourceDishes.filter((g) => g.dishNumber != null) })),
  builtDishes,
);
const stats = crossLinks.linkStats(builtDishes, builtIngredients);
const links = {
  schema: 'fitplate.links.v1',
  generatedFor: build,
  goodSourceDishes: goodSource.byNutrient,
  dishGoodSourceOf: goodSource.byDish,
  families: families.links,
  drinks: topics.hydration.map((h) => nutrientImporter.hydrationCrossLinks(h)),
  // F6: MET values for burn-off; the app scales by the profile weight (research assumes 70 kg).
  met: fit.exercise.filter((e) => e.met != null).map((e) => ({ exerciseId: e.id, name: e.name, met: e.met })),
  microTable: micro.table,
};

// Validators run over the whole parsed backlog too, so problems show before those dishes are ingested.
report.backlogReview = dishes.versions
  .filter((v) => v.needsReview.length > 0 && !dishVersions.has(v.id))
  .map((v) => ({ id: v.id, date: v.date, issues: v.needsReview }));

for (const [kind, parsed, p, built] of [
  ['dishes', dishes, dishPlan, builtDishes],
  ['ingredients', ingredients, ingPlan, builtIngredients],
  ['nutrients', nutrients, nutPlan, Object.values(topics).flat()],
  ['fitness', fitness, fitPlan, Object.values(fit).flat()],
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
  dishIngredientLines: stats.lines,
  linked: stats.linked,
  priced: stats.priced,
  unmatched: stats.unmatched,
  aliasesLearned: aliasResult.learned,
  aliasesAmbiguous: aliasResult.ambiguous,
  microFromNutrientStream: micro.fromNutrientStream,
  nutrientFoodsUnmatched: micro.unmatchedFoods,
  kcalOver25pct: kcalChecks,
  usedInMismatches: crossLinks.usedInMismatches(builtIngredients, builtDishes),
  families: families.links,
  goodSourceDishes: goodSource.byNutrient,
  drinksTables: links.drinks.length,
  met: links.met,
};
report.dishes = builtDishes.map((d) => ({
  id: d.id,
  kcal: d.nutritionPerServing.kcal,
  orderPrice: d.orderPrice && d.orderPrice.currentEstimate,
  allergens: d.allergens,
  claims: d.dietClaims,
  tags: d.tags,
  familyId: d.familyId,
  variants: d.variants.map((v) => `${v.category}: ${v.status}${v.name ? ` (${v.name})` : ''}`),
  micros: d.microNutrientsEstimate && d.microNutrientsEstimate.coveragePct,
  steps: d.steps.length,
  ingredients: d.ingredients.length,
}));
report.topics = Object.fromEntries(Object.entries(topics).map(([k, list]) => [k, list.map((t) => t.id)]));
report.fitness = Object.fromEntries(Object.entries(fit).map(([k, list]) => [k, list.map((t) => ({ id: t.id, met: t.met, tags: t.tags }))]));
report.ingredients = builtIngredients.map((i) => ({ id: i.id, unit: i.standardUnit, price: i.price && i.price.currentEstimate, trend: i.price && i.price.trend, seasonal: i.seasonal }));

if (!dryRun) {
  const strip = (item) => Object.fromEntries(Object.entries(item).filter(([k]) => k !== 'needsReview'));
  for (const [dir, items, type, model, clean] of [
    ['dishes', builtDishes, 'Dish', 'research', (d) => d],
    // An ingredient's needsReview is report-only; the Ingredient type doesn't carry it.
    ['ingredients', builtIngredients, 'Ingredient', 'research', strip],
    ['nutrients', topics.nutrient, 'Nutrient', 'nutrient', (d) => d],
    ['hydration', topics.hydration, 'Hydration', 'nutrient', (d) => d],
    ['guidance', topics.guidance, 'Guidance', 'nutrient', (d) => d],
    ['conditions', topics.condition, 'HealthCondition', 'nutrient', (d) => d],
    ['exercises', fit.exercise, 'Exercise', 'exercise', (d) => d],
    ['fitness-guides', fit.guidance, 'Guidance', 'exercise', (d) => d],
  ]) {
    const out = path.join(DATA, dir);
    fs.mkdirSync(out, { recursive: true });
    const keep = new Set(items.map((i) => `${i.id}.json`));
    for (const f of fs.readdirSync(out)) if (f.endsWith('.json') && f !== 'aliases.json' && !keep.has(f)) fs.unlinkSync(path.join(out, f));
    for (const item of items) writeJson(path.join(out, `${item.id}.json`), clean(item));
    fs.writeFileSync(path.join(out, 'index.ts'), renderIndex(type, items.map((i) => i.id), model));
  }
  writeJson(path.join(DATA, 'ingredients', 'aliases.json'), aliasResult.aliases);
  writeJson(path.join(DATA, 'links.json'), links);
  writeJson(LEDGER, ledger);
}

const json = JSON.stringify(report, null, 2);
if (reportPath) fs.writeFileSync(reportPath, json + '\n');
else console.log(json);

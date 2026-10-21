#!/usr/bin/env node
/**
 * Dish photos (SPEC-ADDENDA §10, dish research PROMPT_PATCH_06).
 *
 *   node scripts/research/images.js --today 2026-10-16 [--src /mnt/project-files] [--dry-run] [--report out.json]
 *
 * For every dish in src/data/research/dishes/:
 * 1. Picks its photo candidate: the `**Image**` block in its daily dish file,
 *    else dish-research/images/candidates.json in the shared folder.
 * 2. Skips it when assets/dishes/<id>.jpg already holds that same candidate.
 * 3. Wikimedia Commons: asks the Commons API for the file's author and licence
 *    (the research notes are not trusted for this) and refuses anything that is
 *    not public domain, CC0, CC BY or CC BY-SA. Unsplash / Pexels / Pixabay:
 *    the site licence applies; the candidate must give a direct image URL and
 *    the author.
 * 4. Downloads it, stores an optimised copy (max 720 px, JPEG ~q72, metadata
 *    stripped) as assets/dishes/<id>.jpg and records the credit in
 *    src/data/research/dish-images/manifest.json.
 * 5. Regenerates src/data/research/dish-images/index.ts (static requires, so
 *    Metro bundles the files). Dishes without a verified photo keep the
 *    labelled placeholder in the app.
 * No keys, no paid services. A failure for one dish never stops the others.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
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
const C = require(path.join(ROOT, 'src/services/data/dishImageCandidates.ts'));

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
}
const today = arg('today');
const src = arg('src', '/mnt/project-files');
const dryRun = process.argv.includes('--dry-run');
const reportPath = arg('report');
if (!/^\d{4}-\d{2}-\d{2}$/.test(today || '')) {
  console.error('usage: images.js --today YYYY-MM-DD [--src DIR] [--dry-run] [--report FILE]');
  process.exit(2);
}

const DISHES = path.join(ROOT, 'src/data/research/dishes');
const OUT_DIR = path.join(ROOT, 'src/data/research/dish-images');
const MANIFEST = path.join(OUT_DIR, 'manifest.json');
const ASSETS = path.join(ROOT, 'assets/dishes');
const UA = 'FitPlateBot/1.0 (https://github.com/Sudarsannn/FITPLATE; dish photos)';

const dishes = fs
  .readdirSync(DISHES)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(fs.readFileSync(path.join(DISHES, f), 'utf8')))
  .sort((a, b) => a.number - b.number);

function loadCandidates() {
  const dir = path.join(src, 'dish-research');
  const fromFiles = [];
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir).filter((x) => /^FitPlate_Dishes_\d{4}-\d{2}-\d{2}\.md$/.test(x)).sort()) {
      if (f.match(/(\d{4}-\d{2}-\d{2})/)[1] > today) continue;
      fromFiles.push(...C.parseImageCandidatesFromFile(fs.readFileSync(path.join(dir, f), 'utf8'), f));
    }
  }
  const jsonPath = path.join(dir, 'images', 'candidates.json');
  const fromJson = fs.existsSync(jsonPath) ? C.parseCandidatesJson(JSON.parse(fs.readFileSync(jsonPath, 'utf8')), 'images/candidates.json') : [];
  return C.pickCandidates(fromFiles, fromJson);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Wikimedia rate-limits shared cloud IPs (HTTP 429, dropped connections): back off and retry. */
async function fetchRetry(url, headers) {
  for (let attempt = 0; ; attempt++) {
    let res;
    try {
      res = await fetch(url, { headers });
    } catch (e) {
      if (attempt >= 10) throw e;
      await sleep(Math.min(2 ** attempt * 1000, 20000));
      continue;
    }
    if ((res.status !== 429 && res.status < 500) || attempt >= 10) return res;
    const wait = Math.max(Number(res.headers.get('retry-after')) || 1, 2 ** attempt) * 1000;
    await sleep(Math.min(wait, 20000));
  }
}

async function getJson(url) {
  const res = await fetchRetry(url, { 'User-Agent': UA, Accept: 'application/json' });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function download(url, file) {
  const res = await fetchRetry(url, { 'User-Agent': UA });
  if (!res.ok) throw new Error(`HTTP ${res.status} downloading ${url}`);
  const type = res.headers.get('content-type') || '';
  if (!/^image\//.test(type)) throw new Error(`not an image (${type}) at ${url}`);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

const stripHtml = (s) =>
  String(s || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

/** Commons: the API's own author and licence, never the research notes'. */
async function resolveCommons(fileName) {
  const title = `File:${fileName}`;
  const url =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&prop=imageinfo' +
    `&iiprop=url|extmetadata|mime|size&iiurlwidth=960&titles=${encodeURIComponent(title)}`;
  const data = await getJson(url);
  const page = data.query && data.query.pages && data.query.pages[0];
  if (!page || page.missing || !page.imageinfo) throw new Error(`no such Commons file: ${fileName}`);
  const info = page.imageinfo[0];
  const meta = info.extmetadata || {};
  const licence = stripHtml(meta.LicenseShortName && meta.LicenseShortName.value);
  const author = stripHtml(meta.Artist && meta.Artist.value) || stripHtml(meta.Credit && meta.Credit.value);
  if (!C.licenceAllowed(licence)) throw new Error(`licence not allowed: ${licence || 'unknown'}`);
  if (!author) throw new Error('no author on Commons');
  if (info.width && info.width < 400) throw new Error(`too small (${info.width}px)`);
  return {
    // Commons hands out thumb.wikimedia.org links; the same path is served by
    // upload.wikimedia.org, the host the cloud environment allows.
    imageUrl: (info.thumburl || info.url).replace(/^https:\/\/thumb\.wikimedia\.org\//, 'https://upload.wikimedia.org/').replace(/\?.*$/, ''),
    title: stripHtml(meta.ObjectName && meta.ObjectName.value) || fileName.replace(/\.[a-z]+$/i, ''),
    author,
    licence,
    licenceUrl: (meta.LicenseUrl && meta.LicenseUrl.value) || null,
    pageUrl: info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`,
  };
}

const SITE_LICENCE = {
  unsplash: { licence: 'Unsplash License', licenceUrl: 'https://unsplash.com/license' },
  pexels: { licence: 'Pexels License', licenceUrl: 'https://www.pexels.com/license/' },
  pixabay: { licence: 'Pixabay Content License', licenceUrl: 'https://pixabay.com/service/license-summary/' },
};

function resolveSite(c) {
  if (!c.file || !/^https:\/\//.test(c.file)) throw new Error(`${c.site}: needs a direct https image URL in File`);
  if (!c.author) throw new Error(`${c.site}: needs the author`);
  if (!c.pageUrl) throw new Error(`${c.site}: needs the photo page URL`);
  return { imageUrl: c.file, title: '', author: c.author, pageUrl: c.pageUrl, ...SITE_LICENCE[c.site] };
}

/** Optimised copy: ImageMagick when present, else jimp-compact (ships with Expo). */
async function optimise(input, output) {
  try {
    execFileSync('convert', [input, '-auto-orient', '-resize', '720x720>', '-strip', '-interlace', 'Plane', '-quality', '72', `jpg:${output}`], { stdio: 'pipe' });
    return;
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
  const Jimp = require('jimp-compact');
  const img = await Jimp.read(input);
  if (img.bitmap.width > 720 || img.bitmap.height > 720) img.scaleToFit(720, 720);
  await img.quality(72).writeAsync(output);
}

function renderIndex(manifest) {
  const ids = Object.keys(manifest.images).sort();
  return [
    '// GENERATED by scripts/research/images.js. Do not edit by hand.',
    "import type { ImageSourcePropType } from 'react-native';",
    '',
    "import type { ImageCredit } from '../../../services/data/dishImageCandidates';",
    "import manifest from './manifest.json';",
    '',
    '/** Bundled dish photos by dish id; dishes not listed show the labelled placeholder. */',
    'export const dishImageFiles: Record<string, ImageSourcePropType> = {',
    ...ids.map((id) => `  '${id}': require('../../../../assets/dishes/${manifest.images[id].file}'),`),
    '};',
    '',
    'export const dishImageCredits = manifest.images as Record<string, ImageCredit>;',
    '',
  ].join('\n');
}

async function main() {
  const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : { schema: 'fitplate.dishImages.v1', images: {} };
  const candidates = loadCandidates();
  const report = { today, dryRun, dishes: dishes.length, withPhoto: 0, fetched: [], kept: [], failed: [], noCandidate: [], removed: [] };
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fitplate-img-'));
  if (!dryRun) fs.mkdirSync(ASSETS, { recursive: true });

  for (const d of dishes) {
    const c = candidates.get(d.id);
    const have = manifest.images[d.id];
    if (!c || !c.site || !c.file) {
      if (!have) report.noCandidate.push(d.id);
      continue;
    }
    const key = C.candidateKey(c);
    if (have && have.candidate === key && fs.existsSync(path.join(ASSETS, have.file))) {
      report.kept.push(d.id);
      continue;
    }
    // Try the pick, then its Commons alternates.
    const tries = [c, ...c.alternates.map((a) => ({ ...c, site: C.siteOf(a) || c.site, file: C.commonsFileName(a) || a, pageUrl: /^https?:/.test(a) ? a : c.pageUrl }))];
    const errors = [];
    for (const t of tries) {
      try {
        const r = t.site === 'wikimedia' ? await resolveCommons(t.file) : resolveSite(t);
        if (dryRun) {
          report.fetched.push({ id: d.id, ...r, dryRun: true });
          break;
        }
        const raw = path.join(tmp, `${d.id}.src`);
        await download(r.imageUrl, raw);
        const file = `${d.id}.jpg`;
        await optimise(raw, path.join(ASSETS, file));
        manifest.images[d.id] = {
          title: r.title || d.name,
          author: r.author,
          licence: r.licence,
          licenceUrl: r.licenceUrl,
          pageUrl: r.pageUrl,
          site: t.site,
          file,
          candidate: C.candidateKey(t),
          fetchedOn: today,
        };
        report.fetched.push({ id: d.id, author: r.author, licence: r.licence, pageUrl: r.pageUrl, bytes: fs.statSync(path.join(ASSETS, file)).size });
        errors.length = 0;
        break;
      } catch (e) {
        errors.push(`${t.file}: ${e.message}`);
      }
    }
    if (errors.length === tries.length) report.failed.push({ id: d.id, errors });
  }

  // Drop photos of dishes that no longer exist.
  const ids = new Set(dishes.map((d) => d.id));
  for (const id of Object.keys(manifest.images)) {
    if (ids.has(id)) continue;
    report.removed.push(id);
    if (!dryRun) {
      fs.rmSync(path.join(ASSETS, manifest.images[id].file), { force: true });
      delete manifest.images[id];
    }
  }
  report.withPhoto = Object.keys(manifest.images).filter((id) => ids.has(id)).length;

  if (!dryRun) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    const sorted = { schema: manifest.schema, images: Object.fromEntries(Object.keys(manifest.images).sort().map((k) => [k, manifest.images[k]])) };
    fs.writeFileSync(MANIFEST, JSON.stringify(sorted, null, 2) + '\n');
    fs.writeFileSync(path.join(OUT_DIR, 'index.ts'), renderIndex(sorted));
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  const json = JSON.stringify(report, null, 2);
  if (reportPath) fs.writeFileSync(reportPath, json + '\n');
  else console.log(json);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

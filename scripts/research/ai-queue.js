#!/usr/bin/env node
/**
 * The AI dish research queue (branch `ai-dish-queue`, files queue/<slug>.json).
 * The app's server writes one file per dish a user asked the AI to create.
 *
 *   node scripts/research/ai-queue.js list            pending dishes, most asked for first
 *   node scripts/research/ai-queue.js show <slug>     the AI's draft for one dish
 *   node scripts/research/ai-queue.js done <slug> <researchFile> [dishNumber]
 *                                                     mark it researched (commits and pushes the queue branch)
 */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const BRANCH = 'ai-dish-queue';
const git = (...a) => execFileSync('git', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

function fetchQueue() {
  try {
    git('fetch', 'origin', BRANCH);
  } catch {
    return false; // no branch yet: nobody has asked for an AI dish
  }
  return true;
}

function entries() {
  if (!fetchQueue()) return [];
  const files = git('ls-tree', '-r', '--name-only', `origin/${BRANCH}`, 'queue/').split('\n').filter((f) => f.endsWith('.json'));
  return files.map((f) => JSON.parse(git('show', `origin/${BRANCH}:${f}`)));
}

const [cmd, slug, file, number] = process.argv.slice(2);

if (cmd === 'list' || !cmd) {
  const pending = entries().filter((e) => e.status === 'pending-research').sort((a, b) => (b.requests ?? 1) - (a.requests ?? 1) || String(a.firstRequestedAt).localeCompare(String(b.firstRequestedAt)));
  if (!pending.length) console.log('No AI dishes waiting for research.');
  for (const e of pending) console.log(`${e.slug}\t${e.requests}x\t${e.mode}${e.basedOn ? ` of ${e.basedOn.name}` : ''}\t${e.name}\t${(e.userWords ?? [])[0] ?? ''}`);
} else if (cmd === 'show') {
  const e = entries().find((x) => x.slug === slug);
  if (!e) process.exit(console.error(`No queue entry "${slug}".`) || 1);
  console.log(JSON.stringify(e, null, 2));
} else if (cmd === 'done') {
  if (!slug || !file) process.exit(console.error('usage: done <slug> <researchFile> [dishNumber]') || 1);
  fetchQueue();
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'aiq-'));
  try {
    git('worktree', 'add', dir, `origin/${BRANCH}`, '--detach');
    const p = path.join(dir, 'queue', `${slug}.json`);
    const e = JSON.parse(fs.readFileSync(p, 'utf8'));
    e.status = 'researched';
    e.researchedOn = new Date().toISOString().slice(0, 10);
    e.researchFile = file;
    if (number) e.dishNumber = Number(number);
    fs.writeFileSync(p, JSON.stringify(e, null, 2) + '\n');
    execFileSync('git', ['-C', dir, 'add', '-A'], { stdio: 'ignore' });
    execFileSync('git', ['-C', dir, 'commit', '-m', `AI dish queue: ${e.name} researched (${file})`], { stdio: 'ignore' });
    execFileSync('git', ['-C', dir, 'push', 'origin', `HEAD:${BRANCH}`], { stdio: 'inherit' });
    console.log(`Marked ${slug} researched.`);
  } finally {
    try {
      git('worktree', 'remove', '--force', dir);
    } catch {
      /* temp dir is cleaned by the OS */
    }
  }
} else {
  console.error('usage: ai-queue.js list | show <slug> | done <slug> <file> [number]');
  process.exit(1);
}

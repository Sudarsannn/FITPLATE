import { describe, expect, it } from '@jest/globals';
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

// Sudarsan, 24 Oct 2026: no emojis anywhere in the app. Use icons (components/Icon.tsx) instead.
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u;
const ROOT = join(__dirname, '..');
const SKIP = new Set(['__tests__']);

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (SKIP.has(name)) return [];
    return statSync(p).isDirectory() ? files(p) : /\.(tsx?|json)$/.test(name) ? [p] : [];
  });
}

describe('no emoji in the app', () => {
  it('has none in source or bundled data', () => {
    const bad = files(ROOT).flatMap((f) =>
      readFileSync(f, 'utf8')
        .split('\n')
        .flatMap((line, i) => {
          const m = line.match(EMOJI);
          // The check mark and the tick/ballot boxes in shopping-list text are plain text glyphs, not emoji.
          return m && !/[✓☐★]/.test(m[0]) ? [`${f.replace(ROOT, 'src')}:${i + 1}`] : [];
        }),
    );
    expect(bad).toEqual([]);
  });
});

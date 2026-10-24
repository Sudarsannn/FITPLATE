import { describe, expect, it } from '@jest/globals';

import type { DishStep } from '../../models/research';
import { schedule, span, stepKind } from '../../services/multicook';

const st = (text: string, timerSec: number | null, n = 1): DishStep => ({ n, title: null, text, timerSec, tip: null, visualCue: null, cameraCheck: null, videoShot: null });
const dish = (id: string, steps: DishStep[]) => ({ id, name: id, steps });

describe('stepKind', () => {
  it('reads the step words', () => {
    expect(stepKind(st('Finely chop ½ small onion', 120))).toBe('hands');
    expect(stepKind(st('Heat 1 tsp ghee in a kadai on medium heat', 60))).toBe('burner-hands');
    expect(stepKind(st('Close the lid and cook on medium heat for 3–4 whistles', 600))).toBe('burner-passive');
    expect(stepKind(st('Turn off the heat and let the pressure drop on its own', 480))).toBe('wait');
    expect(stepKind(st('Soak the rice for 20 minutes', 1200))).toBe('wait');
  });
});

describe('schedule', () => {
  const rice = dish('rice', [st('Rinse the rice', 60), st('Boil the rice until soft', 900), st('Turn off the heat and let it rest', 300)]);
  const curry = dish('curry', [st('Chop the onion', 120), st('Heat oil in a kadai', 60), st('Sauté the onion', 240), st('Simmer the gravy on low heat', 600)]);

  it('never double-books the hands or a burner', () => {
    for (const burners of [1, 2, 3]) {
      const { plan } = schedule([rice, curry], burners);
      expect(plan).toHaveLength(7);
      const usingBurner = plan.filter((p) => p.burner != null);
      for (const a of usingBurner) for (const b of usingBurner) if (a !== b && a.burner === b.burner) expect(a.endSec <= b.startSec || b.endSec <= a.startSec).toBe(true);
      const active = plan.filter((p) => p.kind === 'hands' || p.kind === 'burner-hands');
      for (const a of active) for (const b of active) if (a !== b) expect(a.endSec <= b.startSec || b.endSec <= a.startSec).toBe(true);
    }
  });

  it('keeps each dish in order', () => {
    const { plan } = schedule([rice, curry], 2);
    for (const d of [rice, curry]) {
      const mine = plan.filter((p) => p.dishId === d.id).sort((a, b) => a.stepIndex - b.stepIndex);
      mine.slice(1).forEach((p, i) => expect(p.startSec).toBeGreaterThanOrEqual(mine[i].endSec));
    }
  });

  it('beats cooking one after the other, and more burners never hurt', () => {
    const one = schedule([rice, curry], 1);
    const two = schedule([rice, curry], 2);
    expect(two.totalSec).toBeLessThanOrEqual(one.totalSec);
    expect(two.totalSec).toBeLessThan(two.oneByOneSec);
  });

  it('formats spans', () => {
    expect(span(30)).toBe('1 min');
    expect(span(3900)).toBe('1 h 05 min');
  });
});

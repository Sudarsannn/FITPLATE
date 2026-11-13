import { describe, expect, it } from '@jest/globals';
import { researchExercises } from '../data/research';
import type { Exercise } from '../models/exercise';
import {
  angleAt, configFor, createEngine, engineFor, hipOffset, jointAngle, jointTriplet, parseRule,
  type Engine, type EngineConfig, type Frame, type Pt, type Update,
} from '../services/repCounter';

const ex = (id: string) => researchExercises.find((e) => e.id === id) as Exercise;

/* ---------- synthetic keypoints ---------- */

const FPS = 30;
let seed = 7;
const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd());

/** Puts c so that the angle at b between a and c is `deg`. */
function place(b: Pt, a: Pt, deg: number, len = 0.2): Pt {
  const dx = a.x - b.x, dy = a.y - b.y, n = Math.hypot(dx, dy);
  const r = (deg * Math.PI) / 180;
  const ux = dx / n, uy = dy / n;
  return { x: b.x + len * (ux * Math.cos(r) - uy * Math.sin(r)), y: b.y + len * (ux * Math.sin(r) + uy * Math.cos(r)), c: 1 };
}

type Pose = Record<string, Pt>;
const both = (pts: Pose, name: string, p: Pt) => { pts[`left_${name}`] = p; pts[`right_${name}`] = { ...p }; };

/** One joint, three landmarks, both sides: b fixed, a straight up from b, c placed for the angle. */
function limb(t: [string, string, string], deg: number): Pose {
  const pts: Pose = {};
  const b = { x: 0.5, y: 0.5, c: 1 }, a = { x: 0.5, y: 0.3, c: 1 };
  both(pts, t[0], a); both(pts, t[1], b); both(pts, t[2], place(b, a, deg));
  return pts;
}

/** Plank / push-up body: shoulder-ankle line with the hip dropped by `sag` (positive = below the line), elbow at its own angle. */
function body(lineDeg: number, elbowDeg: number, below = true): Pose {
  const pts: Pose = {};
  const sh = { x: 0.2, y: 0.5, c: 1 }, an = { x: 0.8, y: 0.5, c: 1 };
  const sag = 0.3 * Math.tan(((180 - lineDeg) / 2) * (Math.PI / 180)) * (below ? 1 : -1);
  const hip = { x: 0.5, y: 0.5 + sag, c: 1 };
  const el = { x: 0.2, y: 0.7, c: 1 };
  both(pts, 'shoulder', sh); both(pts, 'ankle', an); both(pts, 'hip', hip); both(pts, 'elbow', el);
  both(pts, 'wrist', place(el, sh, elbowDeg));
  return pts;
}

const frames = (secs: number, make: (t: number) => Pose): Frame[] =>
  Array.from({ length: Math.round(secs * FPS) }, (_, i) => ({ t: i / FPS, pts: make(i / FPS) }));

function play(engine: Engine, fs: Frame[]) {
  const all: Update[] = [];
  for (const f of fs) all.push(engine.push(f));
  const messages = all.flatMap((u) => u.messages.map((m) => m.text));
  const events = all.flatMap((u) => (u.repEvent ? [u.repEvent] : []));
  return { all, last: all[all.length - 1], messages, events };
}

/** Smooth rep wave: starts and ends at rest, one dip per `period`. */
const wave = (t: number, period: number, rest: number, depth: number) => rest - (rest - depth) * (0.5 - 0.5 * Math.cos((2 * Math.PI * t) / period));

const KNEE: [string, string, string] = ['hip', 'knee', 'ankle'];
const ELBOW: [string, string, string] = ['shoulder', 'elbow', 'wrist'];
const SHOULDER: [string, string, string] = ['hip', 'shoulder', 'elbow'];
const ge = (value: number) => ({ op: '>=' as const, value, max: null });
const le = (value: number) => ({ op: '<=' as const, value, max: null });

const squat = () => engineFor(ex('bodyweight-squat')) as Engine;
const curlConfig: EngineConfig = { mode: 'reps', minRepSec: 1, main: { triplet: ELBOW, rest: ge(150), active: le(55) }, groups: [], rules: [], unchecked: [] };

/* ---------- geometry ---------- */

describe('geometry', () => {
  it('computes a right angle and a straight line', () => {
    expect(angleAt({ x: 0, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 0 })).toBeCloseTo(90, 5);
    expect(angleAt({ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 })).toBeCloseTo(180, 5);
    expect(angleAt({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 })).toBeNull();
  });
  it('averages visible sides and ignores low-confidence points', () => {
    const pts = limb(KNEE, 120);
    expect(jointAngle(pts, KNEE)).toBeCloseTo(120, 3);
    pts.left_knee = { ...pts.left_knee, c: 0.05 };
    expect(jointAngle(pts, KNEE)).toBeCloseTo(120, 3);
    pts.right_ankle = { ...pts.right_ankle, c: 0.05 };
    expect(jointAngle(pts, KNEE)).toBeNull();
  });
  it('tells a sagging hip from a raised one', () => {
    expect(hipOffset(body(150, 90, true))).toBeGreaterThan(0);
    expect(hipOffset(body(150, 90, false))).toBeLessThan(0);
  });
});

/* ---------- rule parser ---------- */

describe('parseRule and joints', () => {
  it('reads the joint triple from the research wording', () => {
    expect(jointTriplet('knee (hip-knee-ankle)')).toEqual(KNEE);
    expect(jointTriplet('shoulder-hip-ankle')).toEqual(['shoulder', 'hip', 'ankle']);
    expect(jointTriplet('shoulder abduction (hip-shoulder-elbow), both sides')).toEqual(SHOULDER);
    expect(jointTriplet('ankle (knee-ankle-foot index)')).toEqual(['knee', 'ankle', 'foot_index']);
    expect(jointTriplet('thigh spread (left_knee - mid_hip - right_knee)')).toBeNull();
  });
  it('parses the evaluable shapes', () => {
    const top = parseRule({ joint: 'knee', rule: 'top knee angle < 160 deg', message: 'Stand all the way up' });
    expect(top).toMatchObject({ kind: 'angle', when: 'top', op: '<', value: 160, never: false });
    const never = parseRule({ joint: 'elbow', rule: 'bottom elbow angle never <= 110', message: 'Lower' });
    expect(never).toMatchObject({ when: 'bottom', op: '<=', value: 110, never: true });
    const dur = parseRule({ joint: 'tempo', rule: 'rep duration < 1.0 s', message: 'Slow down' });
    expect(dur).toMatchObject({ kind: 'repDuration', op: '<', value: 1 });
    const sag = parseRule({ joint: 'hip', rule: 'shoulder-hip-ankle angle < 160 with hip below line', message: 'Hips sagging' });
    expect(sag).toMatchObject({ when: 'always', hip: 'below', value: 160 });
    const open = parseRule({ joint: 'shoulder', rule: 'shoulder abduction angle < 150 degrees at open phase (equals open phase threshold): not counted, flagged', message: 'Reach higher' });
    expect(open).toMatchObject({ when: 'active', op: '<', value: 150 });
  });
  it('leaves flags, views, ratios and conditions unevaluated instead of guessing', () => {
    for (const rule of [
      'front view: knee width < 80% of ankle width at bottom',
      'hard-landing flag: ankle or hip vertical speed spikes at landing (separate flag)',
      'rep duration < 1.5 s when controlled tempo is set',
      'lowest knee angle > 120 deg on 3 consecutive reps',
      'beginner hold > 60 s',
    ]) expect(parseRule({ joint: 'x', rule, message: 'm' })).toBeNull();
  });
  it('builds a config for most research exercises and keeps the rest listed as unchecked', () => {
    const withConfig = researchExercises.filter((e) => configFor(e));
    expect(withConfig.length).toBeGreaterThanOrEqual(40);
    const sq = configFor(ex('bodyweight-squat')) as EngineConfig;
    expect(sq.mode).toBe('reps');
    expect(sq.main?.rest).toMatchObject({ op: '>=', value: 160 });
    expect(sq.main?.active).toMatchObject({ op: '<=', value: 110 });
    expect(sq.unchecked.length + sq.rules.length).toBe(ex('bodyweight-squat').formChecks.length);
    expect(sq.unchecked.length).toBeGreaterThan(0);
    expect(configFor(ex('treadmill'))).toBeNull();
  });
});

/* ---------- reps ---------- */

describe('squat (research thresholds: up >= 160, down <= 110)', () => {
  it('counts clean reps', () => {
    const r = play(squat(), frames(12.5, (t) => limb(KNEE, wave(t, 2.5, 172, 95))));
    expect(r.last.reps).toBe(5);
    expect(r.events.filter((e) => e.counted)).toHaveLength(5);
    expect(r.messages.filter((m) => /lower|slow/i.test(m))).toEqual([]);
    expect(r.last.phase).toBe('rest');
  });
  it('does not count partial reps and says so', () => {
    const r = play(squat(), frames(14, (t) => limb(KNEE, wave(t, 2.5, 172, 130))));
    expect(r.last.reps).toBe(0);
    expect(r.events.some((e) => e.reason === 'partial')).toBe(true);
    expect(r.messages.some((m) => /further|rep counts/i.test(m))).toBe(true);
  });
  it('counts only the full reps in a mixed set', () => {
    const depth = [95, 135, 95, 95, 135];
    const r = play(squat(), frames(14, (t) => limb(KNEE, wave(t % 2.5, 2.5, 172, depth[Math.min(4, Math.floor(t / 2.5))]))));
    expect(r.last.reps).toBe(3);
  });
  it('counts the right number with noisy data and single-frame spikes', () => {
    seed = 11;
    const r = play(squat(), frames(14, (t) => {
      const frame = Math.round(t * FPS);
      const spike = frame % 37 === 0 ? 70 : 0; // a wild frame now and then
      return limb(KNEE, wave(t, 2.5, 172, 95) + gauss() * 4 + spike);
    }));
    expect(r.last.reps).toBe(5);
  });
  it('ignores jitter that never leaves the middle zone', () => {
    const r = play(squat(), frames(10, (t) => limb(KNEE, 135 + 12 * Math.sin(t * 20))));
    expect(r.last.reps).toBe(0);
    expect(r.events).toEqual([]);
  });
  it('does not double count a flicker across the threshold', () => {
    // A real rep, then the angle flickers in and out of the down zone for a moment while rising.
    const r = play(squat(), frames(8, (t) => {
      if (t < 2.5) return limb(KNEE, wave(t, 2.5, 172, 95));
      if (t < 3.0) return limb(KNEE, 172);
      if (t < 3.4) return limb(KNEE, Math.floor(t * 30) % 2 ? 100 : 170); // 30 Hz flicker
      return limb(KNEE, 172);
    }));
    expect(r.last.reps).toBe(1);
  });
  it('flags a rep done too fast and still counts it when it was a real rep', () => {
    const r = play(squat(), frames(8, (t) => limb(KNEE, wave(t, 0.8, 172, 95))));
    expect(r.last.reps).toBeGreaterThanOrEqual(5);
    expect(r.messages.some((m) => /slow down/i.test(m))).toBe(true);
    expect(r.events.some((e) => e.reason === 'too_fast')).toBe(true);
  });
  it('says "Stand all the way up" when the top was not reached, and nothing when it was', () => {
    // Rest zone needs >= 160 so top angles under 160 cannot be counted; use a rule on a custom config.
    const cfg: EngineConfig = {
      ...(configFor(ex('bodyweight-squat')) as EngineConfig),
      rules: [parseRule({ joint: 'knee', rule: 'top knee angle < 170 deg', message: 'Stand all the way up' })!],
    };
    expect(play(createEngine(cfg), frames(8, (t) => limb(KNEE, wave(t, 2.5, 165, 95)))).messages).toContain('Stand all the way up');
    expect(play(createEngine(cfg), frames(8, (t) => limb(KNEE, wave(t, 2.5, 178, 95)))).messages).not.toContain('Stand all the way up');
  });
  it('asks the person to step back when the leg is not visible, and resumes after', () => {
    const eng = squat();
    const hidden = () => { const p = limb(KNEE, 172); p.left_knee.c = 0; p.right_knee.c = 0; return p; };
    const a = play(eng, frames(2, hidden));
    expect(a.last.phase).toBe('unknown');
    expect(a.last.angle).toBeNull();
    expect(a.messages.some((m) => /step back/i.test(m))).toBe(true);
    const b = play(eng, frames(8, (t) => limb(KNEE, wave(t, 2.5, 172, 95))).map((f) => ({ ...f, t: f.t + 2 })));
    expect(b.last.reps).toBeGreaterThanOrEqual(2);
  });
  it('reset clears the count', () => {
    const eng = squat();
    play(eng, frames(6, (t) => limb(KNEE, wave(t, 2.5, 172, 95))));
    eng.reset();
    expect(eng.push({ t: 0, pts: limb(KNEE, 172) }).reps).toBe(0);
  });
});

describe('push-up (elbow top >= 150, down <= 100)', () => {
  const pushUp = () => engineFor(ex('push-up')) as Engine;
  it('counts clean reps with a straight body and no form messages', () => {
    const r = play(pushUp(), frames(10, (t) => body(180, wave(t, 2.2, 165, 80))));
    expect(r.last.reps).toBe(4);
    expect(r.messages).toEqual([]);
  });
  it('warns about sagging hips only after they stay low, not for a blink', () => {
    const sag = play(pushUp(), frames(6, (t) => body(150, wave(t, 2.2, 165, 80))));
    expect(sag.messages).toContain('Hips sagging. Squeeze your glutes.');
    expect(sag.messages).not.toContain('Hips too high. Lower them into a plank.');
    const blink = play(pushUp(), frames(6, (t) => body(t > 2 && t < 2.1 ? 150 : 180, wave(t, 2.2, 165, 80))));
    expect(blink.messages).not.toContain('Hips sagging. Squeeze your glutes.');
    const high = play(pushUp(), frames(6, (t) => body(150, wave(t, 2.2, 165, 80))).map((f) => ({ ...f, pts: body(150, 165, false) })));
    expect(high.messages).toContain('Hips too high. Lower them into a plank.');
  });
  it('asks for more depth when the bottom never reaches the target', () => {
    const r = play(pushUp(), frames(8, (t) => body(180, wave(t, 2.2, 165, 125))));
    expect(r.last.reps).toBe(0);
    expect(r.messages).toContain('Go a little lower. Chest to a fist from the floor.');
  });
});

describe('curl (custom thresholds: extended >= 150, curled <= 55)', () => {
  it('counts clean reps and ignores half curls', () => {
    const full = play(createEngine(curlConfig), frames(12, (t) => limb(ELBOW, wave(t, 2.4, 165, 40))));
    expect(full.last.reps).toBe(5);
    const half = play(createEngine(curlConfig), frames(12, (t) => limb(ELBOW, wave(t, 2.4, 165, 100))));
    expect(half.last.reps).toBe(0);
    expect(half.events.some((e) => e.reason === 'partial')).toBe(true);
  });
  it('survives noise', () => {
    seed = 3;
    const r = play(createEngine(curlConfig), frames(12, (t) => limb(ELBOW, wave(t, 2.4, 165, 40) + gauss() * 5)));
    expect(r.last.reps).toBe(5);
  });
});

describe('jumping jack (shoulder abduction closed <= 40, open >= 150, min 0.8 s)', () => {
  const jj = () => engineFor(ex('jumping-jacks')) as Engine;
  it('counts clean reps on a front view', () => {
    // Arms rise from 15 to 170 degrees and back, 1.2 s per jack.
    const r = play(jj(), frames(8, (t) => limb(SHOULDER, 15 + 155 * (0.5 - 0.5 * Math.cos((2 * Math.PI * t) / 1.2)))));
    expect(r.last.reps).toBe(6);
    expect(r.messages).not.toContain('Reach higher: arms overhead');
  });
  it('does not count arms that stop below overhead', () => {
    const r = play(jj(), frames(8, (t) => limb(SHOULDER, 15 + 110 * (0.5 - 0.5 * Math.cos((2 * Math.PI * t) / 1.2)))));
    expect(r.last.reps).toBe(0);
  });
  it('tells the person to slow down when jacks come faster than the minimum', () => {
    const r = play(jj(), frames(6, (t) => limb(SHOULDER, 15 + 155 * (0.5 - 0.5 * Math.cos((2 * Math.PI * t) / 0.7)))));
    expect(r.last.reps).toBeGreaterThan(0);
    expect(r.messages.some((m) => /slow down/i.test(m))).toBe(true);
  });
});

/* ---------- hold timer ---------- */

describe('plank hold timer', () => {
  const plank = () => engineFor(ex('plank-and-side-plank')) as Engine;
  it('uses hold mode for the plank', () => {
    expect(plank().config.mode).toBe('hold_timer');
  });
  it('times a steady hold and reports the best hold', () => {
    const r = play(plank(), frames(12, () => body(178, 90)));
    expect(r.last.phase).toBe('hold');
    expect(r.last.holdSeconds).toBeGreaterThan(11);
    expect(r.last.holdSeconds).toBeLessThanOrEqual(12);
    expect(r.messages).toEqual([]);
  });
  it('does not start before the person is in position', () => {
    const r = play(plank(), frames(4, () => body(178, 160)));
    expect(r.last.holdSeconds).toBe(0);
    expect(r.last.phase).toBe('out');
  });
  it('survives noisy angles inside the allowed range', () => {
    seed = 21;
    const r = play(plank(), frames(10, () => body(178 - Math.abs(gauss()) * 3, 90 + gauss() * 4)));
    expect(r.last.phase).toBe('hold');
    expect(r.last.holdSeconds).toBeGreaterThan(9);
  });
  it('pauses and warns when the hips sag, then restarts the timer', () => {
    const eng = plank();
    const r = play(eng, frames(18, (t) => (t >= 8 && t < 12 ? body(150, 90) : body(178, 90))));
    expect(r.messages).toContain('Hips sagging: tighten your belly');
    const atSag = r.all[Math.round(11.5 * FPS)];
    expect(atSag.phase).toBe('out');
    expect(atSag.holdSeconds).toBe(0);
    expect(r.all[Math.round(7.9 * FPS)].bestHoldSeconds).toBeGreaterThan(7);
    expect(r.last.bestHoldSeconds).toBeGreaterThan(7);
    expect(r.last.phase).toBe('hold');
    expect(r.last.holdSeconds).toBeGreaterThan(4);
    expect(r.last.holdSeconds).toBeLessThan(6.2);
  });
  it('a one-frame dropout does not reset the hold', () => {
    const r = play(plank(), frames(8, (t) => (Math.abs(t - 4) < 0.02 ? body(120, 90) : body(178, 90))));
    expect(r.last.phase).toBe('hold');
    expect(r.last.holdSeconds).toBeGreaterThan(7);
  });
});

describe('message pacing', () => {
  it('repeats the same message at most every few seconds', () => {
    const r = play(engineFor(ex('push-up')) as Engine, frames(10, () => body(150, 165)));
    expect(r.messages.filter((m) => m === 'Hips sagging. Squeeze your glutes.').length).toBeLessThanOrEqual(3);
    expect(r.messages.filter((m) => m === 'Hips sagging. Squeeze your glutes.').length).toBeGreaterThanOrEqual(2);
  });
});

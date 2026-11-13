/**
 * Rep counter and form-check engine (roadmap Day 25). Pure logic: it takes pose
 * keypoints frame by frame (from any pose model; Day 26 adds the camera) and
 * returns a rep count, the current phase, hold time and form messages.
 *
 * Everything comes from the fitness research data of the exercise: the
 * `repCounter` thresholds and the `formChecks` rules. Only rules whose text can
 * be evaluated mechanically are parsed (an angle against a number, a rep
 * duration, a hip above or below the body line). The rest are listed in
 * `engine.unchecked` so the screen can say they are not checked automatically.
 * Nothing here medically judges a person; it only compares angles.
 */
import type { AngleRule, Exercise, FormCheck } from '../models/exercise';

export type Pt = { x: number; y: number; /** 0 to 1, how sure the pose model is. Missing counts as 1. */ c?: number };
export type Frame = { /** Seconds, any origin, must increase. */ t: number; pts: Record<string, Pt> };

export type Triplet = [string, string, string];
export type Phase = 'unknown' | 'rest' | 'active' | 'hold' | 'out';
export type MessageKind = 'form' | 'tempo' | 'partial' | 'visibility';
export type RepMessage = { id: string; text: string; kind: MessageKind };
export type RepEvent = { counted: boolean; durationSec: number; reason: 'ok' | 'partial' | 'too_fast' | 'noise' };

export type Update = {
  reps: number;
  phase: Phase;
  /** Smoothed angle of the main joint, null when it cannot be seen. */
  angle: number | null;
  /** Seconds of the current hold (hold mode), 0 otherwise. */
  holdSeconds: number;
  bestHoldSeconds: number;
  /** New messages this frame only (each repeats at most every few seconds). */
  messages: RepMessage[];
  /** Set on the frame a rep attempt ends. */
  repEvent: RepEvent | null;
};

export const MIN_CONFIDENCE = 0.3;
const SMOOTH_ALPHA = 0.45;
/** Degrees the angle must travel out of the rest zone for a failed attempt to count as a partial rep. */
const PARTIAL_TRAVEL_DEG = 15;
/** Reps shorter than this share of minRepSec are treated as noise (double counts) and ignored silently. */
const NOISE_SHARE = 0.5;
const MESSAGE_COOLDOWN_SEC = 4;
const HOLD_ENTER_SEC = 0.3;
const HOLD_EXIT_SEC = 0.5;
/** A continuous-rule problem must last this long before it is shown. */
const RULE_PERSIST_SEC = 0.4;

const SIDES = ['left', 'right'] as const;

/* ---------- geometry ---------- */

/** Angle in degrees (0 to 180) at b between a-b and c-b. */
export function angleAt(a: Pt, b: Pt, c: Pt): number | null {
  const v1x = a.x - b.x, v1y = a.y - b.y, v2x = c.x - b.x, v2y = c.y - b.y;
  const n = Math.hypot(v1x, v1y) * Math.hypot(v2x, v2y);
  if (n < 1e-9) return null;
  const cos = Math.max(-1, Math.min(1, (v1x * v2x + v1y * v2y) / n));
  return (Math.acos(cos) * 180) / Math.PI;
}

const seen = (p: Pt | undefined): p is Pt => !!p && (p.c ?? 1) >= MIN_CONFIDENCE;

/** Joint angle averaged over the sides the model can see; null when neither side is visible. */
export function jointAngle(pts: Record<string, Pt>, t: Triplet): number | null {
  const vals: number[] = [];
  for (const s of SIDES) {
    const [a, b, c] = t.map((n) => pts[`${s}_${n}`]);
    if (seen(a) && seen(b) && seen(c)) {
      const v = angleAt(a, b, c);
      if (v !== null) vals.push(v);
    }
  }
  return vals.length ? vals.reduce((x, y) => x + y, 0) / vals.length : null;
}

const LANDMARKS = new Set(['nose', 'ear', 'shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle', 'heel', 'foot_index']);

/** Landmarks of a joint named in the research ("knee (hip-knee-ankle)", "elbow", "shoulder-hip-ankle"). */
export function jointTriplet(joint: string): Triplet | null {
  const j = joint.toLowerCase();
  const paren = j.match(/\(([a-z ]+)-([a-z ]+)-([a-z ]+)\)/);
  if (paren) {
    const t = [paren[1], paren[2], paren[3]].map((n) => n.trim().replace(/ /g, '_'));
    return t.every((n) => LANDMARKS.has(n)) ? (t as Triplet) : null;
  }
  const dash = j.match(/\b(shoulder|hip|knee|ankle|elbow|wrist)-(shoulder|hip|knee|ankle|elbow|wrist)-(shoulder|hip|knee|ankle|elbow|wrist)\b/);
  if (dash) return [dash[1], dash[2], dash[3]];
  if (j.includes('abduction')) return ['hip', 'shoulder', 'elbow'];
  if (/^knee\b/.test(j)) return ['hip', 'knee', 'ankle'];
  if (/^elbow\b/.test(j)) return ['shoulder', 'elbow', 'wrist'];
  if (/^hip\b/.test(j)) return ['shoulder', 'hip', 'knee'];
  if (/^shoulder\b/.test(j)) return ['hip', 'shoulder', 'elbow'];
  return null;
}

/** Signed offset of the hip from the shoulder-ankle line: positive means below the line (image y grows downward). */
export function hipOffset(pts: Record<string, Pt>): number | null {
  const offs: number[] = [];
  for (const s of SIDES) {
    const sh = pts[`${s}_shoulder`], hp = pts[`${s}_hip`], an = pts[`${s}_ankle`];
    if (!seen(sh) || !seen(hp) || !seen(an) || Math.abs(an.x - sh.x) < 1e-9) continue;
    const lineY = sh.y + ((hp.x - sh.x) / (an.x - sh.x)) * (an.y - sh.y);
    offs.push(hp.y - lineY);
  }
  return offs.length ? offs.reduce((x, y) => x + y, 0) / offs.length : null;
}

/* ---------- rule parsing ---------- */

type Op = '<' | '<=' | '>' | '>=';
const test = (op: Op | AngleRule['op'], v: number, a: number, max: number | null = null): boolean =>
  op === '<' ? v < a : op === '<=' ? v <= a : op === '>' ? v > a : op === '>=' ? v >= a : v >= a && v <= (max ?? a);

export type When = 'top' | 'bottom' | 'active' | 'rest' | 'always';
export type ParsedRule =
  | { kind: 'angle'; joint: string; triplet: Triplet; op: Op; value: number; when: When; never: boolean; hip: 'below' | 'above' | null; message: string; rule: string }
  | { kind: 'repDuration'; op: '<' | '>'; value: number; message: string; rule: string };

/** Parses one research form rule. null means the text cannot be checked mechanically. */
export function parseRule(fc: FormCheck): ParsedRule | null {
  const rule = fc.rule.toLowerCase().trim();
  // "front view" and "side view" rules, ratios and separate flags need more than one angle.
  if (/\bfront view:|\bside view:|\(front view\)|\bflag\b|\bratio\b|\bcm\b|landmark|width|speed|\bwhen\b|\bmode\b|\bversion\b/.test(rule)) return null;
  const dur = rule.match(/^rep duration\s*([<>])\s*(\d+(?:\.\d+)?)\s*s\b/);
  if (dur) return { kind: 'repDuration', op: dur[1] as '<' | '>', value: Number(dur[2]), message: fc.message, rule: fc.rule };
  const m = rule.match(
    /^(?:[a-z ]+: )?(?:(top|bottom) )?([a-z]+(?:[ -][a-z]+)*?) angle (never )?(<=|>=|<|>) ?(\d+(?:\.\d+)?)(?: ?deg(?:rees)?)?(?: at (open|closed) phase)?(?: with hip (below|above) line)?\s*(?:\(.*\))?:?\s*(?:not counted, flagged)?$/,
  );
  if (!m) return null;
  const triplet = jointTriplet(m[2]);
  if (!triplet) return null;
  const when: When = m[1] === 'top' ? 'top' : m[1] === 'bottom' ? 'bottom' : m[6] === 'open' ? 'active' : m[6] === 'closed' ? 'rest' : 'always';
  return {
    kind: 'angle', joint: m[2], triplet, op: m[4] as Op, value: Number(m[5]), when, never: !!m[3],
    hip: (m[7] as 'below' | 'above' | undefined) ?? null, message: fc.message, rule: fc.rule,
  };
}

/* ---------- engine configuration ---------- */

export type HoldGroup = { name: string; checks: { triplet: Triplet; rule: AngleRule }[] };

export type EngineConfig = {
  mode: 'reps' | 'hold_timer';
  minRepSec: number;
  /** Reps: the main joint and the two zones. rest is where a rep starts and ends. */
  main: { triplet: Triplet; rest: AngleRule; active: AngleRule } | null;
  /** Hold timer: alternative positions, any one fully satisfied counts as holding. */
  groups: HoldGroup[];
  rules: ParsedRule[];
  /** Research rules that are not evaluated automatically. */
  unchecked: FormCheck[];
};

const restIsHigh = (r: AngleRule) => r.op === '>=' || r.op === '>';

/** Builds the engine settings from an exercise's research data. null when the exercise has no usable counter. */
export function configFor(e: Pick<Exercise, 'repCounter' | 'formChecks'>): EngineConfig | null {
  const rc = e.repCounter;
  if (!rc || (rc.mode !== 'reps' && rc.mode !== 'hold_timer')) return null;
  const rules: ParsedRule[] = [];
  const unchecked: FormCheck[] = [];
  for (const fc of e.formChecks) {
    const p = parseRule(fc);
    if (p) rules.push(p);
    else unchecked.push(fc);
  }
  const base = { mode: rc.mode, minRepSec: rc.minRepSec ?? (rc.mode === 'hold_timer' ? 5 : 1), rules, unchecked };
  const usable = rc.phases
    .map((p) => ({ p, triplet: jointTriplet(p.joint) }))
    .filter((x): x is { p: (typeof rc.phases)[number]; triplet: Triplet } => !!x.triplet && !!x.p.parsed);
  if (rc.mode === 'hold_timer') {
    const byName = new Map<string, HoldGroup>();
    for (const { p, triplet } of usable) {
      const g = byName.get(p.name) ?? { name: p.name, checks: [] };
      g.checks.push({ triplet, rule: p.parsed as AngleRule });
      byName.set(p.name, g);
    }
    const groups = [...byName.values()];
    return groups.length ? { ...base, mode: 'hold_timer', main: null, groups } : null;
  }
  if (!usable.length) return null;
  const first = usable[0];
  const key = (t: Triplet) => t.join('-');
  const same = usable.filter((x) => key(x.triplet) === key(first.triplet));
  const second = same.find((x) => x.p.name !== first.p.name && x.p.parsed && restIsHigh(first.p.parsed as AngleRule) !== restIsHigh(x.p.parsed));
  if (!second) return null;
  return { ...base, mode: 'reps', main: { triplet: first.triplet, rest: first.p.parsed as AngleRule, active: second.p.parsed as AngleRule }, groups: [] };
}

/* ---------- engine ---------- */

const median3 = (a: number, b: number, c: number) => a + b + c - Math.min(a, b, c) - Math.max(a, b, c);

export type Engine = {
  push: (f: Frame) => Update;
  reset: () => void;
  config: EngineConfig;
  unchecked: FormCheck[];
};

export function createEngine(config: EngineConfig, opts: { alpha?: number } = {}): Engine {
  const alpha = opts.alpha ?? SMOOTH_ALPHA;
  let reps = 0;
  let raw: number[] = [];
  let smooth: number | null = null;
  let phase: Phase = 'unknown';
  // rep attempt tracking
  let attemptStart: number | null = null;
  let extremes: Map<ParsedRule, { min: number; max: number }> = new Map();
  let lowest = Infinity, highest = -Infinity;
  // hold tracking
  let holding = false, inSince: number | null = null, outSince: number | null = null, holdStart: number | null = null;
  let best = 0;
  // message state
  const lastShown = new Map<string, number>();
  const badSince = new Map<string, number>();

  const reset = () => {
    reps = 0; raw = []; smooth = null; phase = 'unknown'; attemptStart = null; extremes = new Map();
    lowest = Infinity; highest = -Infinity; holding = false; inSince = null; outSince = null; holdStart = null; best = 0;
    lastShown.clear(); badSince.clear(); ruleBuf.clear();
  };

  const emit = (out: RepMessage[], m: RepMessage, t: number) => {
    const last = lastShown.get(m.id);
    if (last !== undefined && t - last < MESSAGE_COOLDOWN_SEC) return;
    lastShown.set(m.id, t);
    out.push(m);
  };

  const startAttempt = (t: number) => {
    attemptStart = t; lowest = Infinity; highest = -Infinity;
  };

  // Rule extremes run from the end of the last attempt, so "top" includes the standing position before the rep.
  const ruleBuf = new Map<ParsedRule, number[]>();
  const trackRules = (pts: Record<string, Pt>) => {
    for (const r of config.rules) {
      if (r.kind !== 'angle') continue;
      const a = jointAngle(pts, r.triplet);
      if (a === null) continue;
      const buf = ruleBuf.get(r) ?? [];
      buf.push(a);
      if (buf.length > 3) buf.shift();
      ruleBuf.set(r, buf);
      const v = buf.length === 3 ? median3(buf[0], buf[1], buf[2]) : a;
      const cur = extremes.get(r) ?? { min: v, max: v };
      extremes.set(r, { min: Math.min(cur.min, v), max: Math.max(cur.max, v) });
    }
  };

  /** Rule messages for a finished rep attempt. */
  const judgeAttempt = (t: number, durationSec: number, counted: boolean, out: RepMessage[]) => {
    const m = config.main as NonNullable<EngineConfig['main']>;
    const high = restIsHigh(m.rest);
    for (const r of config.rules) {
      if (r.kind === 'repDuration') {
        if (counted && test(r.op, durationSec, r.value)) emit(out, { id: `rule:${r.rule}`, text: r.message, kind: 'tempo' }, t);
        continue;
      }
      const ex = extremes.get(r);
      if (!ex || r.when === 'always') continue;
      const v = r.when === 'top' ? ex.max : r.when === 'bottom' ? ex.min : r.when === 'active' ? (high ? ex.min : ex.max) : high ? ex.max : ex.min;
      const holds = test(r.op, v, r.value);
      if (r.never ? !holds : holds) emit(out, { id: `rule:${r.rule}`, text: r.message, kind: 'form' }, t);
    }
  };

  /** Rules checked every frame (no top/bottom word): hold mode and body-line rules. */
  const judgeContinuous = (pts: Record<string, Pt>, t: number, out: RepMessage[], active: boolean) => {
    for (const r of config.rules) {
      if (r.kind !== 'angle' || r.when !== 'always' || !active) continue;
      const a = jointAngle(pts, r.triplet);
      let bad = a !== null && test(r.op, a, r.value);
      if (bad && r.hip) {
        const off = hipOffset(pts);
        bad = off !== null && (r.hip === 'below' ? off > 0 : off < 0);
      }
      const key = r.rule;
      if (!bad) { badSince.delete(key); continue; }
      const since = badSince.get(key) ?? t;
      badSince.set(key, since);
      if (t - since >= RULE_PERSIST_SEC) emit(out, { id: `rule:${key}`, text: r.message, kind: 'form' }, t);
    }
  };

  const base = (out: RepMessage[], ev: RepEvent | null, hold: number): Update => ({
    reps, phase, angle: smooth, holdSeconds: hold, bestHoldSeconds: Math.max(best, hold), messages: out, repEvent: ev,
  });

  const pushReps = (f: Frame): Update => {
    const m = config.main as NonNullable<EngineConfig['main']>;
    const out: RepMessage[] = [];
    const a = jointAngle(f.pts, m.triplet);
    if (a === null) {
      phase = 'unknown';
      emit(out, { id: 'visibility', text: 'Step back so I can see all of you.', kind: 'visibility' }, f.t);
      return base(out, null, 0);
    }
    raw.push(a);
    if (raw.length > 3) raw.shift();
    const filtered = raw.length === 3 ? median3(raw[0], raw[1], raw[2]) : a;
    smooth = smooth === null ? filtered : smooth + alpha * (filtered - smooth);
    const s = smooth;
    if (attemptStart !== null) { lowest = Math.min(lowest, s); highest = Math.max(highest, s); }
    trackRules(f.pts);
    judgeContinuous(f.pts, f.t, out, true);
    const inRest = test(m.rest.op, s, m.rest.value, m.rest.max);
    const inActive = test(m.active.op, s, m.active.value, m.active.max);
    let ev: RepEvent | null = null;
    if (phase === 'unknown') {
      // First stable reading: only start from a clear zone, never from the middle.
      if (inRest) phase = 'rest';
      else if (inActive) { phase = 'active'; startAttempt(f.t); }
      return base(out, null, 0);
    }
    if (phase === 'rest') {
      if (!inRest) {
        if (attemptStart === null) { startAttempt(f.t); lowest = highest = s; }
        if (inActive) phase = 'active';
      }
      if (inRest && attemptStart !== null) {
        // Back at rest without reaching the active zone: partial rep if it travelled far enough.
        const travel = restIsHigh(m.rest) ? m.rest.value - lowest : highest - (m.rest.max ?? m.rest.value);
        const duration = f.t - attemptStart;
        if (travel >= PARTIAL_TRAVEL_DEG && duration >= config.minRepSec * NOISE_SHARE) {
          ev = { counted: false, durationSec: duration, reason: 'partial' };
          const before = out.length;
          judgeAttempt(f.t, duration, false, out);
          if (out.length === before) emit(out, { id: 'partial', text: 'Go a little further so the rep counts.', kind: 'partial' }, f.t);
        }
        attemptStart = null;
        extremes = new Map();
      }
      return base(out, ev, 0);
    }
    // phase === 'active'
    if (inRest && attemptStart !== null) {
      const duration = f.t - attemptStart;
      phase = 'rest';
      if (duration < config.minRepSec * NOISE_SHARE) ev = { counted: false, durationSec: duration, reason: 'noise' };
      else {
        reps += 1;
        ev = { counted: true, durationSec: duration, reason: duration < config.minRepSec ? 'too_fast' : 'ok' };
        if (duration < config.minRepSec) emit(out, { id: 'too_fast', text: 'Slow down a little.', kind: 'tempo' }, f.t);
        judgeAttempt(f.t, duration, true, out);
      }
      attemptStart = null;
      extremes = new Map();
    }
    return base(out, ev, 0);
  };

  const pushHold = (f: Frame): Update => {
    const out: RepMessage[] = [];
    let anyVisible = false;
    let ok = false;
    let lead: number | null = null;
    for (const g of config.groups) {
      let all = true, visible = true;
      for (const c of g.checks) {
        const a = jointAngle(f.pts, c.triplet);
        if (a === null) { visible = false; all = false; continue; }
        if (lead === null) lead = a;
        if (!test(c.rule.op, a, c.rule.value, c.rule.max)) all = false;
      }
      if (visible) anyVisible = true;
      if (all) ok = true;
    }
    smooth = lead;
    if (!anyVisible) {
      phase = 'unknown';
      inSince = null;
      emit(out, { id: 'visibility', text: 'Step back so I can see all of you.', kind: 'visibility' }, f.t);
      if (holding) { outSince = outSince ?? f.t; if (f.t - outSince >= HOLD_EXIT_SEC) { holding = false; holdStart = null; } }
      return base(out, null, holding && holdStart !== null ? f.t - holdStart : 0);
    }
    if (ok) {
      outSince = null;
      inSince = inSince ?? f.t;
      if (!holding && f.t - inSince >= HOLD_ENTER_SEC) { holding = true; holdStart = inSince; }
    } else {
      inSince = null;
      if (holding) {
        outSince = outSince ?? f.t;
        if (f.t - outSince >= HOLD_EXIT_SEC) {
          best = Math.max(best, (outSince - (holdStart ?? outSince)));
          holding = false; holdStart = null; outSince = null;
        }
      }
    }
    phase = holding ? 'hold' : 'out';
    judgeContinuous(f.pts, f.t, out, holding || !ok);
    const hold = holding && holdStart !== null ? f.t - holdStart - (outSince !== null ? f.t - outSince : 0) : 0;
    return base(out, null, Math.max(0, hold));
  };

  return {
    config,
    unchecked: config.unchecked,
    reset,
    push: (f) => (config.mode === 'reps' ? pushReps(f) : pushHold(f)),
  };
}

/** Engine for an exercise, or null when its research has no usable counter (the player then stays manual). */
export function engineFor(e: Pick<Exercise, 'repCounter' | 'formChecks'>): Engine | null {
  const c = configFor(e);
  return c ? createEngine(c) : null;
}

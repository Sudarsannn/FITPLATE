import { afterEach, describe, expect, it } from '@jest/globals';

import { featureFlags } from '../config/featureFlags';
import { researchExercises } from '../data/research';
import type { Exercise } from '../models/exercise';
import {
  clipFileName, clipLabel, clockLabel, fromMediaPipe, fromMoveNet, getPoseProvider, parseClipName, placementGuide, poseReady, registerPoseProvider,
} from '../services/cameraWorkout';
import { createEngine, configFor, jointAngle, type EngineConfig, type Frame } from '../services/repCounter';

const ex = (id: string) => researchExercises.find((e) => e.id === id) as Exercise;

describe('placementGuide', () => {
  it('follows the researched camera view', () => {
    expect(placementGuide(ex('bodyweight-squat'))).toMatchObject({ view: 'side', low: false, title: 'Film from the side' });
    expect(placementGuide(ex('jumping-jacks'))).toMatchObject({ view: 'front', title: 'Film from the front' });
    expect(placementGuide(ex('plank-and-side-plank')).view).toBe('either');
  });
  it('puts the phone low for floor work and at waist height for standing moves', () => {
    expect(placementGuide(ex('push-up'))).toMatchObject({ low: true });
    expect(placementGuide(ex('push-up')).height).toMatch(/floor/i);
    expect(placementGuide(ex('bodyweight-squat')).height).toMatch(/waist/i);
  });
  it('has distance and steps for every exercise that can count', () => {
    for (const e of researchExercises.filter((x) => x.repCounter && x.repCounter.mode !== 'none')) {
      const g = placementGuide(e);
      expect(g.distance).toMatch(/m/);
      expect(g.steps.length).toBeGreaterThanOrEqual(3);
    }
  });
  it('falls back to either view when the research has no counter', () => {
    expect(placementGuide({ name: 'Treadmill', repCounter: null }).view).toBe('either');
  });
});

describe('clip names', () => {
  const d = new Date(2026, 10, 14, 9, 5, 7);
  it('builds a safe file name and reads it back', () => {
    const n = clipFileName('bodyweight-squat', d);
    expect(n).toBe('fitplate-bodyweight-squat-20261114-090507.mp4');
    const info = parseClipName(n);
    expect(info?.exerciseId).toBe('bodyweight-squat');
    expect(info?.at.getTime()).toBe(d.getTime());
  });
  it('strips odd characters and ignores foreign files', () => {
    expect(clipFileName('../etc/passwd', d)).toBe('fitplate-etcpasswd-20261114-090507.mp4');
    expect(parseClipName('holiday.mp4')).toBeNull();
    expect(parseClipName('fitplate-x-2026.mp4')).toBeNull();
  });
  it('labels time and clock', () => {
    expect(clipLabel(d)).toBe('14 Nov, 9:05 am');
    expect(clipLabel(new Date(2026, 0, 2, 0, 30))).toBe('2 Jan, 12:30 am');
    expect(clipLabel(new Date(2026, 0, 2, 15, 0))).toBe('2 Jan, 3:00 pm');
    expect(clockLabel(65)).toBe('1:05');
    expect(clockLabel(-3)).toBe('0:00');
  });
});

describe('keypoint mappers', () => {
  it('maps the 17 MoveNet keypoints by name and scales x by the frame aspect', () => {
    const kps = Array.from({ length: 17 }, (_, i) => ({ x: i / 17, y: 0.5, score: 0.9 }));
    const p = fromMoveNet(kps, 2);
    expect(Object.keys(p)).toHaveLength(17);
    expect(p.left_shoulder).toEqual({ x: (5 / 17) * 2, y: 0.5, c: 0.9 });
    expect(p.right_ankle.x).toBeCloseTo((16 / 17) * 2, 6);
    expect(p.left_heel).toBeUndefined();
  });
  it('maps MediaPipe landmarks including heels and foot index', () => {
    const kps = Array.from({ length: 33 }, (_, i) => ({ x: 0.1, y: i / 33 }));
    const p = fromMediaPipe(kps);
    expect(p.left_hip.y).toBeCloseTo(23 / 33, 6);
    expect(p.right_foot_index.y).toBeCloseTo(32 / 33, 6);
    expect(p.nose.c).toBe(1);
  });
  it('skips missing or non-finite points and short arrays', () => {
    const p = fromMoveNet([{ x: 0.5, y: NaN }, { x: 0.2, y: 0.3 }]);
    expect(p.nose).toBeUndefined();
    expect(p.left_eye).toBeDefined();
    expect(p.left_knee).toBeUndefined();
  });
  it('feeds the Day 25 engine: a MoveNet squat sequence counts reps', () => {
    const cfg = configFor(ex('bodyweight-squat')) as EngineConfig;
    const engine = createEngine(cfg);
    const FPS = 30;
    // Hip above knee above ankle, knee angle swinging 172 to 95 degrees, as MoveNet-ordered keypoints.
    const frameAt = (t: number): Frame => {
      const deg = 172 - 77 * (0.5 - 0.5 * Math.cos((2 * Math.PI * t) / 2.5));
      const r = (deg * Math.PI) / 180;
      const knee = { x: 0.5, y: 0.6 };
      const hip = { x: 0.5, y: 0.4 };
      const ankle = { x: 0.5 + 0.2 * Math.sin(Math.PI - r), y: 0.6 - 0.2 * Math.cos(Math.PI - r) * -1 };
      const kps = Array.from({ length: 17 }, () => ({ x: 0.5, y: 0.5, score: 1 }));
      for (const [name, p] of [['hip', hip], ['knee', knee], ['ankle', ankle]] as const) {
        kps[name === 'hip' ? 11 : name === 'knee' ? 13 : 15] = { ...p, score: 1 };
        kps[name === 'hip' ? 12 : name === 'knee' ? 14 : 16] = { ...p, score: 1 };
      }
      return { t, pts: fromMoveNet(kps, 1) };
    };
    let last = engine.push(frameAt(0));
    expect(jointAngle(frameAt(0).pts, ['hip', 'knee', 'ankle'])).toBeGreaterThan(160);
    for (let i = 1; i < 12.5 * FPS; i++) last = engine.push(frameAt(i / FPS));
    expect(last.reps).toBe(5);
  });
});

describe('pose provider and flags', () => {
  afterEach(() => registerPoseProvider(null));
  it('ships with camera mode on and live pose off', () => {
    expect(featureFlags.cameraWorkout).toBe(true);
    expect(featureFlags.poseRepCounter).toBe(false);
  });
  it('needs both the flag and a registered provider', () => {
    const on = { ...featureFlags, poseRepCounter: true };
    expect(poseReady(on)).toBe(false);
    registerPoseProvider({ id: 't', label: 'Test', start: () => () => undefined });
    expect(getPoseProvider()?.id).toBe('t');
    expect(poseReady(on)).toBe(true);
    expect(poseReady(featureFlags)).toBe(false);
  });
});

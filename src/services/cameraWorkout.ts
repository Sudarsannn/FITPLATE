/**
 * Camera workout mode helpers (roadmap Day 26). Pure logic only, so everything
 * here is unit tested: the phone-placement guide, clip file names, and the
 * mappers that turn a pose model's keypoints into the named landmarks the
 * Day 25 engine (repCounter.ts) reads. The screen is src/app/camera/[id].tsx.
 */
import type { Exercise } from '../models/exercise';
import { featureFlags, isEnabled, type FeatureFlag } from '../config/featureFlags';
import type { Pt } from './repCounter';

/* ---------- phone placement ---------- */

export type PlacementGuide = {
  view: 'side' | 'front' | 'either';
  /** True for floor work (plank, push-up, bridge): the phone sits low. */
  low: boolean;
  title: string;
  steps: string[];
  distance: string;
  height: string;
};

const FLOOR_WORK = /plank|push.?up|crunch|bridge|dead.?bug|bird|cobra|bhujang|superman|mountain|burpee|dip|cat.?cow|child|balasana|downward|adho|glute/i;

/** Where to prop the phone, how far and at what angle, from the researched camera view. */
export function placementGuide(e: Pick<Exercise, 'name' | 'repCounter'>): PlacementGuide {
  const view = e.repCounter?.cameraView ?? 'either';
  const low = FLOOR_WORK.test(e.name);
  const distance = low ? 'About 2 m (6 feet) away, so your whole body fits end to end.' : 'About 2 to 2.5 m (7 feet) away, so you fit head to feet with room to move.';
  const height = low ? 'Low, about 30 cm (a foot) off the floor, leaning on a shoe or a bottle.' : 'Around waist height, on a shelf, chair or stack of books.';
  const stand =
    view === 'side'
      ? 'Stand sideways to the phone, so it sees your left or right side. The side that faces the phone is the one that gets measured.'
      : view === 'front'
        ? 'Face the phone straight on, feet about hip width apart.'
        : 'Face the phone or stand sideways to it. Either works for this move.';
  return {
    view,
    low,
    title: view === 'side' ? 'Film from the side' : view === 'front' ? 'Film from the front' : 'Front or side both work',
    steps: [
      stand,
      'Keep the phone upright and still. Lean it on something steady and keep it level, not tilted up or down.',
      'Light on you, not behind you. Plain clothes that show your knees and elbows help.',
      'Keep your whole body in the picture the whole time, including hands and feet.',
    ],
    distance,
    height,
  };
}

/* ---------- clips ---------- */

export const CLIP_DIR = 'clips';
export const MAX_CLIP_SECONDS = 120;

const two = (n: number) => String(n).padStart(2, '0');

/** fitplate-<exercise>-YYYYMMDD-HHMMSS.mp4, in local time so the name matches the person's clock. */
export function clipFileName(exerciseId: string, d: Date): string {
  const safe = exerciseId.replace(/[^a-z0-9-]/gi, '').toLowerCase() || 'workout';
  return `fitplate-${safe}-${d.getFullYear()}${two(d.getMonth() + 1)}${two(d.getDate())}-${two(d.getHours())}${two(d.getMinutes())}${two(d.getSeconds())}.mp4`;
}

export type ClipInfo = { exerciseId: string; at: Date };

export function parseClipName(name: string): ClipInfo | null {
  const m = name.match(/^fitplate-([a-z0-9-]+)-(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})\.(?:mp4|mov)$/);
  if (!m) return null;
  return { exerciseId: m[1], at: new Date(Number(m[2]), Number(m[3]) - 1, Number(m[4]), Number(m[5]), Number(m[6]), Number(m[7])) };
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "14 Nov, 9:05 am" */
export function clipLabel(at: Date): string {
  const h = at.getHours();
  return `${at.getDate()} ${MONTHS[at.getMonth()]}, ${h % 12 || 12}:${two(at.getMinutes())} ${h < 12 ? 'am' : 'pm'}`;
}

/** "1:05" */
export function clockLabel(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${two(s % 60)}`;
}

/* ---------- pose model keypoints -> engine landmarks ---------- */

export type Keypoint = { x: number; y: number; score?: number };

const MOVENET = [
  'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
  'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle',
] as const;

const MEDIAPIPE = [
  'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer', 'right_eye_inner', 'right_eye', 'right_eye_outer', 'left_ear', 'right_ear',
  'mouth_left', 'mouth_right', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist',
  'left_pinky', 'right_pinky', 'left_index', 'right_index', 'left_thumb', 'right_thumb', 'left_hip', 'right_hip',
  'left_knee', 'right_knee', 'left_ankle', 'right_ankle', 'left_heel', 'right_heel', 'left_foot_index', 'right_foot_index',
] as const;

function toPoints(names: readonly string[], kps: readonly Keypoint[], aspect: number): Record<string, Pt> {
  const out: Record<string, Pt> = {};
  names.forEach((n, i) => {
    const k = kps[i];
    if (!k || !Number.isFinite(k.x) || !Number.isFinite(k.y)) return;
    // Models give 0 to 1 per axis. Scale x by width / height so angles are not squashed on a wide frame.
    out[n] = { x: k.x * aspect, y: k.y, c: k.score ?? 1 };
  });
  return out;
}

/** MoveNet (17 keypoints, normalised 0 to 1). `aspect` is frame width divided by height. */
export const fromMoveNet = (kps: readonly Keypoint[], aspect = 1) => toPoints(MOVENET, kps, aspect);
/** MediaPipe Pose Landmarker (33 landmarks, normalised 0 to 1). */
export const fromMediaPipe = (kps: readonly Keypoint[], aspect = 1) => toPoints(MEDIAPIPE, kps, aspect);

/* ---------- pose provider (filled by a dev build) ---------- */

/**
 * A live pose source. Expo Go cannot run one, so none is registered there and the
 * screen uses the manual counter. A development build registers one at start-up
 * (see docs/CAMERA_WORKOUT.md) and flips `poseRepCounter` on.
 */
export type PoseProvider = {
  id: string;
  label: string;
  /** Starts sending poses; returns a function that stops them. */
  start: (onPose: (pts: Record<string, Pt>) => void) => () => void;
};

let provider: PoseProvider | null = null;
export const registerPoseProvider = (p: PoseProvider | null) => { provider = p; };
export const getPoseProvider = () => provider;

/** Live pose counting is on only when the flag is on and a provider exists. */
export function poseReady(flags: Record<FeatureFlag, boolean> = featureFlags): boolean {
  return isEnabled('poseRepCounter', flags) && provider !== null;
}

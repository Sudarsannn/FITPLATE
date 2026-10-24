/**
 * The dish AI is working on, kept outside any screen so it keeps running when
 * the create screen is minimised to the floating bar (or closed).
 * One job at a time; a finished or failed job stays until it is opened or dismissed.
 */
import { useSyncExternalStore } from 'react';
import { AppState, Platform } from 'react-native';

import { AiRequestError, createDishWithAi, type AiPhase, type CreateInput } from './client';

export type AiJob = {
  status: 'running' | 'done' | 'error';
  name: string;
  phase: AiPhase;
  startedAt: number;
  endedAt: number | null;
  dishId: string | null;
  error: string | null;
  /** True while the full screen is hidden and the floating bar shows instead. */
  minimised: boolean;
  notify: boolean;
};

/** Typical run, in seconds, until we have seen real ones. The estimate adapts to the phase the job is in. */
const PHASE_START = { matching: 0, researching: 6, writing: 30, saving: 50 } as const;
export const TYPICAL_SECONDS = 55;

let job: AiJob | null = null;
let abort: AbortController | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const set = (patch: Partial<AiJob>) => {
  if (!job) return;
  job = { ...job, ...patch };
  emit();
};

export const getAiJob = () => job;
export function useAiJob(): AiJob | null {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => job,
    () => job,
  );
}

/** Seconds left, a rough guess: the typical total minus time spent, nudged by the phase reached, never below 5 while running. */
export function secondsLeft(phase: AiPhase, elapsedSec: number): number {
  const expectedAtPhase = PHASE_START[phase];
  const behind = Math.max(0, elapsedSec - expectedAtPhase - 20); // this phase is taking longer than usual
  const remaining = TYPICAL_SECONDS - Math.max(elapsedSec, expectedAtPhase) + behind * 0.5;
  return Math.max(5, Math.round(remaining));
}

export const clock = (secs: number) => `${Math.floor(secs / 60)}:${String(Math.max(0, Math.round(secs)) % 60).padStart(2, '0')}`;

const isAway = () => (Platform.OS === 'web' ? typeof document !== 'undefined' && document.hidden : AppState.currentState !== 'active');

async function notifyDone(title: string, body: string) {
  if (Platform.OS === 'web') {
    try {
      if (typeof document !== 'undefined' && document.hidden && typeof Notification !== 'undefined' && Notification.permission === 'granted') new Notification(title, { body });
    } catch {
      /* optional */
    }
    return;
  }
  try {
    const N = await import('expo-notifications');
    const perm = await N.getPermissionsAsync();
    if (!perm.granted) return;
    await N.scheduleNotificationAsync({ content: { title, body }, trigger: null });
  } catch {
    /* the in-app bar still shows the result */
  }
}

/** Starts a job and returns when it ends. Throws nothing: the outcome is in the job. */
export async function startAiJob(input: CreateInput, opts: { notify?: boolean } = {}): Promise<AiJob> {
  if (job?.status === 'running') return job;
  abort = new AbortController();
  job = { status: 'running', name: input.name.trim() || 'your dish', phase: 'matching', startedAt: Date.now(), endedAt: null, dishId: null, error: null, minimised: false, notify: opts.notify !== false };
  emit();
  const mine = job;
  try {
    const r = await createDishWithAi(input, { onPhase: (phase) => (job?.startedAt === mine.startedAt ? set({ phase }) : undefined), onName: (name) => (job?.startedAt === mine.startedAt ? set({ name }) : undefined), signal: abort.signal });
    set({ status: 'done', dishId: r.dish.id, endedAt: Date.now() });
    if (job?.notify && isAway()) void notifyDone('Your dish is ready', `${r.dish.name} is ready to cook.`);
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') return job as AiJob;
    set({ status: 'error', error: e instanceof AiRequestError ? e.message : 'Something went wrong while creating the dish. Try again.', endedAt: Date.now() });
    if (job?.notify && isAway()) void notifyDone('Couldn’t create the dish', 'Open FitPlate to try again.');
  }
  return job as AiJob;
}

export function cancelAiJob() {
  abort?.abort();
  job = null;
  emit();
}

export const setMinimised = (minimised: boolean) => set({ minimised });
export const setNotify = (notify: boolean) => set({ notify });

/** Ask once for permission to notify, when the user opts in. Returns whether notifications are allowed. */
export async function askNotifyPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return typeof Notification !== 'undefined' ? (await Notification.requestPermission()) === 'granted' : false;
  try {
    const N = await import('expo-notifications');
    return (await N.requestPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

/** Clears a finished or failed job once the user has seen it. */
export function dismissAiJob() {
  if (job && job.status !== 'running') {
    job = null;
    emit();
  }
}

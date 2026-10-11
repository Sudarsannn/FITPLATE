/**
 * Lite mode (innovation idea, built Day 03b): low-end phones, costly mobile
 * data and people who turn on "Reduce motion" get a still background instead
 * of the looping background videos. Pure, so it can be tested.
 */
export type LiteSignals = {
  /** The OS "Reduce motion" accessibility setting. */
  reduceMotion: boolean;
  /** Browser "Data Saver" (navigator.connection.saveData), web only. */
  saveData?: boolean;
  /** navigator.connection.effectiveType, web only: 'slow-2g' | '2g' | '3g' | '4g'. */
  effectiveType?: string;
};

const SLOW_NETWORKS = new Set(['slow-2g', '2g']);

export function shouldUseLite(s: LiteSignals): boolean {
  return s.reduceMotion || s.saveData === true || (s.effectiveType !== undefined && SLOW_NETWORKS.has(s.effectiveType));
}

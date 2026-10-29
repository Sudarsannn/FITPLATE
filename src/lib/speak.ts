import * as Speech from 'expo-speech';

/** Read a cooking step aloud (Day 12, flag `voiceSteps`). Quiet on failure: a missing voice must never block cooking. */
export function speakStep(text: string): void {
  try {
    Speech.stop();
    if (text.trim()) Speech.speak(text, { language: 'en-IN', rate: 0.95 });
  } catch {
    // no speech engine on this device
  }
}

export function stopSpeaking(): void {
  try {
    Speech.stop();
  } catch {
    // ignore
  }
}

/** What is read for a step: its title (if different), the instruction and the timer. Pure, so Jest can test it. */
export function stepSpeech(step: { title?: string | null; text: string; timerSec?: number | null }): string {
  const parts: string[] = [];
  if (step.title && step.title !== step.text) parts.push(step.title.replace(/[.\s]+$/, '') + '.');
  parts.push(step.text);
  if (step.timerSec) {
    const m = Math.floor(step.timerSec / 60);
    const s = step.timerSec % 60;
    parts.push(`Timer: ${m ? `${m} minute${m > 1 ? 's' : ''}` : ''}${m && s ? ' ' : ''}${s ? `${s} seconds` : ''}.`);
  }
  return parts.join(' ');
}

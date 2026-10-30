import type { ExerciseData } from '../models/exercise';

/**
 * Desk-break stretch card (Day 13 innovation, flag `deskBreak`): opt-in, weekdays 10:00 to 18:00,
 * Today suggests one researched desk stretch. Off until the person turns it on in Profile.
 */
export const isDeskHours = (d: Date) => d.getDay() >= 1 && d.getDay() <= 5 && d.getHours() >= 10 && d.getHours() < 18;

/** The researched desk stretch, else any beginner yoga and stretch item. */
export function deskBreakExercise(list: readonly Pick<ExerciseData, 'id' | 'section' | 'level'>[]): Pick<ExerciseData, 'id' | 'section' | 'level'> | undefined {
  return list.find((e) => e.id === 'desk-neck-shoulder-release') ?? list.find((e) => e.section === 'yoga_stretch' && e.level === 'beginner');
}

/** Day 23: a workout routine, an ordered list of research exercises with optional days of the week. */
export type RoutineItem = {
  exerciseId: string;
  /** Length of a single timed cardio block, in minutes (the player's target). Leave out for the researched plan. */
  minutes?: number | null;
};

export type Routine = {
  name: string;
  items: RoutineItem[];
  /** Days to do it, 0 = Sunday … 6 = Saturday. Empty means no schedule. */
  days: number[];
};

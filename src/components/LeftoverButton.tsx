import { Text } from 'react-native';

import { cancelLeftoverReminder, scheduleLeftoverReminder } from '../lib/reminders';
import { useStore } from '../lib/store';
import type { Dish } from '../models/research';
import { addLeftover, addMealLeftover, fridgeDays, removeLeftover } from '../services/leftovers';
import { colors, type } from '../theme';
import { GradientButton, PressableScale } from './ui';

type Source = 'cooked' | 'logged' | 'ordered';
type DishLike = Pick<Dish, 'id' | 'name' | 'storage' | 'leftoverRemix'>;

/** Puts a dish or a logged meal away as leftovers and sets the 9:00 phone reminder for its use-by day. */
export function useLeftovers() {
  const { settings, updateSettings } = useStore();
  const list = settings.leftovers ?? [];
  return {
    has: (key: string) => list.some((l) => l.dishId === key),
    saveDish(dish: DishLike, source?: Source) {
      const next = addLeftover(list, dish, Date.now(), source);
      updateSettings({ leftovers: next });
      void scheduleLeftoverReminder(next[0]);
    },
    saveMeal(meal: { id: string; name: string }, source?: Source) {
      const next = addMealLeftover(list, meal, Date.now(), source);
      updateSettings({ leftovers: next });
      void scheduleLeftoverReminder(next[0]);
    },
    remove(key: string) {
      updateSettings({ leftovers: removeLeftover(list, key) });
      void cancelLeftoverReminder(key);
    },
  };
}

/**
 * "I have leftovers" (Day 14, widened 1 Nov 2026): after cooking, after logging a dish and after
 * ordering one. Pass `dish` for a researched dish (use-by from its storage note) or `meal` for
 * anything else (kept 1 day). Tapping it adds the Today card and the use-by-day reminder.
 */
export function LeftoverButton({ dish, meal, source }: { dish?: DishLike | null; meal?: { id: string; name: string } | null; source?: Source }) {
  const lo = useLeftovers();
  const key = dish ? dish.id : meal ? `meal:${meal.id}` : null;
  if (!key) return null;
  const days = dish ? fridgeDays(dish.storage) : 1;
  if (lo.has(key)) {
    return (
      <>
        <Text style={[type.small, { color: colors.muted, marginTop: 8 }]}>Saved as leftovers. Today shows them and your phone reminds you on the last safe day.</Text>
        <PressableScale onPress={() => lo.remove(key)} scaleTo={0.96} accessibilityLabel="Remove from leftovers" style={{ paddingVertical: 6 }}>
          <Text style={{ color: colors.muted, fontWeight: '700' }}>Not keeping it after all</Text>
        </PressableScale>
      </>
    );
  }
  return (
    <GradientButton
      title={`I have leftovers (use within ${days} day${days > 1 ? 's' : ''})`}
      variant="glass"
      onPress={() => (dish ? lo.saveDish(dish, source) : meal ? lo.saveMeal(meal, source) : undefined)}
      style={{ marginTop: 10 }}
    />
  );
}

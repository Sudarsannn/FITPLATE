import type { Dish } from '../../models/research';
import { normaliseName } from './basket';

/**
 * P3c: match a dish name from Swiggy's menu to a FitPlate recipe (dish name
 * plus this alias map). Keys are the dish slug (the id without its number),
 * so they survive renumbering. Only FitPlate's dish id is ever stored, never
 * Swiggy's menu data.
 */
export const DISH_ALIASES: Record<string, string[]> = {
  poha: ['kanda poha', 'batata poha', 'aloo poha'],
  'chicken-biryani': ['chicken dum biryani', 'hyderabadi chicken biryani', 'chicken biriyani', 'murgh biryani'],
  'paneer-butter-masala': ['paneer makhani', 'paneer makhanwala', 'butter paneer', 'paneer butter masala'],
  'masala-dosa': ['masala dosai', 'mysore masala dosa', 'dosa'],
  'dal-tadka': ['dal fry', 'yellow dal tadka', 'tadka dal', 'dal tadka'],
  upma: ['rava upma', 'sooji upma', 'uppittu'],
  'butter-chicken': ['murgh makhani', 'chicken makhani', 'chicken makhanwala', 'butter chicken'],
  'chole-chana-masala': ['chole', 'chana masala', 'chhole', 'pindi chole', 'chole masala'],
  'idli-with-sambar': ['idli sambar', 'idli', 'sambar idli', 'idly sambar'],
  'veg-fried-rice': ['vegetable fried rice', 'veg fried rice'],
  'aloo-paratha': ['aloo parantha', 'potato paratha'],
  'rajma-chawal': ['rajma rice', 'rajma chawal', 'rajma'],
  'pav-bhaji': ['pao bhaji', 'pav bhaji'],
  'egg-bhurji': ['anda bhurji', 'egg bhurji', 'scrambled egg masala'],
  'veg-hakka-noodles': ['hakka noodles', 'vegetable hakka noodles', 'veg noodles'],
  'besan-chilla': ['besan cheela', 'gram flour chilla', 'besan chilla'],
  'palak-paneer': ['saag paneer', 'palak paneer'],
  'chicken-tikka-masala': ['chicken tikka masala', 'tikka masala'],
  'jeera-rice': ['cumin rice', 'jeera rice'],
  'vada-pav': ['wada pav', 'vada pao', 'batata vada pav'],
  'masala-omelette': ['masala omelet', 'egg omelette', 'omelette'],
  'kadai-paneer': ['kadhai paneer', 'karahi paneer'],
  'mutton-rogan-josh': ['rogan josh', 'lamb rogan josh', 'mutton roganjosh'],
  'medu-vada': ['medu vada', 'medu wada', 'vada sambar', 'uddina vade'],
  'veg-pulao': ['vegetable pulao', 'veg pulav', 'pulao'],
  'moong-dal-chilla': ['moong chilla', 'moong dal cheela', 'pesarattu'],
  'dal-makhani': ['dal makhni', 'maa ki dal', 'dal makhani'],
  'chicken-65': ['chicken 65'],
  'misal-pav': ['misal pao', 'puneri misal', 'kolhapuri misal'],
  'lemon-rice': ['chitranna', 'nimbu rice', 'lemon rice'],
};

// Words menus add that say nothing about the dish.
const NOISE = new Set(['special', 'combo', 'full', 'half', 'regular', 'large', 'small', 'medium', 'with', 'and', 'served', 'restaurant', 'style', 'bowl', 'plate', 'portion', 'meal', 'the', 'of', 'classic', 'homestyle', 'home', 'desi', 'spicy', 'pcs', 'pc', 'serves', 'boneless', 'ml', 'g', 'gm']);

export const dishSlug = (id: string) => id.replace(/^\d+-/, '');

const tokens = (s: string) =>
  normaliseName(s)
    .split(' ')
    .filter((t) => t && !NOISE.has(t) && !/^\d+$/.test(t));

function similarity(a: string[], b: string[]): number {
  if (!a.length || !b.length) return 0;
  const A = new Set(a);
  const B = new Set(b);
  let both = 0;
  A.forEach((t) => B.has(t) && both++);
  return both / new Set([...A, ...B]).size;
}

export type DishMatch = { dish: Dish; score: number; how: 'name' | 'alias' | 'words' };

/**
 * The FitPlate recipe for a menu dish name, or null. An exact name or alias
 * wins; otherwise the best word overlap of at least 0.5. When the menu says
 * veg, non-veg recipes are skipped.
 */
export function matchDish(menuName: string, dishes: readonly Dish[], veg: boolean | null = null): DishMatch | null {
  const q = tokens(menuName);
  const qs = q.join(' ');
  let best: DishMatch | null = null;
  for (const dish of dishes) {
    if (veg === true && dish.dietType && dish.dietType !== 'veg') continue;
    const names = [dish.name, ...(DISH_ALIASES[dishSlug(dish.id)] ?? [])];
    for (const [i, n] of names.entries()) {
      const t = tokens(n);
      if (t.join(' ') === qs) {
        const m: DishMatch = { dish, score: 1, how: i === 0 ? 'name' : 'alias' };
        if (!best || best.score < 1 || (best.how === 'alias' && m.how === 'name')) best = m;
        continue;
      }
      const s = similarity(q, t);
      if (s >= 0.5 && (!best || s > best.score)) best = { dish, score: Math.round(s * 100) / 100, how: 'words' };
    }
  }
  return best;
}

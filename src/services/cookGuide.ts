/**
 * Helpers for the guided cooking screen: a picture for each kind of step, and
 * short "why it works" explanations for well-known techniques. The
 * explanations are general cooking science, shown only when the step's own
 * words name the technique; a dish's researched fun facts come from its data.
 */
import type { IconName } from '../components/Icon';

const ICONS: [RegExp, IconName][] = [
  [/\b(chop|slice|dice|cut|mince|grate|peel|trim|deseed)\b/i, 'cut-outline'],
  [/\b(heat|oil|ghee|fry|saut|temper|tadka|crackle|splutter|sizzle|roast|toast|sear|grill|bake|tawa)\b/i, 'flame-outline'],
  [/\b(boil|simmer|steam|pressure|whistle|soak|rinse|wash|drain|water|cook the rice)\b/i, 'water-outline'],
  [/\b(stir|mix|whisk|knead|mash|blend|grind|combine|toss|fold|beat|batter|dough)\b/i, 'sync-outline'],
  [/\b(measure|weigh|add|pour|spoon|sprinkle|season)\b/i, 'scale-outline'],
  [/\b(rest|cool|wait|set aside|marinate|ferment|chill|leave)\b/i, 'time-outline'],
  [/\b(serve|plate|garnish|squeeze|top with|enjoy|eat)\b/i, 'restaurant-outline'],
];

/** The picture for a step, from its words. */
export function stepIcon(text: string): IconName {
  return ICONS.find(([re]) => re.test(text))?.[1] ?? 'sparkles-outline';
}

const WHY: [RegExp, string][] = [
  [/\b(tadka|tempering|temper|splutter|crackle|bloom)/i, 'Many spice flavours dissolve in fat, not water. Blooming them in hot oil spreads their flavour through the whole dish.'],
  [/\b(golden|browned|brown)\b.*\b(onion)|\bonions?\b.*\b(golden|brown)/i, 'Golden-brown onions come from the Maillard reaction: sugars and amino acids react at about 140 degrees C and above, making hundreds of new flavour compounds.'],
  [/\bpressure cook|whistle/i, 'Pressure raises the boiling point of water to about 120 degrees C, which is why dal and rice cook in a fraction of the time.'],
  [/\brins(e|ing)\b.*\brice|\brice\b.*\brins/i, 'Rinsing washes off loose surface starch, so the grains stay separate instead of turning gluey.'],
  [/\bsoak/i, 'Soaking lets grains and lentils take in water before cooking, so they cook faster and more evenly.'],
  [/\bknead/i, 'Kneading lines up the gluten proteins in flour into stretchy sheets, which trap steam and make bread puff and soften.'],
  [/\b(rest|set aside)\b.*\bdough|\bdough\b.*\b(rest|set aside)/i, 'Resting lets the gluten relax, so the dough rolls out without springing back.'],
  [/\bsimmer/i, 'A simmer is just under boiling, around 90 to 95 degrees C with small lazy bubbles: hot enough to cook, gentle enough not to toughen or break the food.'],
  [/\bmarinat/i, 'Curd and lemon juice are acidic, which gently loosens the surface of meat and paneer so the flavour goes in and the texture stays soft.'],
];

/** A short "why it works" line when the step names a well-known technique, else null. */
export function whyItWorks(text: string): string | null {
  return WHY.find(([re]) => re.test(text))?.[1] ?? null;
}

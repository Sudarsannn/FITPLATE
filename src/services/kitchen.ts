/**
 * Day 10: kitchen personalisation. Reads each dish's researched equipment
 * lines and works out which of the survey's kitchen items (config/survey
 * KITCHEN) a dish really needs. A line only counts as needed when the research
 * gives no way round it: lines that offer an "or …", a stand-in, or say
 * "optional" / "no … needed" never block a dish. Alternatives shown to the
 * user are the research's own words, never made up here.
 */
import type { Dish } from '../models/research';

type Appliance = { id: string; match: RegExp; satisfiedBy: string[] };

/** Kitchen items a recipe line can call for, and which owned items cover them. */
const APPLIANCES: Appliance[] = [
  { id: 'Pressure cooker', match: /pressure cooker/i, satisfiedBy: ['Pressure cooker'] },
  { id: 'Mixer-grinder', match: /\b(mixer|blender)\b|(?<!wet )\bgrinder\b/i, satisfiedBy: ['Mixer-grinder', 'Blender'] },
  { id: 'Oven / OTG', match: /\b(oven|otg)\b/i, satisfiedBy: ['Oven / OTG'] },
  { id: 'Air fryer', match: /air[- ]?fryer/i, satisfiedBy: ['Air fryer'] },
  { id: 'Microwave', match: /microwave/i, satisfiedBy: ['Microwave'] },
  { id: 'Tawa', match: /\btawa\b|griddle/i, satisfiedBy: ['Tawa'] },
  { id: 'Kadai', match: /\b(kadai|wok)\b/i, satisfiedBy: ['Kadai'] },
];

/** Lines that are themselves the way round ("No oven, air fryer instead…", "OR a pressure cooker") or say it isn't needed. */
const SKIP = /\boptional\b|\bno\b[^.]*\bneeded\b|\bnot needed\b|^(no|or)\b|\bonly (if|when|for the shortcut)\b/i;
/** Tools that only mention an appliance ("Lid that covers the tawa", "spatula or wok ladle"). */
const ACCESSORY = /^(wide |flat |small )*(spatula|lid|ladle|half an onion)\b/i;
/** A different piece of cookware, so "cast iron or non-stick" (the same tawa) doesn't count as a way round. */
const COOKWARE = /\b(pan|pot|saucepan|handi|griddle|steamer|plate|katori|grinder)\b/i;
/** Notes where the research offers a way round: "(or a wet grinder)", "(a heavy pan also works…)", "(no wok? use …)". */
const NOTE_WAY = /\(\s*(or\s+[^)]*|[^)]*\b(also works|stand-?in|instead)\b[^)]*|no [^)?]*\?[^)]*)\)/i;

/** The item a line names, before its purpose, size or note: "Flat tawa, cast iron…" → "Flat tawa". */
const head = (line: string) => line.split(/\s*\(|,|\s+(?:for|to|that|with)\s+/i)[0];

export type EquipmentNeed = {
  line: string;
  appliance: string;
  /** True when the research gives no way round it. */
  required: boolean;
  /** The research's own alternative, when the line offers one. */
  alternative: string | null;
};

const isAppliance = (text: string) => APPLIANCES.some((a) => a.match.test(text));

/**
 * The research's way round in a line: another item offered with "or" ("Kadai
 * or heavy-bottomed pan" → "heavy-bottomed pan"), else a note that offers one
 * ("(or a wet grinder)"). Material or size words are not alternatives, ("Wok or kadai"
 * names one kitchen item twice, so it gives none).
 */
export function alternativeIn(line: string): string | null {
  const main = line.replace(/\s*\([^)]*\)/g, '');
  const options = main.split(/\s+or\s+/i).map((o) => o.trim());
  // Each option's own item is its first comma part: "griddle, cast iron" is a griddle; "Kadai, tawa" lists two.
  const items = options.slice(1).flatMap((o) => [o.split(/,\s*/)[0]]).concat(options[0].split(/,\s*/));
  const other = items.find((x) => COOKWARE.test(x) && !isAppliance(x));
  if (options.length > 1 && other) return other.replace(/\s+(for|to)\s+.*$/i, '').replace(/:.*$/, '').trim();
  const note = NOTE_WAY.exec(line)?.[1];
  return note ? note.replace(/^or\s+/i, '').split(/;/)[0].replace(/\s+also works$/i, '').trim() : null;
}

/** Every kitchen item the dish's equipment names, with whether it is truly needed. */
export function equipmentNeeds(dish: Pick<Dish, 'equipment'>): EquipmentNeed[] {
  const out: EquipmentNeed[] = [];
  for (const line of dish.equipment) {
    if (SKIP.test(line) || ACCESSORY.test(line)) continue;
    const appliances = APPLIANCES.filter((a) => a.match.test(head(line)));
    if (!appliances.length) continue;
    const alternative = alternativeIn(line);
    for (const a of appliances) out.push({ line, appliance: a.id, required: alternative == null, alternative });
  }
  return out;
}

const owns = (appliance: string, owned: readonly string[]) => (APPLIANCES.find((a) => a.id === appliance)?.satisfiedBy ?? [appliance]).some((x) => owned.includes(x));

/**
 * "Works with my kitchen": null until the person has said what they own (the
 * filter can't judge an empty kitchen), else whether every truly needed item
 * is covered.
 */
export function worksWithKitchen(dish: Pick<Dish, 'equipment'>, owned: readonly string[]): boolean | null {
  if (!owned.length) return null;
  return equipmentNeeds(dish).every((n) => !n.required || owns(n.appliance, owned));
}

/** What the person is missing for this dish, for the dish page. Empty when their kitchen isn't set. */
export function kitchenGaps(dish: Pick<Dish, 'equipment'>, owned: readonly string[]): EquipmentNeed[] {
  if (!owned.length) return [];
  const seen = new Set<string>();
  return equipmentNeeds(dish).filter((n) => {
    if (owns(n.appliance, owned) || seen.has(n.appliance)) return false;
    seen.add(n.appliance);
    return true;
  });
}

/** Day 10 beginner-tips switch: on by default for beginner cooks, off for confident ones, until the person flips it. */
export function showBeginnerTips(level: 'beginner' | 'expert', toggles: Record<string, boolean>): boolean {
  return toggles.beginnerTips ?? level === 'beginner';
}

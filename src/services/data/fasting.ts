/**
 * Fasting suitability (SPEC-ADDENDA §7) parsing and validation.
 *
 * Review 2026-10-11 FIX 2: a "Jain: With changes" line can contradict its own
 * recipe (dish 39 keeps ginger-garlic paste). The validator never rewrites a
 * reason; when a line claims a dish fits a fast but the recipe still has an
 * ingredient that fast excludes, and the reason doesn't say to skip it, the
 * status becomes null ("not checked") and the dish is flagged for review.
 */
import type { FastingLine, FastingStatus, FastingSuitability } from '../../models/research';
import { bullets, plain } from './markdown';

const EMPTY: FastingLine = { status: null, reason: null };

function statusOf(raw: string): FastingStatus {
  const s = raw.trim().toLowerCase();
  if (s.startsWith('with change')) return 'with-changes';
  if (s.startsWith('yes')) return 'yes';
  if (s.startsWith('no')) return 'no';
  return null;
}

function parseLine(value: string): FastingLine {
  // "Yes — reason", "With changes - reason", "No: reason"
  const m = /^\s*(yes|no|with changes)\b\s*(?:[—–:-]+\s*)?(.*)$/i.exec(value);
  if (!m) return { status: null, reason: value.trim() || null };
  return { status: statusOf(m[1]), reason: m[2].trim() || null };
}

/** Reads the "Fasting suitability" block from a dish's Quick facts. Null when the block is missing. */
export function parseFasting(quickFacts: string): FastingSuitability | null {
  const idx = quickFacts.search(/fasting suitability/i);
  if (idx < 0) return null;
  const block = quickFacts.slice(idx);
  const out: FastingSuitability = { navratri: EMPTY, ekadashi: EMPTY, jain: EMPTY, ramadan: EMPTY };
  let any = false;
  for (const item of bullets(block)) {
    const p = plain(item);
    const m = /^([^:]+):\s*(.*)$/.exec(p);
    if (!m) continue;
    const label = m[1].toLowerCase();
    const line = parseLine(m[2]);
    if (/navratri|vrat/.test(label)) out.navratri = line;
    else if (/ekadashi/.test(label)) out.ekadashi = line;
    else if (/jain/.test(label)) out.jain = line;
    else if (/ramadan|sehri|iftar|roza/.test(label)) out.ramadan = line;
    else continue;
    any = true;
  }
  return any ? out : null;
}

type Excluded = { term: string; match: RegExp; unless?: RegExp; skipWords: RegExp };

/** Root vegetables and bulbs Jain practice excludes. Dry ginger (sonth) and turmeric powder are fine. */
const JAIN_EXCLUDED: Excluded[] = [
  { term: 'onion', match: /\b(onions?|kanda|pyaz|spring onion|shallots?)\b/i, skipWords: /\bonions?\b/i },
  { term: 'garlic', match: /\b(garlic|lahsun|lehsun)\b/i, skipWords: /\bgarlic\b/i },
  { term: 'potato', match: /\b(potato(es)?|aloo|batata)\b/i, unless: /\bsweet potato/i, skipWords: /\bpotato(es)?\b/i },
  { term: 'carrot', match: /\b(carrots?|gajar)\b/i, skipWords: /\bcarrots?\b/i },
  { term: 'beetroot', match: /\b(beetroot|beet|chukandar)\b/i, skipWords: /\bbeet(root)?\b/i },
  { term: 'radish', match: /\b(radish|mooli|muli)\b/i, skipWords: /\bradish\b/i },
  { term: 'fresh ginger', match: /\b(ginger|adrak)\b/i, unless: /\b(dry ginger|ginger powder|sonth|saunth)\b/i, skipWords: /\bginger\b/i },
  { term: 'fresh turmeric root', match: /\b(fresh turmeric|turmeric root|kachi haldi)\b/i, skipWords: /\bturmeric\b/i },
];

/** Grains, onion and garlic: the common Navratri / Ekadashi rule set. Fasting flours (kuttu, singhara, rajgira, samak) are fine. */
const VRAT_EXCLUDED: Excluded[] = [
  {
    term: 'grain',
    match: /\b(rice|chawal|wheat|atta|maida|semolina|sooji|suji|rava|rawa|poha|besan|dal|corn|maize|oats|barley|bread|pav|noodles|vermicelli)\b/i,
    unless: /\b(samak|samvat|barnyard|kuttu|buckwheat|singhara|rajgira|amaranth|sabudana|sago|vrat)\b/i,
    skipWords: /\b(rice|grains?|wheat|flour|semolina|rava|poha|besan|dal)\b/i,
  },
  { term: 'onion', match: /\b(onions?|kanda|pyaz|spring onion|shallots?)\b/i, skipWords: /\bonions?\b/i },
  { term: 'garlic', match: /\b(garlic|lahsun|lehsun)\b/i, skipWords: /\bgarlic\b/i },
];

/** The parts of a reason that tell the cook to leave something out. */
function skipClauses(reason: string): string {
  const clauses = reason.split(/[;.—]|\bbut\b|\buse\b|\badd\b|\bwith\b/i);
  return clauses.filter((c) => /\b(skip|omit|leave out|leave off|drop|without|remove|replace|swap|no)\b/i.test(c)).join(' | ');
}

function conflicts(rules: Excluded[], ingredientNames: string[], reason: string | null, needSkip: boolean): string[] {
  const skips = needSkip && reason ? skipClauses(reason) : '';
  const hits: string[] = [];
  for (const rule of rules) {
    const present = ingredientNames.some((n) => rule.match.test(n) && !(rule.unless && rule.unless.test(n)));
    if (!present) continue;
    if (needSkip && rule.skipWords.test(skips)) continue;
    hits.push(rule.term);
  }
  return hits;
}

export type FastingCheck = { fasting: FastingSuitability | null; issues: string[] };

/**
 * Applies the FIX 2 rules. Jain "yes" / "with changes" must skip every
 * excluded ingredient the recipe still has; Navratri / Ekadashi "yes" must
 * have none of them at all (a "with changes" line already tells the cook to
 * adapt, so only its skip list is checked).
 */
export function validateFasting(fasting: FastingSuitability | null, ingredientNames: string[]): FastingCheck {
  if (!fasting) return { fasting, issues: [] };
  const out: FastingSuitability = { ...fasting };
  const issues: string[] = [];

  const jain = fasting.jain;
  if (jain.status === 'yes' || jain.status === 'with-changes') {
    const hits = conflicts(JAIN_EXCLUDED, ingredientNames, jain.reason, true);
    if (hits.length > 0) {
      out.jain = { status: null, reason: jain.reason };
      issues.push(`Jain "${jain.status}" but the recipe keeps ${hits.join(', ')} and the line doesn't say to skip ${hits.length > 1 ? 'them' : 'it'}`);
    }
  }

  for (const key of ['navratri', 'ekadashi'] as const) {
    const line = fasting[key];
    if (line.status !== 'yes' && line.status !== 'with-changes') continue;
    const hits = conflicts(VRAT_EXCLUDED, ingredientNames, line.reason, line.status === 'with-changes');
    if (hits.length > 0) {
      out[key] = { status: null, reason: line.reason };
      const name = key === 'navratri' ? 'Navratri' : 'Ekadashi';
      issues.push(`${name} "${line.status}" but the recipe has ${hits.join(', ')}${line.status === 'with-changes' ? ' with no skip' : ''}`);
    }
  }
  return { fasting: out, issues };
}

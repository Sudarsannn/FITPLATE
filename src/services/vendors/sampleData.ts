/** Deterministic made-up vendor data for sample mode. Nothing here is a real price or product. */

export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const POOLS: { match: RegExp; brands: string[]; packs: string[] }[] = [
  { match: /paneer|milk|curd|dahi|butter|ghee|cream|cheese|yogurt/, brands: ['Amul', 'Mother Dairy', 'Gowardhan'], packs: ['200 g', '500 g', '1 kg'] },
  { match: /oil/, brands: ['Fortune', 'Saffola', 'Gemini'], packs: ['500 ml', '1 l'] },
  { match: /powder|masala|seeds|cumin|jeera|turmeric|chilli powder|garam|hing|asafoetida|cardamom|clove|cinnamon|pepper/, brands: ['Everest', 'MDH', 'Catch'], packs: ['50 g', '100 g', '200 g'] },
  { match: /rice|poha|atta|flour|besan|dal|lentil|moong|rajma|chana|chole|sooji|rava|sugar|salt/, brands: ['Tata Sampann', 'Aashirvaad', 'Fortune'], packs: ['500 g', '1 kg'] },
  { match: /chicken|mutton|egg|fish/, brands: ['Licious', 'FreshToHome', 'Fresho'], packs: ['250 g', '500 g', '6 pcs'] },
];
const FRESH = { brands: ['Fresho', 'Local farm', 'Organic Tattva'], packs: ['250 g', '500 g', '1 kg'] };

export function sampleBrandsFor(query: string): { brands: string[]; packs: string[] } {
  const q = query.toLowerCase();
  return POOLS.find((p) => p.match.test(q)) ?? FRESH;
}

export const SAMPLE_ADDRESS = { id: 'sample-home', label: 'Home (sample)', line: 'Sample address, Andheri West, Mumbai' };

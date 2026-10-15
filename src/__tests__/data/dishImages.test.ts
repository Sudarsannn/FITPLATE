import { describe, expect, it } from '@jest/globals';

import {
  candidateKey,
  commonsFileName,
  creditLine,
  licenceAllowed,
  parseCandidatesJson,
  parseImageCandidatesFromFile,
  pickCandidates,
} from '../../services/data/dishImageCandidates';

const FILE = `# FitPlate daily dish research

## 61. Paneer Bhurji
Tags: Veg, breakfast

### 1. Quick facts
- Cuisine: North Indian

**Image**
- Source: Wikimedia Commons
- File: File:Paneer_bhurji_(1).jpg
- Page: https://commons.wikimedia.org/wiki/File:Paneer_bhurji_(1).jpg
- Author: Jane Doe
- Licence: CC BY-SA 4.0
- Alternates: https://commons.wikimedia.org/wiki/File:Paneer_bhurji_2.jpg; File:Bhurji plate.jpg

### 2. Ingredients

## 62. Rava Idli
**Image**
- Source: None found
- File: none

## 63. Sol Kadhi
No image block here.
`;

describe('dish image candidates', () => {
  it('parses Image blocks keyed like the importer', () => {
    const list = parseImageCandidatesFromFile(FILE, 'FitPlate_Dishes_2026-10-16.md');
    expect(list.map((c) => c.dishId)).toEqual(['061-paneer-bhurji', '062-rava-idli']);
    const [a, b] = list;
    expect(a.site).toBe('wikimedia');
    expect(a.file).toBe('Paneer bhurji (1).jpg');
    expect(a.author).toBe('Jane Doe');
    expect(a.licence).toBe('CC BY-SA 4.0');
    expect(a.alternates).toEqual(['https://commons.wikimedia.org/wiki/File:Paneer_bhurji_2.jpg', 'File:Bhurji plate.jpg']);
    expect(b.site).toBeNull();
    expect(b.file).toBeNull();
  });

  it('reads Commons file names from URLs and File: titles', () => {
    expect(commonsFileName('https://commons.wikimedia.org/wiki/File:Masala_dosa%2C_Bangalore.jpg')).toBe('Masala dosa, Bangalore.jpg');
    expect(commonsFileName('File:Poha.JPG')).toBe('Poha.JPG');
    expect(commonsFileName('not a file')).toBeNull();
  });

  it('allows only free licences that permit resizing and commercial use', () => {
    for (const ok of ['CC BY-SA 4.0', 'CC BY 2.0', 'CC0', 'Public domain', 'Unsplash License', 'Pexels License', 'Pixabay Content License']) expect(licenceAllowed(ok)).toBe(true);
    for (const no of ['CC BY-NC 2.0', 'CC BY-ND 4.0', 'CC BY-NC-SA 3.0', 'GFDL', 'All rights reserved', null, '']) expect(licenceAllowed(no)).toBe(false);
  });

  it('prefers a dish file block over the shared JSON unless the block found nothing', () => {
    const json = parseCandidatesJson(
      [
        { dishId: '061-paneer-bhurji', status: 'found', source: 'wikimedia', fileName: 'Old.jpg' },
        { dishId: '062-rava-idli', status: 'found', source: 'wikimedia', fileName: 'Rava idli.jpg' },
        { dishId: '001-poha', status: 'none' },
      ],
      'images/candidates.json',
    );
    const picked = pickCandidates(parseImageCandidatesFromFile(FILE, 'f.md'), json);
    expect(picked.get('061-paneer-bhurji')?.file).toBe('Paneer bhurji (1).jpg');
    expect(picked.get('062-rava-idli')?.file).toBe('Rava idli.jpg');
    expect(picked.get('001-poha')?.site).toBeNull();
    expect(candidateKey(picked.get('062-rava-idli')!)).toBe('wikimedia:Rava idli.jpg');
  });

  it('writes the credit line', () => {
    expect(creditLine({ author: 'Jane Doe', licence: 'CC BY-SA 4.0', site: 'wikimedia' })).toBe('Photo: Jane Doe, CC BY-SA 4.0, via Wikimedia Commons');
  });
});

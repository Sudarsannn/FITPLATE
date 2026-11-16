import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { clipCountLine, countClips, deleteAllClips } from '../services/clips';

type Entry = { name: string };
const mockState: { exists: boolean; entries: Entry[]; failDelete: boolean; deleted: number; noModule: boolean } = { exists: true, entries: [], failDelete: false, deleted: 0, noModule: false };

jest.mock('../lib/nativeCamera', () => {
  class Directory {
    get exists() { return mockState.exists; }
    list() { return mockState.entries; }
    delete() {
      if (mockState.failDelete) return;
      mockState.exists = false;
      mockState.deleted += 1;
    }
  }
  return { loadFiles: () => (mockState.noModule ? null : { Directory, Paths: { document: 'doc' } }) };
});


describe('deleteAllClips (part of Delete my data)', () => {
  beforeEach(() => {
    Object.assign(mockState, { exists: true, entries: [{ name: 'a.mp4' }, { name: 'b.mp4' }], failDelete: false, deleted: 0, noModule: false });
  });

  it('removes the clips folder and says how many were there', () => {
    expect(deleteAllClips()).toBe(2);
    expect(mockState.deleted).toBe(1);
    expect(mockState.exists).toBe(false);
  });
  it('does nothing when there is no clips folder yet', () => {
    mockState.exists = false;
    expect(deleteAllClips()).toBe(0);
    expect(mockState.deleted).toBe(0);
  });
  it('does nothing in an app built before camera mode', () => {
    mockState.noModule = true;
    expect(deleteAllClips()).toBe(0);
  });
  it('throws when the folder is still there, so the person is told', () => {
    mockState.failDelete = true;
    expect(() => deleteAllClips()).toThrow(/could not be deleted/);
  });

  it('counts clips for the Your data line, and deleting leaves none', () => {
    expect(countClips()).toBe(2);
    expect(clipCountLine(2)).toBe('Workout clips on this phone: 2 (deleted with your data)');
    deleteAllClips();
    expect(countClips()).toBe(0);
  });
  it('has no count when the file module is missing', () => {
    mockState.noModule = true;
    expect(countClips()).toBeNull();
  });
});

/**
 * The subset of AsyncStorage the storage layer uses. AsyncStorage itself fits
 * it, and tests pass an in-memory map, so nothing here needs a device.
 */
export type KeyValueStore = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  getAllKeys(): Promise<readonly string[]>;
  multiRemove(keys: readonly string[]): Promise<void>;
};

/** In-memory store for tests and for environments without AsyncStorage. */
export function memoryKeyValueStore(seed: Record<string, string> = {}): KeyValueStore & { dump(): Record<string, string> } {
  const map = new Map(Object.entries(seed));
  return {
    async getItem(k) {
      return map.has(k) ? map.get(k)! : null;
    },
    async setItem(k, v) {
      map.set(k, v);
    },
    async removeItem(k) {
      map.delete(k);
    },
    async getAllKeys() {
      return [...map.keys()];
    },
    async multiRemove(keys) {
      keys.forEach((k) => map.delete(k));
    },
    dump() {
      return Object.fromEntries(map);
    },
  };
}

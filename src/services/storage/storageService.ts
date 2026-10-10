import type { KeyValueStore } from './kv';

/** Every key this app writes starts with this, so export and reset never touch other apps' data. */
export const KEY_PREFIX = 'fitplate.';

/**
 * A typed storage key. The stored value is wrapped as `{ version, data }`;
 * when an older version is read, `migrate` upgrades it and the result is
 * written back once.
 */
export type StorageKey<T> = {
  /** Short name; the full key is `fitplate.<name>.v<version>`. */
  name: string;
  version: number;
  fallback: () => T;
  /** Upgrade data written by an older version of this key. */
  migrate?: (data: unknown, fromVersion: number) => T;
};

type Envelope = { version: number; data: unknown };

export const fullKey = (k: { name: string; version: number }) => `${KEY_PREFIX}${k.name}.v${k.version}`;

export function createStorageService(kv: KeyValueStore) {
  async function read<T>(key: StorageKey<T>): Promise<T> {
    const raw = await kv.getItem(fullKey(key));
    if (raw !== null) {
      const env = parse(raw);
      if (env && env.version === key.version) return env.data as T;
    }
    // Look for the same name under an older version and migrate it forward.
    if (key.migrate) {
      for (let v = key.version - 1; v >= 1; v--) {
        const oldRaw = await kv.getItem(fullKey({ name: key.name, version: v }));
        const env = oldRaw === null ? null : parse(oldRaw);
        if (!env) continue;
        const upgraded = key.migrate(env.data, v);
        await write(key, upgraded);
        return upgraded;
      }
    }
    return key.fallback();
  }

  async function write<T>(key: StorageKey<T>, data: T): Promise<void> {
    const env: Envelope = { version: key.version, data };
    await kv.setItem(fullKey(key), JSON.stringify(env));
  }

  async function remove(key: { name: string; version: number }): Promise<void> {
    await kv.removeItem(fullKey(key));
  }

  async function appKeys(): Promise<string[]> {
    return (await kv.getAllKeys()).filter((k) => k.startsWith(KEY_PREFIX));
  }

  /** Everything FitPlate stored on this device, parsed, for "export my data". */
  async function exportAll(): Promise<Record<string, unknown>> {
    const out: Record<string, unknown> = {};
    for (const k of await appKeys()) {
      const raw = await kv.getItem(k);
      if (raw !== null) out[k] = parse(raw) ?? raw;
    }
    return out;
  }

  /** Delete every FitPlate key on this device (or only those starting with `prefix`). */
  async function resetAll(prefix: string = KEY_PREFIX): Promise<number> {
    const keys = (await appKeys()).filter((k) => k.startsWith(prefix));
    await kv.multiRemove(keys);
    return keys.length;
  }

  return { read, write, remove, exportAll, resetAll };
}

export type StorageService = ReturnType<typeof createStorageService>;

function parse(raw: string): Envelope | null {
  try {
    const v = JSON.parse(raw);
    return v && typeof v === 'object' && typeof v.version === 'number' && 'data' in v ? (v as Envelope) : null;
  } catch {
    return null;
  }
}

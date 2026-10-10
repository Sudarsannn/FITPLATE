import type { BaseDoc, Doc, NewDoc } from '../../models/common';
import type { DocStore } from './docStore';

/** How one document type is versioned. `migrations[n]` upgrades a version-n document to n + 1. */
export type DocSchema = {
  collection: string;
  version: number;
  migrations: Record<number, (doc: Record<string, unknown>) => Record<string, unknown>>;
};

export type RepoDeps = {
  now?: () => number;
  newId?: () => string;
};

let counter = 0;
/** Unique enough for one user's documents: time + counter + randomness. */
export function makeId(now: number = Date.now()): string {
  counter = (counter + 1) % 1_000_000;
  return `${now.toString(36)}-${counter.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Upgrade a stored document to the schema's current version. Returns it unchanged when current. */
export function migrateDoc<T extends BaseDoc>(schema: DocSchema, stored: BaseDoc): T {
  let doc = stored as unknown as Record<string, unknown>;
  let v = typeof doc.schemaVersion === 'number' ? doc.schemaVersion : 1;
  while (v < schema.version) {
    const step = schema.migrations[v];
    if (!step) throw new Error(`${schema.collection}: no migration from version ${v}`);
    doc = { ...step(doc), schemaVersion: v + 1 };
    v += 1;
  }
  return doc as unknown as T;
}

/**
 * Typed access to one collection of user documents. Writes go through the
 * given DocStore (device, cloud, or both). Reads skip soft-deleted documents
 * and migrate older ones, saving the upgraded copy once.
 */
export function createRepository<T extends object>(store: DocStore, schema: DocSchema, deps: RepoDeps = {}) {
  const now = deps.now ?? Date.now;
  const newId = deps.newId ?? (() => makeId(now()));
  type D = Doc<T>;

  async function loadAll(): Promise<Record<string, D>> {
    const all = await store.getAll<BaseDoc>(schema.collection);
    const out: Record<string, D> = {};
    const upgraded: D[] = [];
    for (const [id, stored] of Object.entries(all)) {
      const doc = migrateDoc<D>(schema, stored);
      if (doc.schemaVersion !== stored.schemaVersion) upgraded.push(doc);
      out[id] = doc;
    }
    if (upgraded.length) await store.putMany(schema.collection, upgraded);
    return out;
  }

  async function create(data: NewDoc<T>): Promise<D> {
    const t = now();
    const { id, ...rest } = data as NewDoc<T> & { id?: string };
    const doc = { ...rest, id: id ?? newId(), createdAt: t, updatedAt: t, schemaVersion: schema.version, deleted: false } as unknown as D;
    await store.putMany(schema.collection, [doc]);
    return doc;
  }

  async function get(id: string): Promise<D | null> {
    const doc = (await loadAll())[id];
    return doc && !doc.deleted ? doc : null;
  }

  async function list(filter?: (doc: D) => boolean): Promise<D[]> {
    return Object.values(await loadAll())
      .filter((d) => !d.deleted && (!filter || filter(d)))
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  async function update(id: string, patch: Partial<T>): Promise<D | null> {
    const current = await get(id);
    if (!current) return null;
    const doc = { ...current, ...patch, id, updatedAt: Math.max(now(), current.updatedAt + 1) } as D;
    await store.putMany(schema.collection, [doc]);
    return doc;
  }

  /** Create the document with this id, or update it if it already exists. */
  async function upsert(id: string, data: T): Promise<D> {
    return (await update(id, data as Partial<T>)) ?? create({ ...data, id } as NewDoc<T>);
  }

  /** Soft delete: the document stays with `deleted: true` so other devices learn about it. */
  async function remove(id: string): Promise<boolean> {
    const current = await get(id);
    if (!current) return false;
    await store.putMany(schema.collection, [{ ...current, deleted: true, updatedAt: Math.max(now(), current.updatedAt + 1) }]);
    return true;
  }

  return { collection: schema.collection, create, get, list, update, upsert, remove };
}

export type Repository<T extends object> = ReturnType<typeof createRepository<T>>;

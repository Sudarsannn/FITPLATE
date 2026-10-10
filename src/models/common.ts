/**
 * Fields every stored user document carries (SPEC-ADDENDA §5). They make the
 * same record mergeable across devices: `updatedAt` decides conflicts
 * (last write wins) and `deleted` tells other devices about a deletion.
 */
export type BaseDoc = {
  id: string;
  /** Epoch ms when first written. */
  createdAt: number;
  /** Epoch ms of the last change. */
  updatedAt: number;
  /** Version of this document type; older documents are migrated when read. */
  schemaVersion: number;
  /** Soft delete. Deleted documents stay so other devices learn about it. */
  deleted: boolean;
};

/** Local calendar day, `YYYY-MM-DD`, the same format as `dayKey()` in the demo store. */
export type DateKey = string;

/** A document as written by a repository: its own fields plus the common ones. */
export type Doc<T> = T & BaseDoc;

/** Fields a caller supplies when creating a document (the repository fills the rest). */
export type NewDoc<T> = T & { id?: string };

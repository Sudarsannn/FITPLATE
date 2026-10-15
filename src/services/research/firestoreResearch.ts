import { collection, doc, getDoc, getDocs, type Firestore } from 'firebase/firestore';

import type { ResearchKind, ResearchMeta, ResearchSource } from './researchRemote';

/** The research library in Firestore (read-only for everyone, see firestore.rules). */
export function createFirestoreResearchSource(db: Firestore): ResearchSource {
  return {
    async getMeta() {
      const snap = await getDoc(doc(db, 'research', 'meta'));
      return snap.exists() ? (snap.data() as ResearchMeta) : null;
    },
    async getKind(kind: ResearchKind) {
      const snap = await getDocs(collection(db, 'research', kind, 'items'));
      return snap.docs.map((d) => d.data());
    },
    async getExtras() {
      const snap = await getDoc(doc(db, 'research', 'extras'));
      return snap.exists() ? (snap.data() as Awaited<ReturnType<ResearchSource['getExtras']>>) : null;
    },
  };
}

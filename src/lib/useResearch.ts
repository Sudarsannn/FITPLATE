import { useMemo, useSyncExternalStore } from 'react';

import { customRevision, onResearchChange, researchDishes, researchInfo } from '../data/research';

/** The research version in use; changes when a newer library arrives from the server (P2-c). */
export function useResearchVersion(): string {
  // The AI-dish revision rides along so lists recompute when a dish is created, without touching the real research version.
  const rev = useSyncExternalStore(onResearchChange, customRevision, customRevision);
  const version = useSyncExternalStore(onResearchChange, () => researchInfo().version, () => researchInfo().version);
  return `${version}#${rev}`;
}

/** The research dishes, as a new array whenever the library changes, so memoised lists recompute. */
export function useResearchDishes() {
  const version = useResearchVersion();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => [...researchDishes], [version]);
}

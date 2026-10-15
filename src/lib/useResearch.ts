import { useMemo, useSyncExternalStore } from 'react';

import { onResearchChange, researchDishes, researchInfo } from '../data/research';

/** The research version in use; changes when a newer library arrives from the server (P2-c). */
export function useResearchVersion(): string {
  return useSyncExternalStore(onResearchChange, () => researchInfo().version, () => researchInfo().version);
}

/** The research dishes, as a new array whenever the library changes, so memoised lists recompute. */
export function useResearchDishes() {
  const version = useResearchVersion();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => [...researchDishes], [version]);
}

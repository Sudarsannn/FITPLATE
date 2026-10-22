import { Redirect, useLocalSearchParams } from 'expo-router';

import { getDish } from '../data/research';

/**
 * The demo's dish, cook, shop and done pages are gone (22 Oct 2026). Old
 * links open the one research dish page when the id is a research dish,
 * else the Cook tab.
 */
export function DemoDishRedirect() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const dish = id ? getDish(id) : undefined;
  return dish ? <Redirect href={{ pathname: '/recipe/[id]', params: { id: dish.id } }} /> : <Redirect href="/cook" />;
}

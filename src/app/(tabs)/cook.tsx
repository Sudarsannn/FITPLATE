import { DishLibrary } from '../../components/dishes/DishLibrary';
import { featureFlags } from '../../config/featureFlags';
import { useResearchDishes } from '../../lib/useResearch';
import { DiscoverScreen } from './discover';

// Day 6: the Cook tab is the research dish library. With the researchData flag
// off it falls back to the demo's dish browser, as on Days 2–5.
export default function Cook() {
  const dishes = useResearchDishes();
  return featureFlags.researchData ? <DishLibrary dishes={dishes} /> : <DiscoverScreen title="Cook" />;
}

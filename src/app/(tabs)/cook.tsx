import { DishLibrary } from '../../components/dishes/DishLibrary';
import { featureFlags } from '../../config/featureFlags';
import { DiscoverScreen } from './discover';

// Day 6: the Cook tab is the research dish library. With the researchData flag
// off it falls back to the demo's dish browser, as on Days 2–5.
export default function Cook() {
  return featureFlags.researchData ? <DishLibrary /> : <DiscoverScreen title="Cook" />;
}

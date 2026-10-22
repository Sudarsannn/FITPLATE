import { DishLibrary } from '../../components/dishes/DishLibrary';
import { useResearchDishes } from '../../lib/useResearch';

// The Cook tab is the research dish library; the demo dish browser is gone (22 Oct 2026).
export default function Cook() {
  const dishes = useResearchDishes();
  return <DishLibrary dishes={dishes} />;
}

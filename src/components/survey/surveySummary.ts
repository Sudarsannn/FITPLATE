import { ACTIVITY_LABEL, ALLERGY_LABEL, BUDGET_LABEL, DIET_LABEL, EXPERIENCE_LABEL, GOAL_LABEL, WHERE_LABEL } from '../../config/survey';
import { researchConditions } from '../../data/research';
import { GOALS, type Profile } from '../../lib/store';
import type { ActivityLevel, Sex } from '../../models/user';
import type { SurveyPage } from './SurveyFlow';

type Body = { sex: Sex | 'male' | 'female' | null; age: number | null; heightCm: number | null; weightKg: number | null; activityLevel: ActivityLevel | null };

const list = (xs: (string | null | undefined | false)[]) => xs.filter(Boolean).join(' · ') || 'Not answered';

/** One line per survey page for Profile's "Your answers". */
export function surveySummary(page: SurveyPage, p: Profile, body: Body, kitchen: string[]): string {
  const s = p.survey;
  switch (page) {
    case 'name':
      return p.name || 'Not answered';
    case 'goals':
      return list([GOALS[p.goal].label, ...s.goals.map((g) => GOAL_LABEL[g])]);
    case 'health': {
      if (s.healthIssues.includes('prefer-not')) return 'Prefer not to say';
      if (s.healthIssues.includes('none') && !s.healthOther) return 'None';
      const names = s.healthIssues.map((id) => researchConditions.find((c) => c.id === id)?.name).filter(Boolean) as string[];
      return list([...names, s.healthOther.trim() || null]);
    }
    case 'body':
      return list([
        body.sex === 'female' ? 'Women' : body.sex === 'male' ? 'Men' : null,
        body.age ? `${body.age} yrs` : null,
        body.heightCm ? `${body.heightCm} cm` : null,
        body.weightKg ? `${body.weightKg} kg` : null,
        body.activityLevel ? ACTIVITY_LABEL[body.activityLevel] : null,
      ]);
    case 'diet':
      return list([DIET_LABEL[p.diet], s.allergies.length ? `No ${s.allergies.map((a) => ALLERGY_LABEL[a].toLowerCase()).join(', ')}` : null]);
    case 'food':
      return list([s.mealsPerDay ? `${s.mealsPerDay === 5 ? '5+' : s.mealsPerDay} meals a day` : null, s.cuisines.slice(0, 3).join(', ') || null, s.budgetPerMeal ? BUDGET_LABEL[s.budgetPerMeal] : null]);
    case 'kitchen':
      return list([p.level === 'beginner' ? 'Beginner cook' : 'Confident cook', kitchen.length ? `${kitchen.length} tools` : null]);
    case 'training':
      return list([
        s.trainWhere.map((w) => WHERE_LABEL[w]).join(', ') || null,
        s.experience ? EXPERIENCE_LABEL[s.experience] : null,
        s.daysPerWeek ? `${s.daysPerWeek} days a week` : null,
        s.sessionMin ? `${s.sessionMin} min` : null,
      ]);
  }
}

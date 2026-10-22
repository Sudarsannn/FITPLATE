import { SurveyFlow } from '../components/survey/SurveyFlow';

/** First run: the profile survey (SPEC-ADDENDA §8). Reminders live in their own feature, not here. */
export default function Onboarding() {
  return <SurveyFlow mode="onboarding" />;
}

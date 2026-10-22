import { useLocalSearchParams } from 'expo-router';

import { SURVEY_PAGES, SurveyFlow, type SurveyPage } from '../components/survey/SurveyFlow';

/** Edit the profile survey from Profile, opened at one page (`?page=`). */
export default function SurveyScreen() {
  const { page } = useLocalSearchParams<{ page?: string }>();
  const start = SURVEY_PAGES.includes(page as SurveyPage) ? (page as SurveyPage) : 'goals';
  return <SurveyFlow mode="edit" start={start} />;
}

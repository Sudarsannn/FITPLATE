import { ErrorScreen } from '../components/ErrorScreen';

export default function NotFound() {
  return <ErrorScreen title="That page is not here" body="The link may be old or mistyped. Your data is safe." />;
}

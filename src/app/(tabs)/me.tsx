import { ProfileScreen } from '../profile';

// The Profile tab. Its file is `me` because `/profile` is already the stack
// screen that older links open; both show the same settings.
export default function ProfileTab() {
  return <ProfileScreen asTab />;
}

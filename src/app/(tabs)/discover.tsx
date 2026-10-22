import { Redirect } from 'expo-router';

// The old demo "Discover" tab. Old links land on the Cook tab's research library.
export default function Discover() {
  return <Redirect href="/cook" />;
}

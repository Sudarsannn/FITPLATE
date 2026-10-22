import { Redirect } from 'expo-router';

// The demo grocery list became the shopping list (/basket).
export default function Grocery() {
  return <Redirect href="/basket" />;
}

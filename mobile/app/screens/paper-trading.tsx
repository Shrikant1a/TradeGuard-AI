// Paper Trading screen - redirects to Portfolio which has full paper trading functionality
import { Redirect } from 'expo-router';

export default function PaperTradingRedirect() {
  return <Redirect href="/(tabs)/portfolio" />;
}

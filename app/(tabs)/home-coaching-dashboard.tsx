import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Inbox } from 'lucide-react-native';
import { useThemeColors } from '@/context/ThemeContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { EmptyState } from '@/components/ui/EmptyState';

export default function HomeCoachingDashboard() {
  const { colors } = useThemeColors();
  const { track } = useAnalytics();
  useEffect(() => {
    track('HomeCoachingDashboard_view');
  }, [track]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: 6 }}>
          Home / Coaching Dashboard
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: 14, marginBottom: 24 }}>
          Daily home screen showing current week's task status, today's nudges, and quick access to core coaching features.
        </Text>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState icon={Inbox} title="Home / Coaching Dashboard" description="Content for this screen is on the way." />
        </View>
      </View>
    </SafeAreaView>
  );
}

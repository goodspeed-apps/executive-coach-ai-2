import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Lock, TrendingUp, CalendarRange } from 'lucide-react-native';
import { useThemeColors } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useSubscription } from '@/hooks/useSubscription';
import { usePaywall } from '@/hooks/usePaywall';
import { trackScreenLoad } from '@/lib/performance';
import { KitCard, KitPressable } from '@/components/kit';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { fetchRetrospectives } from '@/services/coach';
import { Spacing, BorderRadius } from '@/lib/theme';
import type { Retrospective } from '@/types/app';

export default function RetrospectivesScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { user } = useAuth();
  const { track } = useAnalytics();
  const { isSubscribed } = useSubscription();
  const { presentPaywall } = usePaywall();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Retrospective[]>([]);

  const load = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    const start = Date.now();
    const data = await fetchRetrospectives(user.id);
    setItems(data);
    setLoading(false);
    trackScreenLoad('retrospectives', start);
  }, [user?.id]);

  useEffect(() => {
    track('retrospectives_viewed');
    load();
  }, [load, track]);

  const handleOpen = (item: Retrospective) => {
    const gated = item.generation_index >= 2 && !isSubscribed;
    if (gated || item.is_locked) {
      track('retrospective_paywall_hit', { index: item.generation_index });
      presentPaywall();
      return;
    }
    track('retrospective_opened', { id: item.id });
    router.push({ pathname: '/retrospective-detail', params: { id: item.id } });
  };

  const renderItem = ({ item, index }: { item: Retrospective; index: number }) => {
    const locked = (item.generation_index >= 2 && !isSubscribed) || item.is_locked;
    const stats = item.completion_stats;
    return (
      <Animated.View entering={FadeInDown.delay(50 * index)}>
        <KitPressable
          onPress={() => handleOpen(item)}
          accessibilityLabel={`Retrospective for week of ${item.week_start_date}`}
          accessibilityHint="Opens the weekly retrospective"
        >
          <KitCard>
            <View style={styles.cardHeader}>
              <CalendarRange color={colors.secondary} size={18} />
              <Text style={[styles.week, { color: colors.text }]}>
                {item.week_start_date}-{item.week_end_date}
              </Text>
              {locked ? <Lock color={colors.textMuted} size={16} /> : null}
            </View>
            <Text style={[styles.summary, { color: colors.textSecondary }]} numberOfLines={2}>
              {locked
                ? 'Unlock Pro to read this retrospective generated from your behavioral history.'
                : item.summary_text ?? 'Retrospective generating from your data.'}
            </Text>
            {stats && !locked ? (
              <View style={styles.statRow}>
                <TrendingUp color={colors.success} size={14} />
                <Text style={[styles.stat, { color: colors.textSecondary }]}>
                  {stats.completed ?? 0}/{stats.total ?? 0} tasks completed
                </Text>
              </View>
            ) : null}
          </KitCard>
        </KitPressable>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>Retrospectives</Text>
          <LoadingSkeleton variant="card" />
          <LoadingSkeleton variant="card" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={['top']}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <Text style={[styles.title, { color: colors.text }]}>Retrospectives</Text>
        }
        ListEmptyComponent={
          <EmptyState
            icon="calendar"
            title="No retrospectives yet"
            description="Keep checking in. Your first weekly retrospective is generated from your behavioral history once you have a week of data."
            actionLabel="Go to Check-in"
            onAction={() => router.push('/checkin')}
          />
        }
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={load} tintColor={colors.primary} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: Spacing.xl, gap: Spacing.lg, paddingBottom: 40 },
  title: { fontFamily: 'Outfit_700Bold', fontSize: 32, marginBottom: Spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  week: { fontFamily: 'Outfit_700Bold', fontSize: 16, flex: 1 },
  summary: { fontFamily: 'Manrope_400Regular', fontSize: 16, lineHeight: 22 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.md },
  stat: { fontFamily: 'Manrope_700Bold', fontSize: 13 },
});

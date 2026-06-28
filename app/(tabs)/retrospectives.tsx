import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Lock, Calendar } from 'lucide-react-native';
import { useThemeColors } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useSubscription } from '@/hooks/useSubscription';
import { usePaywall } from '@/hooks/usePaywall';
import { supabase } from '@/lib/supabase';
import { captureException } from '@/lib/sentry';
import { trackScreenLoad } from '@/lib/performance';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { KitCard, KitPressable } from '@/components/kit';
import { Spacing } from '@/lib/theme';

const spacing = Spacing;

interface Retro {
  id: string;
  week_start_date: string;
  week_end_date: string;
  summary_text: string | null;
  next_step: string | null;
  is_locked: boolean;
  generation_index: number;
}

export default function RetrospectivesScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { user } = useAuth();
  const { track } = useAnalytics();
  const { isPro } = useSubscription();
  const { present } = usePaywall();
  const [items, setItems] = useState<Retro[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    const start = Date.now();
    try {
      if (!user?.id) return;
      setError(false);
      const { data, error: err } = await supabase
        .from('retrospectives')
        .select('id, week_start_date, week_end_date, summary_text, next_step, is_locked, generation_index')
        .eq('user_id', user.id)
        .order('week_start_date', { ascending: false });
      if (err) throw err;
      setItems(data ?? []);
      trackScreenLoad('retrospectives', start);
    } catch (e) {
      setError(true);
      captureException(e, { screen: 'retrospectives', action: 'load' });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    track('retrospectives_viewed');
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  }, [load]);

  const openRetro = (r: Retro) => {
    const gated = r.is_locked || (r.generation_index >= 2 && !isPro);
    if (gated) {
      track('retrospective_gate_hit', { index: r.generation_index });
      present('retrospective_gate');
      return;
    }
    track('retrospective_opened', { id: r.id });
    router.push({ pathname: '/retrospective/[id]', params: { id: r.id } });
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: spacing.xl }}>
        <LoadingSkeleton variant="list" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <EmptyState
          icon="alert-circle"
          title="Could not load retrospectives"
          description="Pull down to try again."
          actionLabel="Retry"
          onAction={() => { setLoading(true); load().finally(() => setLoading(false)); }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 32, color: colors.text, padding: spacing.xl, paddingBottom: spacing.lg }}>
        Weekly retrospectives
      </Text>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing['2xl'], gap: spacing.lg }}
        ListEmptyComponent={
          <EmptyState
            icon="calendar"
            title="No retrospectives yet"
            description="Keep checking in. After your first full week, I'll write a retrospective drawn from your own behavioral history."
            actionLabel="Start a check-in"
            onAction={() => router.push('/coach')}
          />
        }
        renderItem={({ item, index }) => {
          const gated = item.is_locked || (item.generation_index >= 2 && !isPro);
          return (
            <Animated.View entering={FadeInDown.delay(60 * index).springify()}>
              <KitPressable
                onPress={() => openRetro(item)}
                accessibilityLabel={`Retrospective for week of ${item.week_start_date}`}
                accessibilityHint={gated ? 'Locked. Opens upgrade.' : 'Opens the full retrospective'}
              >
                <KitCard style={{ borderColor: gated ? colors.border : colors.accent, borderWidth: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
                    {gated ? <Lock size={16} color={colors.textMuted} strokeWidth={1.5} /> : <Calendar size={16} color={colors.secondary} strokeWidth={1.5} />}
                    <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 13, color: colors.textSecondary }}>
                      {item.week_start_date}-{item.week_end_date}
                    </Text>
                  </View>
                  <Text
                    style={{ fontFamily: 'Outfit_700Bold', fontSize: 20, color: gated ? colors.textMuted : colors.text }}
                    numberOfLines={1}
                  >
                    {gated ? 'Unlock this retrospective' : item.next_step ?? 'Your weekly review'}
                  </Text>
                  {!gated && item.summary_text && (
                    <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 16, color: colors.textSecondary, marginTop: spacing.sm }} numberOfLines={2}>
                      {item.summary_text}
                    </Text>
                  )}
                </KitCard>
              </KitPressable>
            </Animated.View>
          );
        }}
      />
    </SafeAreaView>
  );
}

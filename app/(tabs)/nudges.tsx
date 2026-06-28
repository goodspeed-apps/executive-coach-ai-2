import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Clock } from 'lucide-react-native';
import { useThemeColors } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/lib/supabase';
import { captureException } from '@/lib/sentry';
import { trackScreenLoad } from '@/lib/performance';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Toast, useToast } from '@/components/ui/Toast';
import { KitCard, KitButton, KitPressable } from '@/components/kit';
import { Spacing } from '@/lib/theme';

const spacing = Spacing;

interface Nudge {
  id: string;
  drift_type: string;
  title: string;
  body_text: string;
  suggested_action: string | null;
  state: string;
}

export default function NudgesScreen() {
  const colors = useThemeColors();
  const { user } = useAuth();
  const { track } = useAnalytics();
  const { toast, showToast, hideToast } = useToast();
  const [items, setItems] = useState<Nudge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const start = Date.now();
    try {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from('nudges')
        .select('id, drift_type, title, body_text, suggested_action, state')
        .eq('user_id', user.id)
        .in('state', ['delivered', 'snoozed'])
        .order('delivered_at', { ascending: false });
      if (error) throw error;
      setItems(data ?? []);
      trackScreenLoad('nudges', start);
    } catch (e) {
      captureException(e, { screen: 'nudges', action: 'load' });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    track('nudges_viewed');
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  }, [load]);

  const act = async (n: Nudge) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    track('nudge_acted', { drift_type: n.drift_type });
    setItems((prev) => prev.filter((x) => x.id !== n.id));
    try {
      await supabase.from('nudges').update({ state: 'acted', acted_at: new Date().toISOString() }).eq('id', n.id);
      showToast('Marked as handled', 'success');
    } catch (e) {
      captureException(e, { screen: 'nudges', action: 'act' });
    }
  };

  const snooze = async (n: Nudge) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    track('nudge_snoozed', { drift_type: n.drift_type });
    setItems((prev) => prev.filter((x) => x.id !== n.id));
    try {
      const until = new Date(Date.now() + 4 * 3600 * 1000).toISOString();
      await supabase.from('nudges').update({ state: 'snoozed', snoozed_until: until }).eq('id', n.id);
    } catch (e) {
      captureException(e, { screen: 'nudges', action: 'snooze' });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: spacing.xl }}>
        <LoadingSkeleton variant="list" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 32, color: colors.text, padding: spacing.xl, paddingBottom: spacing.lg }}>
        Coach nudges
      </Text>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing['2xl'], gap: spacing.lg }}
        ListEmptyComponent={
          <EmptyState
            icon="bell"
            title="No active nudges"
            description="When I detect drift in your patterns, a timely nudge will arrive here. For now, you're on track."
          />
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(60 * index).springify()}>
            <KitCard style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.accent, borderWidth: 1 }}>
              <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 13, color: colors.primary, marginBottom: spacing.sm }}>
                {item.drift_type.toUpperCase()}
              </Text>
              <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 20, color: colors.text, marginBottom: spacing.sm }}>
                {item.title}
              </Text>
              <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 16, color: colors.textSecondary, lineHeight: 24, marginBottom: spacing.lg }}>
                {item.body_text}
              </Text>
              <KitButton label={item.suggested_action ?? 'Mark as handled'} onPress={() => act(item)} testID={`nudges-act-${index}`} />
              <KitPressable
                onPress={() => snooze(item)}
                accessibilityLabel="Snooze nudge"
                accessibilityHint="Hides this nudge for four hours"
                style={{ alignSelf: 'center', marginTop: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}
              >
                <Clock size={14} color={colors.textMuted} strokeWidth={1.5} />
                <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 13, color: colors.textMuted }}>Later</Text>
              </KitPressable>
            </KitCard>
          </Animated.View>
        )}
      />
      <Toast {...toast} onHide={hideToast} />
    </SafeAreaView>
  );
}

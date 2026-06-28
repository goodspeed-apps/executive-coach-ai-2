import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { useThemeColors } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/lib/supabase';
import { captureException } from '@/lib/sentry';
import { trackScreenLoad, trackApiLatency } from '@/lib/performance';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { RetroRow, RetroItem } from '@/components/RetroRow';

export default function WeeklyRetrospectiveScreen() {
  const colors = useThemeColors();
  const { user } = useAuth();
  const { track } = useAnalytics();
  const [rows, setRows] = useState<RetroItem[]>([]);
  const [checkins, setCheckins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }
    const start = Date.now();
    setError(false);
    try {
      const retros = await trackApiLatency('retros.list', () =>
        supabase.from('retrospectives').select('*').eq('user_id', user.id)
          .order('week_start_date', { ascending: false }));
      if (retros.error) throw retros.error;
      const ci = await supabase.from('check_ins').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
      setCheckins(ci.count ?? 0);
      setRows((retros.data ?? []) as RetroItem[]);
      trackScreenLoad('weekly_retrospective', start);
    } catch (e) {
      captureException(e as Error, { screen: 'weekly_retrospective', action: 'fetch' });
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    track('screen_view', { screen: 'weekly_retrospective' });
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, [fetchData]);

  const openRetro = (item: RetroItem) => {
    if (item.is_locked) {
      track('paywall_open', { from: 'retro_gate' });
      router.push('/(modal)/paywall');
    } else {
      track('retro_open', { id: item.id });
    }
  };

  const styles = makeStyles(colors);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}><Text style={styles.eyebrow}>Weekly Retrospective</Text>
          <Text style={styles.title}>Your week, decoded</Text></View>
        <LoadingSkeleton variant="list" count={4} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={rows}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          <Animated.View entering={FadeInDown} style={styles.header}>
            <View style={styles.brandMark}><Sparkles size={16} color={colors.textOnPrimary} /></View>
            <Text style={styles.eyebrow}>Weekly Retrospective</Text>
            <Text style={styles.title}>Your week, decoded</Text>
            <Text style={styles.range}>Synthesized from your behavioral history</Text>
          </Animated.View>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(40 * index)}>
            <RetroRow item={item} onPress={() => openRetro(item)} />
          </Animated.View>
        )}
        ListEmptyComponent={
          error ? (
            <EmptyState icon="alert-circle" title="Couldn't load your reviews"
              description="Something went wrong fetching your retrospectives."
              actionLabel="Retry" onAction={fetchData} />
          ) : (
            <EmptyState icon="calendar" title="Your first retro is building"
              description={`Retrospectives build after 7 check-ins, you're at ${checkins}.`}
              actionLabel="Go check in" onAction={() => router.push('/(tabs)')} />
          )
        }
      />
    </SafeAreaView>
  );
}

function makeStyles(c: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.background },
    list: { paddingHorizontal: 18, paddingBottom: 28 },
    header: { paddingVertical: 16 },
    brandMark: { width: 30, height: 30, borderRadius: 9, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    eyebrow: { fontFamily: 'Outfit_600SemiBold', fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase', color: c.primary },
    title: { fontFamily: 'Outfit_700Bold', fontSize: 30, color: c.text, marginTop: 6, letterSpacing: -0.5 },
    range: { fontFamily: 'Manrope_500Medium', fontSize: 13, color: c.textMuted, marginTop: 6 },
  });
}

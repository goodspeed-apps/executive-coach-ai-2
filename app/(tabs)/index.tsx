import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/lib/supabase';
import { captureException } from '@/lib/sentry';
import { trackScreenLoad } from '@/lib/performance';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { CoachSeat } from '@/components/CoachSeat';
import { MemoryDepthMeter } from '@/components/MemoryDepthMeter';
import { NoteCard } from '@/components/NoteCard';
import { StatPill } from '@/components/StatPill';
import { Spacing } from '@/lib/theme';

const spacing = Spacing;

interface HomeData {
  greeting: string;
  memoryScore: number;
  currentStreak: number;
  longestStreak: number;
  nudge: { id: string; title: string; body: string } | null;
}

export default function HomeScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { user } = useAuth();
  const { track } = useAnalytics();
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const start = Date.now();
    try {
      if (!user?.id) return;
      const [profileRes, streakRes, nudgeRes] = await Promise.all([
        supabase.from('profiles').select('display_name, memory_depth_score').eq('user_id', user.id).maybeSingle(),
        supabase.from('streaks').select('current_streak, longest_streak').eq('user_id', user.id).maybeSingle(),
        supabase.from('nudges').select('id, title, body_text').eq('user_id', user.id).eq('state', 'delivered').order('delivered_at', { ascending: false }).limit(1).maybeSingle(),
      ]);
      const name = profileRes.data?.display_name ?? 'there';
      setData({
        greeting: `Good to see you, ${name}. Last time we mapped your morning avoidance, ready to pick up there.`,
        memoryScore: profileRes.data?.memory_depth_score ?? 0,
        currentStreak: streakRes.data?.current_streak ?? 0,
        longestStreak: streakRes.data?.longest_streak ?? 0,
        nudge: nudgeRes.data ? { id: nudgeRes.data.id, title: nudgeRes.data.title, body: nudgeRes.data.body_text } : null,
      });
      trackScreenLoad('home', start);
    } catch (e) {
      captureException(e, { screen: 'home', action: 'load' });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    track('home_viewed');
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  }, [load]);

  const startSession = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    track('coach_session_started');
    router.push('/coach');
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: spacing.xl }}>
        <LoadingSkeleton variant="card" />
        <View style={{ height: spacing.lg }} />
        <LoadingSkeleton variant="card" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <FlatList
        data={data?.nudge ? [data.nudge] : []}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing['2xl'] }}
        ListHeaderComponent={
          <View style={{ gap: spacing['2xl'] }}>
            <Animated.View entering={FadeInDown.springify()}>
              <CoachSeat greeting={data?.greeting ?? ''} pulse={!!data?.nudge} />
            </Animated.View>
            <MemoryDepthMeter score={data?.memoryScore ?? 0} />
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <StatPill label="Day streak" value={`${data?.currentStreak ?? 0}`} accent />
              <StatPill label="Best streak" value={`${data?.longestStreak ?? 0}`} />
            </View>
            <NoteCard
              title="Today's next step"
              body="A two-minute check-in keeps your behavioral model sharp. The more we log, the sharper my read on your patterns."
              ctaLabel="Start check-in"
              onPress={startSession}
              testID="index-start-session"
            />
            {data?.nudge && (
              <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 24, color: colors.text, marginTop: spacing.lg }}>
                A note from your coach
              </Text>
            )}
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={{ marginTop: spacing.lg }}>
            <NoteCard
              title={item.title}
              body={item.body}
              ctaLabel="View nudges"
              onPress={() => router.push('/nudges')}
              index={index}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

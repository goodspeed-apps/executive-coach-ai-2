import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/lib/supabase';
import { captureException } from '@/lib/sentry';
import { trackScreenLoad } from '@/lib/performance';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { CoachSeat } from '@/components/CoachSeat';
import { MemoryDepthMeter } from '@/components/MemoryDepthMeter';
import { StreakBadge } from '@/components/StreakBadge';
import { NoteCard } from '@/components/NoteCard';

const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32 };

interface HomeData {
  displayName: string;
  memoryScore: number;
  streak: number;
  longest: number;
  lastCheckin: string | null;
  hasCheckedInToday: boolean;
}

export default function HomeScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { user } = useAuth();
  const { track } = useAnalytics();
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    const start = Date.now();
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      const [profileRes, streakRes, checkinRes] = await Promise.all([
        supabase.from('profiles').select('display_name, memory_depth_score').eq('user_id', user.id).maybeSingle(),
        supabase.from('streaks').select('current_streak, longest_streak, last_checkin_date').eq('user_id', user.id).maybeSingle(),
        supabase.from('check_ins').select('checkin_date').eq('user_id', user.id).order('checkin_date', { ascending: false }).limit(1),
      ]);
      const today = new Date().toISOString().slice(0, 10);
      const last = checkinRes.data?.[0]?.checkin_date ?? null;
      setData({
        displayName: profileRes.data?.display_name ?? 'there',
        memoryScore: profileRes.data?.memory_depth_score ?? 0,
        streak: streakRes.data?.current_streak ?? 0,
        longest: streakRes.data?.longest_streak ?? 0,
        lastCheckin: last,
        hasCheckedInToday: last === today,
      });
      trackScreenLoad('home', start);
    } catch (error) {
      captureException(error, { screen: 'home', action: 'fetch' });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    track('home_viewed');
    fetchData().finally(() => setLoading(false));
  }, [fetchData, track]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, [fetchData]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ padding: spacing.xl, gap: spacing.lg }}>
          <LoadingSkeleton variant="card" />
          <LoadingSkeleton variant="card" />
        </View>
      </SafeAreaView>
    );
  }

  const greeting = data?.hasCheckedInToday
    ? `Good to see you again, ${data.displayName}`
    : `Welcome back, ${data?.displayName ?? 'there'}`;
  const sub = data?.hasCheckedInToday
    ? "We've already checked in today. Let's keep the thread going."
    : 'Last time we talked about staying ahead of avoidance. Ready to check in?';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.xl, gap: spacing['2xl'] }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Animated.View entering={FadeInDown.duration(300)}>
          <CoachSeat greeting={greeting} subtext={sub} pulse />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(300)}>
          <StreakBadge current={data?.streak ?? 0} longest={data?.longest ?? 0} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(300)}>
          <MemoryDepthMeter score={data?.memoryScore ?? 0} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).duration(300)}>
          <NoteCard
            title={data?.hasCheckedInToday ? 'Open a coaching session' : 'Your next step'}
            body={
              data?.hasCheckedInToday
                ? "Talk through what's on your mind. I remember where we left off."
                : 'A two-minute check-in keeps your behavioral model current and your nudges sharp.'
            }
            ctaLabel={data?.hasCheckedInToday ? 'Start session' : 'Check in now'}
            testID="home-primary-cta"
            onPress={() => {
              track('home_cta_pressed', { checkedIn: data?.hasCheckedInToday });
              router.push(data?.hasCheckedInToday ? '/coach' : '/check-in');
            }}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

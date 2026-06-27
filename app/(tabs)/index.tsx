import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Flame } from 'lucide-react-native';
import { useThemeColors } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { trackScreenLoad } from '@/lib/performance';
import { captureException } from '@/lib/sentry';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { KitButton, KitCard } from '@/components/kit';
import { CoachSeat } from '@/components/CoachSeat';
import { MemoryDepthMeter } from '@/components/MemoryDepthMeter';
import { NoteSlideCard } from '@/components/NoteSlideCard';
import {
  fetchProfile,
  fetchStreak,
  fetchPendingNudge,
  fetchTodayCheckIn,
  actOnNudge,
} from '@/services/coach';
import type { AppProfile, Streak, Nudge, CheckIn } from '@/types/app';

export default function HomeScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { user } = useAuth();
  const { track } = useAnalytics();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [nudge, setNudge] = useState<Nudge | null>(null);
  const [todayCheckIn, setTodayCheckIn] = useState<CheckIn | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    const start = Date.now();
    setError(false);
    try {
      const [p, s, n, c] = await Promise.all([
        fetchProfile(user.id),
        fetchStreak(user.id),
        fetchPendingNudge(user.id),
        fetchTodayCheckIn(user.id),
      ]);
      setProfile(p);
      setStreak(s);
      setNudge(n);
      setTodayCheckIn(c);
      trackScreenLoad('home', start);
    } catch (e) {
      captureException(e as Error, { screen: 'home', action: 'load' });
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    track('home_viewed');
    load().finally(() => setLoading(false));
  }, [load, track]);

  const handleNudgeAction = async () => {
    if (!nudge) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await actOnNudge(nudge.id);
      track('nudge_acted', { drift: nudge.drift_type });
      setNudge(null);
    } catch (e) {
      captureException(e as Error, { screen: 'home', action: 'nudge' });
    }
  };

  const goCheckIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    track('checkin_started');
    router.push('/check-in');
  };

  const greeting = profile?.display_name
    ? `Welcome back, ${profile.display_name}. Last time we focused on ${profile.primary_goal ?? 'building momentum'}.`
    : "Welcome back. Let's pick up where we left off.";

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.container}>
          <LoadingSkeleton variant="card" />
          <LoadingSkeleton variant="card" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.container}>
          <EmptyState
            icon="alert-circle"
            title="We hit a snag"
            description="Your coaching desk could not load. Pull to retry."
          />
          <KitButton label="Retry" onPress={load} testID="home-retry" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={colors.primary} />}
      >
        <Animated.View entering={FadeInDown.duration(280)}>
          <CoachSeat greeting={greeting} pulse={!!nudge} size={72} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).duration(280)}>
          <MemoryDepthMeter score={profile?.memory_depth_score ?? 0} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(280)}>
          <KitCard style={{ borderColor: colors.border }}>
            <View style={styles.streakRow}>
              <Flame size={20} color={colors.accent} />
              <Text style={[styles.streakNum, { color: colors.text, fontFamily: 'Outfit_700Bold' }]}>
                {streak?.current_streak ?? 0}
              </Text>
              <Text style={[styles.streakLabel, { color: colors.textSecondary, fontFamily: 'Manrope_400Regular' }]}>
                day streak · best {streak?.longest_streak ?? 0}
              </Text>
            </View>
          </KitCard>
        </Animated.View>

        {nudge ? (
          <NoteSlideCard
            title={nudge.title}
            body={nudge.body_text}
            actionLabel={nudge.suggested_action ?? 'I did this'}
            onAction={handleNudgeAction}
            testID="home-nudge-action"
          />
        ) : null}

        <View style={styles.anchor}>
          {todayCheckIn ? (
            <Text style={[styles.done, { color: colors.secondary, fontFamily: 'Manrope_700Bold' }]}>
              Today's check-in is logged. See you tomorrow.
            </Text>
          ) : (
            <KitButton
              label="Start today's check-in"
              onPress={goCheckIn}
              testID="home-check-in"
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 24, gap: 16, flexGrow: 1 },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  streakNum: { fontSize: 32 },
  streakLabel: { fontSize: 16, flex: 1 },
  anchor: { marginTop: 'auto', paddingTop: 24 },
  done: { fontSize: 16, textAlign: 'center' },
});

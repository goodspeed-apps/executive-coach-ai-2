import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Flame } from 'lucide-react-native';
import { useThemeColors } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { trackScreenLoad } from '@/lib/performance';
import { KitButton, KitCard } from '@/components/kit';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { NoteCard } from '@/components/NoteCard';
import { MemoryDepthMeter } from '@/components/MemoryDepthMeter';
import { fetchCoachProfile, fetchStreak, fetchTodayCheckIn } from '@/services/coach';
import { Spacing } from '@/lib/theme';
import type { CoachProfile, Streak, CheckIn } from '@/types/app';

export default function HomeScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { user } = useAuth();
  const { track } = useAnalytics();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [todayCheckIn, setTodayCheckIn] = useState<CheckIn | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    const start = Date.now();
    const [p, s, c] = await Promise.all([
      fetchCoachProfile(user.id),
      fetchStreak(user.id),
      fetchTodayCheckIn(user.id),
    ]);
    setProfile(p);
    setStreak(s);
    setTodayCheckIn(c);
    setLoading(false);
    trackScreenLoad('home', start);
  }, [user?.id]);

  useEffect(() => {
    track('home_viewed');
    load();
  }, [load, track]);

  const greeting = profile?.display_name
    ? `Welcome back, ${profile.display_name}.`
    : 'Welcome back.';
  const body = todayCheckIn
    ? "You checked in today. Let us review what we covered."
    : profile?.goal_anchor
      ? `Last time we focused on ${profile.goal_anchor}. Ready to continue?`
      : 'I have been tracking your patterns. Let us pick up where we left off.';

  if (loading) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.content}>
          <LoadingSkeleton variant="card" />
          <LoadingSkeleton variant="card" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={load} tintColor={colors.primary} />
        }
      >
        <Animated.View entering={FadeInDown}>
          <Text style={[styles.title, { color: colors.text }]}>Your Desk</Text>
        </Animated.View>

        <NoteCard greeting={greeting} body={body} pulse delay={100}>
          <KitButton
            testID="home-checkin"
            label={todayCheckIn ? 'Open Coach Session' : 'Start Daily Check-in'}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              track('home_cta_pressed', { has_checkin: !!todayCheckIn });
              router.push(todayCheckIn ? '/coach' : '/checkin');
            }}
          />
        </NoteCard>

        <MemoryDepthMeter score={profile?.memory_depth_score ?? 0} />

        <KitCard>
          <View style={styles.streakRow}>
            <Flame color={colors.accent} size={28} />
            <View style={styles.flex}>
              <Text style={[styles.streakNum, { color: colors.text }]}>
                {streak?.current_streak ?? 0} day streak
              </Text>
              <Text style={[styles.streakSub, { color: colors.textSecondary }]}>
                Longest: {streak?.longest_streak ?? 0} days
              </Text>
            </View>
          </View>
        </KitCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: Spacing.xl, gap: Spacing.xl, paddingBottom: Spacing['2xl'] ?? 32 },
  title: { fontFamily: 'Outfit_700Bold', fontSize: 32 },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  streakNum: { fontFamily: 'Outfit_700Bold', fontSize: 20 },
  streakSub: { fontFamily: 'Manrope_400Regular', fontSize: 13, marginTop: Spacing.xs },
});

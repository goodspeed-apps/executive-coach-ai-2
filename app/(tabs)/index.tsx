import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useThemeColors } from '@/context/ThemeContext';
import { trackScreenLoad } from '@/lib/performance';
import { captureException } from '@/lib/sentry';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { NoteSlideCard } from '@/components/NoteSlideCard';
import { MemoryDepthMeter } from '@/components/MemoryDepthMeter';
import { StreakBadge } from '@/components/StreakBadge';
import { ErrorCard } from '@/components/ErrorCard';
import { fetchProfile, fetchStreak, fetchPendingNudges } from '@/services/coach';
import type { CoachProfile, Streak, Nudge } from '@/types/app';
import { Spacing } from '@/lib/theme';

const spacing = Spacing;

export default function HomeScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { user } = useAuth();
  const { track } = useAnalytics();
  const startRef = useRef(Date.now());

  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setError(false);
    try {
      const [p, s, n] = await Promise.all([
        fetchProfile(user.id),
        fetchStreak(user.id),
        fetchPendingNudges(user.id),
      ]);
      setProfile(p);
      setStreak(s);
      setNudges(n);
      trackScreenLoad('home', startRef.current);
    } catch (e) {
      captureException(e, { screen: 'home', action: 'load' });
      setError(true);
    }
  }, [user?.id]);

  useEffect(() => {
    track('home_viewed');
    load().finally(() => setLoading(false));
  }, [load, track]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  }, [load]);

  const name = profile?.display_name ?? 'there';
  const greeting = `Good to see you, ${name}`;
  const memoryBody = profile?.primary_goal
    ? `Last time we talked about ${profile.primary_goal}. Ready to keep building on it?`
    : "We're just getting started. Let's check in and build your behavioral picture.";

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <View style={{ padding: spacing.xl, gap: spacing.lg }}>
          <LoadingSkeleton width="100%" height={160} />
          <LoadingSkeleton width="100%" height={64} />
          <LoadingSkeleton width="100%" height={64} />
        </View>
      </SafeAreaView>
    );
  }

  const header = (
    <View style={{ gap: spacing.lg, paddingBottom: spacing.lg }}>
      <Text
        style={{
          fontFamily: 'Outfit_700Bold',
          fontSize: 32,
          color: colors.text,
          marginBottom: spacing.sm,
        }}
      >
        Your Desk
      </Text>
      {error ? (
        <ErrorCard onRetry={() => { setLoading(true); load().finally(() => setLoading(false)); }} />
      ) : (
        <>
          <NoteSlideCard
            greeting={greeting}
            body={memoryBody}
            ctaLabel="Start today's check-in"
            ctaTestID="index-checkin"
            onPressCta={() => router.push('/check-in')}
            index={0}
            hasNewMessage={nudges.length > 0}
          />
          {streak ? (
            <StreakBadge current={streak.current_streak ?? 0} longest={streak.longest_streak ?? 0} />
          ) : null}
          <MemoryDepthMeter score={profile?.memory_depth_score ?? 0} />
          <Text
            style={{
              fontFamily: 'Outfit_700Bold',
              fontSize: 20,
              color: colors.secondary,
              marginTop: spacing.md,
            }}
          >
            Notes from your coach
          </Text>
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <FlatList
        data={error ? [] : nudges}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.xl }}
        ListHeaderComponent={header}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        renderItem={({ item, index }) => (
          <View style={{ marginBottom: spacing.lg }}>
            <NoteSlideCard
              greeting={item.title}
              body={item.body_text}
              ctaLabel={item.suggested_action ?? 'View nudges'}
              onPressCta={() => router.push('/nudges')}
              index={index + 1}
            />
          </View>
        )}
        ListEmptyComponent={
          error ? null : (
            <Text
              style={{
                fontFamily: 'Manrope_400Regular',
                fontSize: 16,
                color: colors.textSecondary,
                textAlign: 'center',
                marginTop: spacing.lg,
              }}
            >
              No active nudges. You are on track.
            </Text>
          )
        }
      />
    </SafeAreaView>
  );
}

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useThemeColors } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/lib/supabase';
import { captureException } from '@/lib/sentry';
import { trackScreenLoad } from '@/lib/performance';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { KitButton } from '@/components/kit';
import { NoteSlideCard } from '@/components/NoteSlideCard';
import { StreakRing } from '@/components/StreakRing';
import { MemoryDepthMeter } from '@/components/MemoryDepthMeter';
import type { Profile, Streak, Retrospective } from '@/types/app';

export default function HomeScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { user } = useAuth();
  const { track } = useAnalytics();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [retro, setRetro] = useState<Retrospective | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    const start = Date.now();
    try {
      const [p, s, r] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('streaks').select('*').eq('user_id', user.id).maybeSingle(),
        supabase
          .from('retrospectives')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      if (p.error) throw p.error;
      setProfile(p.data as Profile);
      setStreak(s.data as Streak);
      setRetro(r.data as Retrospective);
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
  }, [load, track]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  }, [load]);

  const name = profile?.display_name ?? 'there';
  const greeting = `Welcome back, ${name}.`;
  const body = retro?.summary_text
    ? `Last time we covered: ${retro.summary_text.slice(0, 120)}`
    : "We're just getting started. A daily check-in is how I learn your patterns.";

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ padding: 24, gap: 16 }}>
          <LoadingSkeleton variant="card" />
          <LoadingSkeleton variant="card" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ padding: 24, gap: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <Animated.View entering={FadeInDown.duration(300)}>
          <Text style={{ fontSize: 32, fontFamily: 'Outfit_700Bold', color: colors.text }}>
            Your session
          </Text>
        </Animated.View>

        <NoteSlideCard greeting={greeting} body={body} pulse>
          <MemoryDepthMeter score={profile?.memory_depth_score ?? 0} />
        </NoteSlideCard>

        <StreakRing current={streak?.current_streak ?? 0} longest={streak?.longest_streak ?? 0} />

        <View style={{ gap: 12, marginTop: 8 }}>
          <KitButton
            testID="home-check-in"
            label="Start today's check-in"
            onPress={() => {
              track('checkin_started');
              router.push('/check-in');
            }}
          />
          <KitButton
            testID="home-coach-chat"
            label="Talk to your coach"
            variant="secondary"
            onPress={() => router.push('/coach')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

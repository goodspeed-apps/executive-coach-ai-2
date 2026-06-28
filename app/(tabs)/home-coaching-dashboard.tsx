import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Sparkles, ChevronRight } from 'lucide-react-native';
import { useThemeColors } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/lib/supabase';
import { captureException } from '@/lib/sentry';
import { trackScreenLoad, trackApiLatency } from '@/lib/performance';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { KitButton, KitCard } from '@/components/kit';
import { MomentumCard } from '@/components/MomentumCard';
import { safeText } from '@/lib/format';

interface DashState {
  greeting: string;
  weekDays: boolean[];
  todayIndex: number;
  daysOnTrack: number;
  nudge: { title: string; body: string } | null;
}

const DAY_NAMES = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function HomeCoachingDashboard() {
  const colors = useThemeColors();
  const { user } = useAuth();
  const { track } = useAnalytics();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<DashState | null>(null);

  const fetchData = useCallback(async () => {
    const start = Date.now();
    setError(false);
    try {
      const streak = await trackApiLatency('streaks_fetch', () =>
        supabase.from('streaks').select('current_streak').eq('user_id', user?.id ?? '').maybeSingle(),
      );
      const { data: nudgeRow } = await supabase
        .from('nudges').select('title, body_text').eq('user_id', user?.id ?? '')
        .eq('state', 'delivered').order('delivered_at', { ascending: false }).limit(1).maybeSingle();
      const onTrack = streak.data?.current_streak ?? 0;
      const todayIdx = (new Date().getDay() + 6) % 7;
      setData({
        greeting: 'Welcome back',
        weekDays: DAY_NAMES.map((_, i) => i < onTrack % 7),
        todayIndex: todayIdx,
        daysOnTrack: onTrack % 7,
        nudge: nudgeRow ? { title: nudgeRow.title, body: nudgeRow.body_text } : null,
      });
      trackScreenLoad('home_coaching_dashboard', start);
    } catch (e) {
      captureException(e as Error, { screen: 'home_coaching_dashboard', action: 'fetch' });
      setError(true);
    }
  }, [user?.id]);

  useEffect(() => {
    track('home_dashboard_viewed');
    fetchData().finally(() => setLoading(false));
  }, [fetchData, track]);

  const onRefresh = useCallback(() => {
    setLoading(true);
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  const startCheckIn = () => {
    track('checkin_started', { source: 'dashboard' });
    router.push('/(modal)/check-in');
  };

  const s = styles(colors);

  if (loading) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.pad}><LoadingSkeleton variant="card" /><LoadingSkeleton variant="card" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={s.pad}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <Animated.View entering={FadeInDown.duration(400)}>
          <View style={s.labelRow}>
            <Sparkles size={13} color={colors.primary} />
            <Text style={s.label}>COACH IS TRACKING</Text>
          </View>
          <Text style={s.title}>{data?.greeting}</Text>
        </Animated.View>

        {error && (
          <KitCard style={s.banner}>
            <Text style={s.bannerText}>{"Couldn't sync, pull to refresh"}</Text>
          </KitCard>
        )}

        <Animated.View entering={FadeInDown.delay(60)}>
          <MomentumCard
            weekDays={data?.weekDays ?? []}
            todayIndex={data?.todayIndex ?? 0}
            daysOnTrack={data?.daysOnTrack ?? 0}
            dayNames={DAY_NAMES}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120)}>
          <Text style={s.sectionTitle}>{"Today's wins"}</Text>
          <KitCard style={s.winsCard}>
            <Text style={s.winsText}>
              {data?.daysOnTrack ? `${safeText(data.daysOnTrack)} days on track this week, keep the momentum.` : 'Your first win is one tap away.'}
            </Text>
          </KitCard>
        </Animated.View>

        {data?.nudge && (
          <Animated.View entering={FadeInDown.delay(180)}>
            <KitCard style={s.nudgeCard}>
              <View style={s.labelRow}>
                <Sparkles size={12} color={colors.warning} />
                <Text style={[s.label, { color: colors.warning }]}>REAL-TIME NUDGE</Text>
              </View>
              <Text style={s.nudgeTitle}>{data.nudge.title}</Text>
              <Text style={s.nudgeBody}>{data.nudge.body}</Text>
            </KitCard>
          </Animated.View>
        )}

        <KitButton
          testID="home-coaching-dashboard-checkin"
          label={data?.daysOnTrack ? "Talk to your coach" : "Start today's check-in"}
          onPress={startCheckIn}
          accessibilityLabel="Start today's check-in"
          accessibilityHint="Opens the daily check-in sheet"
          style={s.cta}
        />

        <KitCard style={s.retro}>
          <View style={s.retroRow}>
            <Text style={s.retroTitle}>Weekly retrospective drops Sunday</Text>
            <ChevronRight size={18} color={colors.textFaint} />
          </View>
          <Text style={s.retroSub}>Built from your behavioral history.</Text>
        </KitCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (c: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.background },
    pad: { padding: 18, paddingBottom: 40, gap: 14 },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    label: { fontFamily: 'Sora_500Medium', fontSize: 11, letterSpacing: 0.6, color: c.primary },
    title: { fontFamily: 'Outfit_700Bold', fontSize: 27, color: c.text, marginTop: 4, letterSpacing: -0.5 },
    sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 18, color: c.text, marginBottom: 10, letterSpacing: -0.3 },
    winsCard: { padding: 18 },
    winsText: { fontFamily: 'Manrope_500Medium', fontSize: 15, color: c.text, lineHeight: 22 },
    nudgeCard: { padding: 18, borderLeftWidth: 3, borderLeftColor: c.warning },
    nudgeTitle: { fontFamily: 'Outfit_600SemiBold', fontSize: 15, color: c.text, marginTop: 8 },
    nudgeBody: { fontFamily: 'Manrope_400Regular', fontSize: 14, color: c.textMuted, lineHeight: 21, marginTop: 5 },
    cta: { marginTop: 6 },
    banner: { padding: 14, backgroundColor: c.negativeMuted },
    bannerText: { fontFamily: 'Manrope_500Medium', fontSize: 13, color: c.error },
    retro: { padding: 16, borderLeftWidth: 3, borderLeftColor: c.secondary },
    retroRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    retroTitle: { fontFamily: 'Outfit_700Bold', fontSize: 15, color: c.text, flex: 1 },
    retroSub: { fontFamily: 'Manrope_400Regular', fontSize: 12, color: c.textMuted, marginTop: 3 },
  });

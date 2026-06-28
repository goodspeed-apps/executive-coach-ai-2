import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronLeft, Check, X, Flame, AlertTriangle, Heart, Clock } from 'lucide-react-native';
import { useThemeColors } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/lib/supabase';
import { captureException } from '@/lib/sentry';
import { trackScreenLoad, trackApiLatency } from '@/lib/performance';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Toast, useToast } from '@/components/ui/Toast';
import { KitButton, KitCard } from '@/components/kit';
import { router } from 'expo-router';
import { CommitmentHistoryItem, HistoryEntry } from '@/components/CommitmentHistoryItem';

const TRIGGERS = [
  { name: 'Overwhelm', pct: 78, key: 'negative' as const },
  { name: 'Meeting overload', pct: 64, key: 'warning' as const },
  { name: 'Low sleep', pct: 51, key: 'warning' as const },
  { name: 'Decision fatigue', pct: 39, key: 'secondary' as const },
];

export default function TaskCommitmentDetailScreen() {
  const colors = useThemeColors();
  const { user } = useAuth();
  const { track } = useAnalytics();
  const { toast, showToast, hideToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [streak, setStreak] = useState({ current: 0, best: 0 });

  const fetchData = useCallback(async () => {
    const start = Date.now();
    if (!user?.id) { setLoading(false); return; }
    try {
      const sRes = await trackApiLatency('streaks', () =>
        supabase.from('streaks').select('current_streak,longest_streak').eq('user_id', user.id).maybeSingle());
      if (sRes.data) setStreak({ current: sRes.data.current_streak ?? 0, best: sRes.data.longest_streak ?? 0 });
      const cRes = await trackApiLatency('check_ins', () =>
        supabase.from('check_ins').select('id,task_status,mood,note,checkin_date').eq('user_id', user.id).order('checkin_date', { ascending: false }).limit(8));
      if (cRes.error) throw cRes.error;
      setHistory((cRes.data ?? []).map((r) => ({
        id: r.id, date: r.checkin_date, done: r.task_status === 'completed',
        note: r.note ?? 'No note recorded', mood: r.mood ?? 'neutral',
      })));
    } catch (e) {
      captureException(e, { screen: 'task-commitment-detail', action: 'fetch' });
    } finally {
      setLoading(false);
      trackScreenLoad('task-commitment-detail', start);
    }
  }, [user?.id]);

  useEffect(() => { track('task_detail_viewed'); fetchData(); }, [fetchData]);

  const logCompletion = async () => {
    track('commitment_completion_logged');
    if (user?.id) {
      try {
        await supabase.from('check_ins').insert({ user_id: user.id, task_status: 'completed', mood: 'focused', checkin_date: new Date().toISOString().slice(0, 10) });
        showToast('Completion logged', 'success');
        fetchData();
      } catch (e) { captureException(e, { screen: 'task-commitment-detail', action: 'log' }); }
    }
  };

  const styles = makeStyles(colors);
  if (loading) {
    return <SafeAreaView style={styles.safe} edges={['top']}><View style={styles.pad}><LoadingSkeleton variant="card" /><LoadingSkeleton variant="card" /></View></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Go back" accessibilityHint="Returns to the previous screen">
          <ChevronLeft size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.headerLabel}>COMMITMENT DETAIL</Text>
        <View style={{ width: 38 }} />
      </View>
      <ScrollView contentContainerStyle={styles.pad} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={fetchData} tintColor={colors.primary} />}>
        <Animated.View entering={FadeInDown}>
          <KitCard style={[styles.hero, { borderLeftColor: colors.primary }]}>
            <View style={[styles.chip, { backgroundColor: colors.primaryMuted }]}>
              <Text style={[styles.chipText, { color: colors.primary }]}>Goal · Ship Q2 Product Launch</Text>
            </View>
            <Text style={styles.heroTitle}>Deep Work Block: Roadmap Draft</Text>
            <Text style={styles.heroBody}>90 uninterrupted minutes before noon to draft the launch roadmap. Scheduled daily, phone in another room.</Text>
            <View style={styles.metaRow}>
              {[['90 min', 'Duration'], ['Daily · AM', 'Cadence'], ['Today 10:00', 'Next due']].map(([v, l]) => (
                <View key={l}><Text style={styles.metaVal}>{v}</Text><Text style={styles.metaLbl}>{l}</Text></View>
              ))}
            </View>
          </KitCard>
        </Animated.View>

        <View style={styles.statRow}>
          <KitCard style={styles.statCard}>
            <View style={styles.statTop}><Flame size={16} color={colors.primary} /><Text style={styles.statLbl}>Current streak</Text></View>
            <Text style={styles.statBig}>{streak.current}</Text>
            <Text style={styles.statSub}>days · best was {streak.best}</Text>
          </KitCard>
          <KitCard style={styles.statCard}>
            <View style={styles.statTop}><Check size={16} color={colors.positive} /><Text style={styles.statLbl}>Completion rate</Text></View>
            <Text style={styles.statBig}>68%</Text>
            <Text style={styles.statSub}>19 of 28 days</Text>
          </KitCard>
        </View>

        <Text style={styles.section}>Completion History</Text>
        {history.map((h, i) => <CommitmentHistoryItem key={h.id} entry={h} index={i} />)}

        <Text style={styles.section}>Avoidance Pattern</Text>
        <KitCard style={[styles.hero, { borderLeftColor: colors.negative }]}>
          <View style={styles.statTop}><AlertTriangle size={16} color={colors.negative} /><Text style={styles.pTitle}>{"I'm noticing a midweek slide"}</Text></View>
          <Text style={styles.heroBody}>{"You skipped 3 of the last 5 Wednesdays. Once Tuesday runs long, Wednesday's block is the first thing you trade away."}</Text>
        </KitCard>

        <Text style={styles.section}>Linked Triggers</Text>
        <KitCard style={styles.hero}>
          <View style={styles.statTop}><Heart size={16} color={colors.primary} /><Text style={styles.pTitle}>Emotions tied to misses</Text></View>
          {TRIGGERS.map((t) => (
            <View key={t.name} style={styles.trig}>
              <Text style={styles.trigName}>{t.name}</Text>
              <View style={styles.track}><View style={[styles.fill, { width: `${t.pct}%`, backgroundColor: colors[t.key] }]} /></View>
              <Text style={styles.trigPct}>{t.pct}%</Text>
            </View>
          ))}
        </KitCard>

        <View style={styles.ctaRow}>
          <KitButton testID="task-commitment-detail-log" label="Log Completion" onPress={logCompletion} style={{ flex: 1 }} />
        </View>
        <KitButton label="Reschedule" variant="outline" onPress={() => { track('commitment_reschedule_tapped'); showToast('Reschedule coming up', 'info'); }} />
      </ScrollView>
      <Toast toast={toast} onHide={hideToast} />
    </SafeAreaView>
  );
}

const makeStyles = (c: ReturnType<typeof useThemeColors>) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.background },
  pad: { padding: 18, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 10 },
  iconBtn: { width: 38, height: 38, borderRadius: 11, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.border },
  headerLabel: { fontFamily: 'Sora_500Medium', fontSize: 11, letterSpacing: 0.8, color: c.textFaint },
  hero: { padding: 20, marginBottom: 16, borderLeftWidth: 3 },
  chip: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginBottom: 12 },
  chipText: { fontFamily: 'Sora_600SemiBold', fontSize: 11 },
  heroTitle: { fontFamily: 'Outfit_700Bold', fontSize: 24, letterSpacing: -0.6, color: c.text, marginBottom: 8 },
  heroBody: { fontFamily: 'Manrope_400Regular', fontSize: 14, lineHeight: 22, color: c.textMuted, marginBottom: 14 },
  metaRow: { flexDirection: 'row', gap: 18, paddingTop: 14, borderTopWidth: 1, borderTopColor: c.border },
  metaVal: { fontFamily: 'Sora_600SemiBold', fontSize: 14, color: c.text },
  metaLbl: { fontFamily: 'Sora_500Medium', fontSize: 10, letterSpacing: 0.4, color: c.textFaint, marginTop: 2 },
  statRow: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  statCard: { flex: 1, padding: 16 },
  statTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  statLbl: { fontFamily: 'Sora_500Medium', fontSize: 11, color: c.textMuted },
  statBig: { fontFamily: 'Outfit_700Bold', fontSize: 28, letterSpacing: -1, color: c.text },
  statSub: { fontFamily: 'Manrope_400Regular', fontSize: 12, color: c.textFaint, marginTop: 4 },
  section: { fontFamily: 'Outfit_700Bold', fontSize: 17, color: c.text, marginBottom: 10, marginTop: 4 },
  pTitle: { fontFamily: 'Outfit_700Bold', fontSize: 15, color: c.text },
  trig: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 11 },
  trigName: { fontFamily: 'Sora_500Medium', fontSize: 13, color: c.text, width: 118 },
  track: { flex: 1, height: 7, borderRadius: 6, backgroundColor: c.surfaceSecondary, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 6 },
  trigPct: { fontFamily: 'Sora_600SemiBold', fontSize: 11, color: c.textMuted, width: 34, textAlign: 'right' },
  ctaRow: { flexDirection: 'row', gap: 12, marginTop: 18, marginBottom: 12 },
});

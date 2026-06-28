import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, Platform, KeyboardAvoidingView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Plus, ArrowRight, Clock, Target } from 'lucide-react-native';
import { router } from 'expo-router';
import { useThemeColors } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/lib/supabase';
import { captureException } from '@/lib/sentry';
import { trackScreenLoad, trackApiLatency } from '@/lib/performance';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Toast, useToast } from '@/components/ui/Toast';
import { KitButton, KitCard, KitSurface } from '@/components/kit';
import { CommitmentCard, Commitment } from '@/components/CommitmentCard';

type Priority = 'High' | 'Medium' | 'Low';

export default function InitialHabitsCommitmentsScreen() {
  const colors = useThemeColors();
  const { user } = useAuth();
  const { track } = useAnalytics();
  const { toast, showToast, hideToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [name, setName] = useState('');
  const [priority, setPriority] = useState<Priority>('High');
  const [items, setItems] = useState<Commitment[]>([]);

  const fetchData = useCallback(async () => {
    const start = Date.now();
    try {
      const { data, error } = await trackApiLatency('goals_fetch', () =>
        supabase.from('goals').select('id,title,focus_area,progress_score').eq('user_id', user?.id ?? '').order('created_at', { ascending: false }).limit(6),
      );
      if (error) throw error;
      setItems((data ?? []).map((g) => ({ id: g.id, title: g.title, meta: g.focus_area ?? 'Weekly commitment', priority: 'High' as Priority })));
      trackScreenLoad('initial_habits_commitments', start);
    } catch (e) {
      captureException(e, { screen: 'initial_habits_commitments', action: 'fetch' });
    }
  }, [user?.id]);

  useEffect(() => {
    track('initial_habits_commitments_view');
    fetchData().finally(() => setLoading(false));
  }, [fetchData, track]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, [fetchData]);

  const addCommitment = useCallback(() => {
    if (!name.trim()) {
      showToast('Give your commitment a name first', 'error');
      return;
    }
    track('commitment_added', { priority });
    setItems((prev) => [{ id: `${Date.now()}`, title: name.trim(), meta: 'Recurring · weekly', priority }, ...prev]);
    setName('');
  }, [name, priority, track, showToast]);

  const priorities: Priority[] = ['High', 'Medium', 'Low'];

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <Text style={[styles.step, { color: colors.textMuted }]}>SETUP · STEP 4 OF 5</Text>
          <View style={[styles.track, { backgroundColor: colors.surfaceElevated }]}>
            <View style={[styles.fill, { backgroundColor: colors.primary }]} />
          </View>
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        >
          <Animated.View entering={FadeInDown}>
            <Text style={[styles.title, { color: colors.text }]}>Initial habits & commitments</Text>
            <Text style={[styles.sub, { color: colors.textMuted }]}>Define the recurring work I"ll track each week. I tune nudges around your ADHD rhythms as we go.</Text>
          </Animated.View>

          <KitCard style={[styles.addCard, { borderLeftColor: colors.primary, borderLeftWidth: 3 }]}>
            <Text style={[styles.addLabel, { color: colors.secondary }]}>ADD A WEEKLY COMMITMENT</Text>
            <TextInput
              testID="create-commitment-name-input"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Two deep-work blocks before noon"
              placeholderTextColor={colors.textFaint}
              style={[styles.input, { backgroundColor: colors.surfaceElevated, borderColor: colors.border, color: colors.text }]}
            />
            <Text style={[styles.chipGroup, { color: colors.textFaint }]}>PRIORITY LEVEL</Text>
            <View style={styles.chipRow}>
              {priorities.map((p) => {
                const sel = p === priority;
                return (
                  <Pressable
                    key={p}
                    onPress={() => setPriority(p)}
                    accessibilityLabel={`Priority ${p}`}
                    accessibilityHint="Sets the priority for this commitment"
                    style={[styles.chip, { borderColor: sel ? colors.borderAccent : colors.border, backgroundColor: sel ? colors.primaryMuted : colors.surfaceElevated }]}
                  >
                    <Text style={[styles.chipText, { color: sel ? colors.primary : colors.textMuted }]}>{p}</Text>
                  </Pressable>
                );
              })}
            </View>
            <KitButton testID="create-commitment-add" label="Add commitment" onPress={addCommitment} icon={<Plus size={16} color={colors.textOnPrimary} />} />
          </KitCard>

          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your baseline</Text>
            <Text style={[styles.count, { color: colors.secondary, backgroundColor: colors.secondaryMuted }]}>{items.length} committed</Text>
          </View>

          {loading ? (
            <LoadingSkeleton variant="list" />
          ) : (
            items.map((c, i) => <CommitmentCard key={c.id} item={c} index={i} />)
          )}

          <KitSurface style={[styles.liveNote, { borderColor: colors.border }]}>
            <View style={[styles.dot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.noteText, { color: colors.textMuted }]}>
              <Text style={{ color: colors.text, fontFamily: 'Manrope_600SemiBold' }}>From your coach: </Text>
              A focused baseline is stronger than a crowded one. I"ll watch for overload and nudge you to defer if mornings get packed.
            </Text>
          </KitSurface>
        </ScrollView>
        <View style={styles.footer}>
          <KitButton
            testID="initial-habits-commitments-confirm"
            label="Review & confirm baseline"
            onPress={() => {
              track('baseline_confirmed', { count: items.length });
              router.push('/(tabs)/placeholder');
            }}
            icon={<ArrowRight size={18} color={colors.textOnPrimary} />}
          />
        </View>
        {toast && <Toast {...toast} onHide={hideToast} />}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 14 },
  step: { fontFamily: 'Sora_500Medium', fontSize: 11, letterSpacing: 0.8, marginBottom: 14 },
  track: { height: 4, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', width: '80%', borderRadius: 4 },
  content: { paddingHorizontal: 20, paddingBottom: 120 },
  title: { fontFamily: 'Outfit_700Bold', fontSize: 27, letterSpacing: -0.5, marginBottom: 8 },
  sub: { fontFamily: 'Manrope_400Regular', fontSize: 14, lineHeight: 21, marginBottom: 20 },
  addCard: { marginBottom: 22 },
  addLabel: { fontFamily: 'Sora_500Medium', fontSize: 12, letterSpacing: 0.5, marginBottom: 8 },
  input: { fontFamily: 'Manrope_400Regular', fontSize: 15, borderWidth: 1, borderRadius: 10, padding: 13 },
  chipGroup: { fontFamily: 'Sora_500Medium', fontSize: 10, letterSpacing: 0.8, marginTop: 12, marginBottom: 6 },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  chip: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 13, paddingVertical: 7 },
  chipText: { fontFamily: 'Sora_500Medium', fontSize: 12 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontFamily: 'Outfit_700Bold', fontSize: 18 },
  count: { fontFamily: 'Sora_500Medium', fontSize: 12, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, overflow: 'hidden' },
  liveNote: { marginTop: 18, borderRadius: 14, padding: 14, borderWidth: 1, flexDirection: 'row', gap: 11 },
  dot: { width: 9, height: 9, borderRadius: 5, marginTop: 5 },
  noteText: { flex: 1, fontFamily: 'Manrope_400Regular', fontSize: 13, lineHeight: 20 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 24 },
});

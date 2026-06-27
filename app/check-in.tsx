import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { trackScreenLoad } from '@/lib/performance';
import { captureException } from '@/lib/sentry';
import { Toast, useToast } from '@/components/ui/Toast';
import { KitButton, KitCard, KitPressable } from '@/components/kit';
import { submitCheckIn } from '@/services/coach';
import type { TaskStatus } from '@/types/app';

const MOODS = ['😔', '😐', '🙂', '😀', '🤩'];
const ENERGY = ['Drained', 'Low', 'Steady', 'High', 'Charged'];
const STATUSES: { key: TaskStatus; label: string }[] = [
  { key: 'completed', label: 'Completed my main task' },
  { key: 'partial', label: 'Made partial progress' },
  { key: 'avoided', label: 'Avoided it today' },
];

export default function CheckInScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { user } = useAuth();
  const { track } = useAnalytics();
  const { toast, showToast, hideToast } = useToast();
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [status, setStatus] = useState<TaskStatus | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    track('checkin_viewed');
    trackScreenLoad('check-in', Date.now());
  }, [track]);

  const select = (fn: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fn();
  };

  const canSubmit = mood !== null && energy !== null && status !== null;

  const handleSubmit = async () => {
    if (!user?.id || !canSubmit || saving) return;
    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await submitCheckIn(user.id, {
        mood: mood!,
        energy: energy!,
        task_status: status!,
        note: note.trim() || null,
      });
      track('checkin_completed', { status });
      showToast('Check-in logged. Your coach is listening.', 'success');
      setTimeout(() => router.back(), 600);
    } catch (e) {
      captureException(e as Error, { screen: 'check-in', action: 'submit' });
      showToast('Could not save. Try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Animated.View entering={FadeInDown.duration(280)}>
            <Text style={[styles.title, { color: colors.text, fontFamily: 'Outfit_700Bold' }]}>
              Daily check-in
            </Text>
            <Text style={[styles.sub, { color: colors.textSecondary, fontFamily: 'Manrope_400Regular' }]}>
              A quick read so your coach stays grounded in your real week.
            </Text>
          </Animated.View>

          <KitCard style={{ borderColor: colors.border }}>
            <Text style={[styles.label, { color: colors.text, fontFamily: 'Manrope_700Bold' }]}>How is your mood?</Text>
            <View style={styles.pillRow}>
              {MOODS.map((emoji, i) => (
                <KitPressable
                  key={emoji}
                  onPress={() => select(() => setMood(i))}
                  accessibilityLabel={`Mood ${i + 1}`}
                  accessibilityHint="Select your current mood"
                  style={[
                    styles.emojiPill,
                    { backgroundColor: mood === i ? colors.primaryMuted : colors.surface, borderColor: mood === i ? colors.primary : colors.border },
                  ]}
                >
                  <Text style={styles.emoji}>{emoji}</Text>
                </KitPressable>
              ))}
            </View>
          </KitCard>

          <KitCard style={{ borderColor: colors.border }}>
            <Text style={[styles.label, { color: colors.text, fontFamily: 'Manrope_700Bold' }]}>Energy level?</Text>
            <View style={styles.pillRow}>
              {ENERGY.map((label, i) => (
                <KitPressable
                  key={label}
                  onPress={() => select(() => setEnergy(i))}
                  accessibilityLabel={label}
                  accessibilityHint="Select your energy level"
                  style={[
                    styles.energyPill,
                    { backgroundColor: energy === i ? colors.secondaryMuted : colors.surface, borderColor: energy === i ? colors.secondary : colors.border },
                  ]}
                >
                  <Text style={[styles.energyText, { color: energy === i ? colors.secondary : colors.textSecondary, fontFamily: 'Manrope_400Regular' }]}>
                    {label}
                  </Text>
                </KitPressable>
              ))}
            </View>
          </KitCard>

          <KitCard style={{ borderColor: colors.border }}>
            <Text style={[styles.label, { color: colors.text, fontFamily: 'Manrope_700Bold' }]}>Your main task today?</Text>
            <View style={styles.statusCol}>
              {STATUSES.map((s) => (
                <KitPressable
                  key={s.key}
                  onPress={() => select(() => setStatus(s.key))}
                  accessibilityLabel={s.label}
                  accessibilityHint="Select task status"
                  style={[
                    styles.statusRow,
                    { backgroundColor: status === s.key ? colors.primaryMuted : colors.surface, borderColor: status === s.key ? colors.primary : colors.border },
                  ]}
                >
                  <Text style={[styles.statusText, { color: colors.text, fontFamily: 'Manrope_400Regular' }]}>
                    {s.label}
                  </Text>
                </KitPressable>
              ))}
            </View>
          </KitCard>

          <KitCard style={{ borderColor: colors.border }}>
            <Text style={[styles.label, { color: colors.text, fontFamily: 'Manrope_700Bold' }]}>Anything on your mind?</Text>
            <TextInput
              testID="check-in-note-input"
              value={note}
              onChangeText={setNote}
              placeholder="Optional note to your coach"
              placeholderTextColor={colors.textMuted}
              multiline
              style={[styles.input, { color: colors.text, borderColor: colors.border, fontFamily: 'Manrope_400Regular' }]}
            />
          </KitCard>
        </ScrollView>
        <View style={[styles.footer, { backgroundColor: colors.background }]}>
          <KitButton
            label={saving ? 'Saving…' : 'Log check-in'}
            onPress={handleSubmit}
            disabled={!canSubmit || saving}
            testID="check-in-submit"
          />
        </View>
      </KeyboardAvoidingView>
      <Toast toast={toast} onHide={hideToast} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  container: { padding: 24, gap: 16 },
  title: { fontSize: 32, marginBottom: 6 },
  sub: { fontSize: 16, lineHeight: 22 },
  label: { fontSize: 16, marginBottom: 12 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiPill: { width: 52, height: 52, borderRadius: 9999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 24 },
  energyPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 9999, borderWidth: 1 },
  energyText: { fontSize: 13 },
  statusCol: { gap: 8 },
  statusRow: { padding: 16, borderRadius: 14, borderWidth: 1 },
  statusText: { fontSize: 16 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, minHeight: 80, fontSize: 16, textAlignVertical: 'top' },
  footer: { padding: 24 },
});

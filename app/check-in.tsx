import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useThemeColors } from '@/context/ThemeContext';
import { trackScreenLoad } from '@/lib/performance';
import { captureException } from '@/lib/sentry';
import { Toast, useToast } from '@/components/ui/Toast';
import { KitButton, KitCard, KitPressable } from '@/components/kit';
import { CoachSeat } from '@/components/CoachSeat';
import { submitCheckIn } from '@/services/coach';
import { Spacing, BorderRadius } from '@/lib/theme';

const spacing = Spacing;
const radii = BorderRadius;

const MOODS = ['😞', '😕', '😐', '🙂', '😄'];
const ENERGY = ['Drained', 'Low', 'Steady', 'Good', 'Charged'];
const TASKS = ['Stalled', 'Some progress', 'On track', 'Crushed it'];

export default function CheckInScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { user } = useAuth();
  const { track } = useAnalytics();
  const { toast, showToast, hideToast } = useToast();
  const startRef = useRef(Date.now());

  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [task, setTask] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    track('checkin_viewed');
    trackScreenLoad('check_in', startRef.current);
  }, [track]);

  const select = useCallback((fn: () => void) => {
    Haptics.selectionAsync();
    fn();
  }, []);

  const canSubmit = mood !== null && energy !== null && task !== null;

  const onSubmit = useCallback(async () => {
    if (!user?.id || mood === null || energy === null || task === null) return;
    setSaving(true);
    try {
      await submitCheckIn(user.id, {
        mood,
        energy,
        task_status: task,
        note: note.trim() || null,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      track('checkin_submitted', { mood, energy, task });
      router.replace('/(tabs)');
    } catch (e) {
      captureException(e, { screen: 'check_in', action: 'submit' });
      showToast("Could not save your check-in. Try again.", 'error');
    } finally {
      setSaving(false);
    }
  }, [user?.id, mood, energy, task, note, track, router, showToast]);

  const Pill = ({
    label,
    active,
    onPress,
    testID,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
    testID?: string;
  }) => (
    <KitPressable
      onPress={onPress}
      testID={testID}
      accessibilityLabel={label}
      style={{
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: radii.full,
        borderWidth: 1,
        borderColor: active ? colors.primary : colors.border,
        backgroundColor: active ? colors.primaryMuted : colors.surface,
      }}
    >
      <Text
        style={{
          fontFamily: 'Manrope_700Bold',
          fontSize: 16,
          color: active ? colors.primary : colors.textSecondary,
        }}
      >
        {label}
      </Text>
    </KitPressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.xl }}>
          <Animated.View entering={FadeInDown.duration(300)} style={{ gap: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <CoachSeat size={52} />
              <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 24, color: colors.text }}>
                Daily check-in
              </Text>
            </View>
            <Text
              style={{
                fontFamily: 'Manrope_400Regular',
                fontSize: 16,
                color: colors.textSecondary,
              }}
            >
              A quick read on where you are today. This feeds your weekly retrospective.
            </Text>
          </Animated.View>

          <KitCard style={{ gap: spacing.lg }}>
            <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 20, color: colors.text }}>
              How is your mood?
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {MOODS.map((emoji, i) => (
                <KitPressable
                  key={i}
                  testID={`check-in-mood-${i}`}
                  onPress={() => select(() => setMood(i))}
                  accessibilityLabel={`Mood ${i + 1}`}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: radii.full,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: mood === i ? colors.primary : colors.border,
                    backgroundColor: mood === i ? colors.primaryMuted : colors.surface,
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{emoji}</Text>
                </KitPressable>
              ))}
            </View>
          </KitCard>

          <KitCard style={{ gap: spacing.lg }}>
            <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 20, color: colors.text }}>
              Energy level
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
              {ENERGY.map((label, i) => (
                <Pill
                  key={i}
                  label={label}
                  active={energy === i}
                  onPress={() => select(() => setEnergy(i))}
                />
              ))}
            </View>
          </KitCard>

          <KitCard style={{ gap: spacing.lg }}>
            <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 20, color: colors.text }}>
              Tasks today
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
              {TASKS.map((label) => (
                <Pill
                  key={label}
                  label={label}
                  active={task === label}
                  onPress={() => select(() => setTask(label))}
                />
              ))}
            </View>
          </KitCard>

          <KitCard style={{ gap: spacing.md }}>
            <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 20, color: colors.text }}>
              Anything on your mind?
            </Text>
            <TextInput
              testID="check-in-note-input"
              value={note}
              onChangeText={setNote}
              placeholder="Optional note for your coach"
              placeholderTextColor={colors.textMuted}
              multiline
              style={{
                minHeight: 80,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radii.sm,
                padding: spacing.md,
                fontFamily: 'Manrope_400Regular',
                fontSize: 16,
                color: colors.text,
                textAlignVertical: 'top',
              }}
            />
          </KitCard>

          <KitButton
            label={saving ? 'Saving…' : 'Log check-in'}
            onPress={onSubmit}
            disabled={!canSubmit || saving}
            testID="check-in-submit"
          />
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast toast={toast} onHide={hideToast} />
    </SafeAreaView>
  );
}

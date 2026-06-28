import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useThemeColors } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/lib/supabase';
import { captureException } from '@/lib/sentry';
import { Toast, useToast } from '@/components/ui/Toast';
import { KitButton, KitCard, KitPressable } from '@/components/kit';

const MOODS = ['😞', '😕', '😐', '🙂', '😄'];
const ENERGY = ['Drained', 'Low', 'Steady', 'Good', 'Charged'];
const TASKS = [
  { key: 'on_track', label: 'On track' },
  { key: 'behind', label: 'Behind' },
  { key: 'stuck', label: 'Stuck / avoiding' },
];

export default function CheckInScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { user } = useAuth();
  const { track } = useAnalytics();
  const { toast, showToast, hideToast } = useToast();
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [task, setTask] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const select = useCallback((fn: () => void) => {
    Haptics.selectionAsync();
    fn();
  }, []);

  const submit = useCallback(async () => {
    if (!user?.id || mood === null) return;
    setSaving(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const { error } = await supabase.from('check_ins').insert({
        user_id: user.id,
        mood,
        energy,
        task_status: task,
        note: note.trim() || null,
        checkin_date: today,
      });
      if (error) throw error;
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      track('checkin_logged', { mood, energy, task });
      showToast('Check-in logged', 'success');
      setTimeout(() => router.back(), 600);
    } catch (e) {
      captureException(e, { screen: 'check-in', action: 'submit' });
      showToast('Could not save check-in', 'error');
    } finally {
      setSaving(false);
    }
  }, [user?.id, mood, energy, task, note, track, router, showToast]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24, gap: 24 }}>
          <Animated.Text
            entering={FadeInDown.duration(300)}
            style={{ fontSize: 32, fontFamily: 'Outfit_700Bold', color: colors.text }}
          >
            How are you, really?
          </Animated.Text>

          <KitCard>
            <Text style={{ fontSize: 16, fontFamily: 'Manrope_700Bold', color: colors.text, marginBottom: 12 }}>
              Mood
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {MOODS.map((m, i) => (
                <KitPressable
                  key={i}
                  testID={`check-in-mood-${i}`}
                  accessibilityLabel={`Mood ${i + 1}`}
                  onPress={() => select(() => setMood(i))}
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 9999,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: mood === i ? colors.accent : colors.surface,
                    borderWidth: 1,
                    borderColor: mood === i ? colors.accent : colors.border,
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{m}</Text>
                </KitPressable>
              ))}
            </View>
          </KitCard>

          <KitCard>
            <Text style={{ fontSize: 16, fontFamily: 'Manrope_700Bold', color: colors.text, marginBottom: 12 }}>
              Energy
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {ENERGY.map((label, i) => (
                <KitPressable
                  key={i}
                  accessibilityLabel={label}
                  onPress={() => select(() => setEnergy(i))}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 9999,
                    backgroundColor: energy === i ? colors.secondary : colors.surface,
                    borderWidth: 1,
                    borderColor: energy === i ? colors.secondary : colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontFamily: 'Manrope_700Bold',
                      color: energy === i ? colors.textOnPrimary : colors.textSecondary,
                    }}
                  >
                    {label}
                  </Text>
                </KitPressable>
              ))}
            </View>
          </KitCard>

          <KitCard>
            <Text style={{ fontSize: 16, fontFamily: 'Manrope_700Bold', color: colors.text, marginBottom: 12 }}>
              Where are your tasks?
            </Text>
            <View style={{ gap: 8 }}>
              {TASKS.map((t) => (
                <KitPressable
                  key={t.key}
                  accessibilityLabel={t.label}
                  onPress={() => select(() => setTask(t.key))}
                  style={{
                    padding: 16,
                    borderRadius: 14,
                    backgroundColor: task === t.key ? colors.primaryMuted ?? colors.surface : colors.surface,
                    borderWidth: 1,
                    borderColor: task === t.key ? colors.primary : colors.border,
                  }}
                >
                  <Text style={{ fontSize: 16, fontFamily: 'Manrope_400Regular', color: colors.text }}>
                    {t.label}
                  </Text>
                </KitPressable>
              ))}
            </View>
          </KitCard>

          <View>
            <Text style={{ fontSize: 16, fontFamily: 'Manrope_700Bold', color: colors.text, marginBottom: 8 }}>
              Anything on your mind?
            </Text>
            <TextInput
              testID="check-in-note-input"
              value={note}
              onChangeText={setNote}
              placeholder="Optional note for your coach…"
              placeholderTextColor={colors.textMuted}
              multiline
              style={{
                minHeight: 88,
                padding: 16,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                color: colors.text,
                fontFamily: 'Manrope_400Regular',
                fontSize: 16,
                textAlignVertical: 'top',
              }}
            />
          </View>

          <KitButton
            testID="check-in-submit"
            label={saving ? 'Saving…' : 'Log check-in'}
            disabled={mood === null || saving}
            onPress={submit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast toast={toast} onHide={hideToast} />
    </SafeAreaView>
  );
}

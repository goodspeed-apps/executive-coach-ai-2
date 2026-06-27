import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/lib/supabase';
import { captureException } from '@/lib/sentry';
import { Toast, useToast } from '@/components/ui/Toast';
import { KitButton, KitSurface } from '@/components/kit';
import { MoodPill } from '@/components/MoodPill';

const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32 };
const radii = { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 };

const MOODS = ['😣', '😕', '😐', '🙂', '😄'];
const ENERGY = ['Drained', 'Low', 'Steady', 'Good', 'Charged'];
const TASKS = ['Stalled', 'Mixed', 'On track'];

export default function CheckInScreen() {
  const colors = useThemeColors();
  const router = useRouter();
  const { user } = useAuth();
  const { track } = useAnalytics();
  const { toast, showToast, hideToast } = useToast();
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [task, setTask] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    track('checkin_viewed');
  }, [track]);

  const select = (setter: (n: number) => void, val: number) => {
    Haptics.selectionAsync();
    setter(val);
  };

  const submit = async () => {
    if (mood === null || energy === null || task === null) {
      showToast('Please complete mood, energy, and task status.', 'error');
      return;
    }
    if (!user?.id) return;
    setSaving(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const { error } = await supabase.from('check_ins').insert({
        user_id: user.id,
        mood: MOODS[mood],
        energy: ENERGY[energy],
        task_status: TASKS[task],
        note: note.trim() || null,
        checkin_date: today,
      });
      if (error) throw error;
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      track('checkin_completed', { mood, energy, task });
      router.replace('/coach');
    } catch (error) {
      captureException(error, { screen: 'check-in', action: 'submit' });
      showToast('Could not save your check-in. Try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: 'Check In', headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing['2xl'] }}>
          <Animated.View entering={FadeInDown.duration(300)}>
            <Text style={{ color: colors.text, fontFamily: 'Outfit_700Bold', fontSize: 32 }}>
              How are you, really?
            </Text>
            <Text style={{ color: colors.textSecondary, fontFamily: 'Manrope_400Regular', fontSize: 16, marginTop: spacing.sm }}>
              A quick read so I can coach you with context.
            </Text>
          </Animated.View>

          <View style={{ gap: spacing.md }}>
            <Text style={{ color: colors.text, fontFamily: 'Outfit_700Bold', fontSize: 20 }}>Mood</Text>
            <View style={{ flexDirection: 'row', gap: spacing.md, justifyContent: 'space-between' }}>
              {MOODS.map((m, i) => (
                <MoodPill key={m} label={m} selected={mood === i} onPress={() => select(setMood, i)} large />
              ))}
            </View>
          </View>

          <View style={{ gap: spacing.md }}>
            <Text style={{ color: colors.text, fontFamily: 'Outfit_700Bold', fontSize: 20 }}>Energy</Text>
            <View style={{ flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' }}>
              {ENERGY.map((e, i) => (
                <MoodPill key={e} label={e} selected={energy === i} onPress={() => select(setEnergy, i)} />
              ))}
            </View>
          </View>

          <View style={{ gap: spacing.md }}>
            <Text style={{ color: colors.text, fontFamily: 'Outfit_700Bold', fontSize: 20 }}>Tasks today</Text>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              {TASKS.map((t, i) => (
                <MoodPill key={t} label={t} selected={task === i} onPress={() => select(setTask, i)} />
              ))}
            </View>
          </View>

          <KitSurface style={{ backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md }}>
            <TextInput
              testID="check-in-note-input"
              value={note}
              onChangeText={setNote}
              placeholder="Anything on your mind? (optional)"
              placeholderTextColor={colors.textMuted}
              multiline
              style={{ color: colors.text, fontFamily: 'Manrope_400Regular', fontSize: 16, minHeight: 80 }}
            />
          </KitSurface>

          <KitButton label="Log check-in" onPress={submit} loading={saving} testID="check-in-submit" />
        </ScrollView>
      </KeyboardAvoidingView>
      <Toast {...toast} onHide={hideToast} />
    </SafeAreaView>
  );
}

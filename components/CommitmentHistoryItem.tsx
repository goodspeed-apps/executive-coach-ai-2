import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Check, X } from 'lucide-react-native';
import { useThemeColors } from '@/context/ThemeContext';
import { KitCard } from '@/components/kit';

export interface HistoryEntry {
  id: string;
  date: string;
  done: boolean;
  note: string;
  mood: string;
}

export function CommitmentHistoryItem({ entry, index }: { entry: HistoryEntry; index: number }) {
  const c = useThemeColors();
  const dotBg = entry.done ? c.positiveMuted : c.negativeMuted;
  const dotColor = entry.done ? c.positive : c.negative;
  const dateLabel = (() => {
    try { return new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }); }
    catch { return entry.date; }
  })();

  return (
    <Animated.View entering={FadeInDown.delay(50 * index)}>
      <KitCard style={styles.row}>
        <View style={[styles.dot, { backgroundColor: dotBg }]}>
          {entry.done ? <Check size={18} color={dotColor} /> : <X size={18} color={dotColor} />}
        </View>
        <View style={styles.body}>
          <Text style={[styles.date, { color: c.text }]}>{dateLabel}</Text>
          <Text style={[styles.ctx, { color: c.textMuted }]} numberOfLines={2}>{entry.note}</Text>
          <View style={[styles.tag, { backgroundColor: c.primaryMuted }]}>
            <Text style={[styles.tagText, { color: c.primary }]}>{entry.mood}</Text>
          </View>
        </View>
      </KitCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 13, marginBottom: 10 },
  dot: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1 },
  date: { fontFamily: 'Sora_600SemiBold', fontSize: 14 },
  ctx: { fontFamily: 'Manrope_400Regular', fontSize: 12.5, marginTop: 2 },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginTop: 6 },
  tagText: { fontFamily: 'Sora_500Medium', fontSize: 10, textTransform: 'capitalize' },
});

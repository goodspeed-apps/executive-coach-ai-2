import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Calendar, Clock } from 'lucide-react-native';
import { useThemeColors } from '@/context/ThemeContext';
import { KitCard } from '@/components/kit';

export type Commitment = {
  id: string;
  title: string;
  meta: string;
  priority: 'High' | 'Medium' | 'Low';
};

export function CommitmentCard({ item, index }: { item: Commitment; index: number }) {
  const colors = useThemeColors();
  const priColor =
    item.priority === 'High' ? colors.primary : item.priority === 'Medium' ? colors.tertiary : colors.secondary;
  const priBg =
    item.priority === 'High' ? colors.primaryMuted : item.priority === 'Medium' ? colors.warningMuted : colors.secondaryMuted;

  return (
    <Animated.View entering={FadeInDown.delay(50 * index)} style={styles.wrap}>
      <KitCard style={styles.card}>
        <View style={[styles.icon, { backgroundColor: priBg }]}>
          <Calendar size={20} color={priColor} />
        </View>
        <View style={styles.body}>
          <View style={styles.top}>
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
            <Text style={[styles.pri, { color: priColor, backgroundColor: priBg }]}>{item.priority}</Text>
          </View>
          <Text style={[styles.meta, { color: colors.textMuted }]}>{item.meta}</Text>
          <View style={styles.freq}>
            <Clock size={12} color={colors.textFaint} />
            <Text style={[styles.freqText, { color: colors.textFaint }]}>Weekly · recurring</Text>
          </View>
        </View>
      </KitCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  card: { flexDirection: 'row', gap: 13, alignItems: 'flex-start' },
  icon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, minWidth: 0 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  name: { flex: 1, fontFamily: 'Outfit_600SemiBold', fontSize: 15 },
  pri: { fontFamily: 'Sora_600SemiBold', fontSize: 10, letterSpacing: 0.5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, overflow: 'hidden' },
  meta: { fontFamily: 'Sora_400Regular', fontSize: 12, marginTop: 4 },
  freq: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 7 },
  freqText: { fontFamily: 'Sora_400Regular', fontSize: 11 },
});

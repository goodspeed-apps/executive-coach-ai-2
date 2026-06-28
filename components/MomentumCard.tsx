import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '@/context/ThemeContext';
import { KitCard } from '@/components/kit';

interface Props {
  weekDays: boolean[];
  todayIndex: number;
  daysOnTrack: number;
  dayNames: string[];
}

export function MomentumCard({ weekDays, todayIndex, daysOnTrack, dayNames }: Props) {
  const c = useThemeColors();
  const s = styles(c);
  return (
    <KitCard style={s.card}>
      <View style={s.top}>
        <Text style={s.label}>{"THIS WEEK'S MOMENTUM"}</Text>
        <Text style={s.pct}>{daysOnTrack} of 7 days on track</Text>
      </View>
      <View style={s.days}>
        {dayNames.map((name, i) => {
          const isToday = i === todayIndex;
          const done = weekDays[i];
          const dotColor = isToday ? c.primary : done ? c.secondary : c.divider;
          return (
            <View key={`${name}-${i}`} style={s.day}>
              <View style={[s.dot, { backgroundColor: dotColor }]} />
              <Text style={[s.dayName, isToday && { color: c.primary }]}>{name}</Text>
            </View>
          );
        })}
      </View>
    </KitCard>
  );
}

const styles = (c: ReturnType<typeof useThemeColors>) =>
  StyleSheet.create({
    card: { padding: 18 },
    top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    label: { fontFamily: 'Sora_500Medium', fontSize: 11, letterSpacing: 0.6, color: c.textMuted },
    pct: { fontFamily: 'Sora_600SemiBold', fontSize: 13, color: c.secondary },
    days: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
    day: { flex: 1, alignItems: 'center', gap: 7 },
    dot: { width: '100%', height: 5, borderRadius: 4 },
    dayName: { fontFamily: 'Sora_500Medium', fontSize: 10, color: c.textFaint },
  });

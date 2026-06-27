import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Layers } from 'lucide-react-native';
import { useThemeColors } from '@/context/ThemeContext';
import { Spacing, BorderRadius } from '@/lib/theme';

interface Props {
  score: number;
}

export function MemoryDepthMeter({ score }: Props) {
  const colors = useThemeColors();
  const pct = Math.min(score / 100, 1);
  const fill = useSharedValue(0);

  useEffect(() => {
    fill.value = withTiming(pct, { duration: 600 });
  }, [pct, fill]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));

  return (
    <View style={[styles.wrap, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Layers color={colors.accent} size={16} />
        <Text style={[styles.label, { color: colors.textSecondary }]}>Memory Depth</Text>
        <Text style={[styles.score, { color: colors.text }]}>{score}</Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <Animated.View style={[styles.fill, { backgroundColor: colors.accent }, fillStyle]} />
      </View>
      <Text style={[styles.caption, { color: colors.textMuted }]}>
        Your coach remembers more each session
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderWidth: 1, borderRadius: BorderRadius.md, padding: Spacing.lg, gap: Spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  label: { fontFamily: 'Manrope_400Regular', fontSize: 13, flex: 1 },
  score: { fontFamily: 'Outfit_700Bold', fontSize: 20 },
  track: { height: 8, borderRadius: BorderRadius.sm, overflow: 'hidden' },
  fill: { height: 8, borderRadius: BorderRadius.sm },
  caption: { fontFamily: 'Manrope_400Regular', fontSize: 13 },
});

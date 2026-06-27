import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Brain } from 'lucide-react-native';
import { useThemeColors } from '@/context/ThemeContext';

interface MemoryDepthMeterProps {
  score: number;
}

export function MemoryDepthMeter({ score }: MemoryDepthMeterProps) {
  const colors = useThemeColors();
  const safe = Math.max(0, Math.min(100, score ?? 0));
  const fill = useSharedValue(0);

  useEffect(() => {
    fill.value = withTiming(safe / 100, { duration: 600 });
  }, [safe, fill]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${fill.value * 100}%`,
    backgroundColor: colors.secondary,
  }));

  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Brain size={16} color={colors.secondary} />
        <Text style={[styles.label, { color: colors.textSecondary, fontFamily: 'Manrope_400Regular' }]}>
          Memory depth
        </Text>
        <Text style={[styles.value, { color: colors.text, fontFamily: 'Outfit_700Bold' }]}>
          {(safe ?? 0).toFixed(0)}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <Animated.View style={[styles.fill, barStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 12, borderRadius: 14, borderWidth: 1, gap: 6 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontSize: 13, flex: 1 },
  value: { fontSize: 16 },
  track: { height: 6, borderRadius: 9999, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 9999 },
});

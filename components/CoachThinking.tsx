import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useThemeColors } from '@/context/ThemeContext';

function Dot({ delay }: { delay: number }) {
  const colors = useThemeColors();
  const scale = useSharedValue(0.6);
  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 600 }),
          withTiming(0.6, { duration: 600 })
        ),
        -1,
        true
      )
    );
  }, [delay, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View
      style={[styles.dot, { backgroundColor: colors.primary }, style]}
    />
  );
}

export function CoachThinking() {
  return (
    <View style={styles.row}>
      <Dot delay={0} />
      <Dot delay={200} />
      <Dot delay={400} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, padding: 12, alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 9999 },
});

import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useThemeColors } from '@/context/ThemeContext';

const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32 };
const radii = { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 };

function Dot({ delay }: { delay: number }) {
  const colors = useThemeColors();
  const v = useSharedValue(0.6);
  useEffect(() => {
    v.value = withDelay(delay, withRepeat(withTiming(1, { duration: 600 }), -1, true));
  }, [v, delay]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: v.value }], opacity: v.value }));
  return (
    <Animated.View
      style={[
        { width: 8, height: 8, borderRadius: radii.full, backgroundColor: colors.accent },
        style,
      ]}
    />
  );
}

export function ThinkingDots() {
  const colors = useThemeColors();
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        gap: spacing.sm,
        backgroundColor: colors.warningMuted,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.accent,
        padding: spacing.lg,
        marginTop: spacing.md,
      }}
    >
      <Dot delay={0} />
      <Dot delay={200} />
      <Dot delay={400} />
    </View>
  );
}

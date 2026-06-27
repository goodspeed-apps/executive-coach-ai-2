import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Brain } from 'lucide-react-native';
import { useThemeColors } from '@/context/ThemeContext';

interface Props {
  pulse?: boolean;
  size?: number;
}

export function CoachSeat({ pulse = false, size = 64 }: Props) {
  const colors = useThemeColors();
  const ring = useSharedValue(0);
  const iris = useSharedValue(0.85);

  useEffect(() => {
    iris.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
  }, [iris]);

  useEffect(() => {
    if (pulse) {
      ring.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0, { duration: 300 })
        ),
        2,
        false
      );
    }
  }, [pulse, ring]);

  const irisStyle = useAnimatedStyle(() => ({ transform: [{ scale: iris.value }] }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: ring.value,
    transform: [{ scale: 1 + ring.value * 0.18 }],
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View
        style={[
          styles.ring,
          { borderColor: colors.primary, width: size, height: size, borderRadius: size / 2 },
          ringStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.glow,
          { backgroundColor: colors.accent, width: size, height: size, borderRadius: size / 2 },
        ]}
      />
      <Animated.View
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.secondary,
          },
          irisStyle,
        ]}
      >
        <Brain color={colors.textOnPrimary} size={size * 0.5} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { position: 'absolute', borderWidth: 3 },
  glow: { position: 'absolute', opacity: 0.18 },
  avatar: { alignItems: 'center', justifyContent: 'center' },
});

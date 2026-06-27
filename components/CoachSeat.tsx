import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Brain } from 'lucide-react-native';
import { useThemeColors } from '@/context/ThemeContext';
import { Spacing, BorderRadius } from '@/lib/theme';

const spacing = Spacing;
const radii = BorderRadius;

interface CoachSeatProps {
  hasNewMessage?: boolean;
  size?: number;
}

export function CoachSeat({ hasNewMessage = false, size = 64 }: CoachSeatProps) {
  const colors = useThemeColors();
  const ring = useSharedValue(0);

  useEffect(() => {
    if (hasNewMessage) {
      ring.value = withRepeat(
        withSequence(withTiming(1, { duration: 300 }), withTiming(0, { duration: 300 })),
        2,
        false,
      );
    }
  }, [hasNewMessage, ring]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ring.value,
    transform: [{ scale: 1 + ring.value * 0.08 }],
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: radii.lg,
            borderWidth: 3,
            borderColor: colors.primary,
          },
          ringStyle,
        ]}
      />
      <View
        style={{
          width: size - spacing.sm,
          height: size - spacing.sm,
          borderRadius: radii.lg,
          backgroundColor: colors.secondaryMuted,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Brain size={size * 0.5} color={colors.secondary} strokeWidth={1.5} />
      </View>
    </View>
  );
}

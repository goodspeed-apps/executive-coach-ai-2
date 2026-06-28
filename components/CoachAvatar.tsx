import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useThemeColors } from '@/context/ThemeContext';

interface CoachAvatarProps {
  size?: number;
  pulse?: boolean;
}

export function CoachAvatar({ size = 64, pulse = false }: CoachAvatarProps) {
  const colors = useThemeColors();
  const ring = useSharedValue(0);

  useEffect(() => {
    if (pulse) {
      ring.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }),
          withTiming(0, { duration: 300 })
        ),
        2,
        false
      );
    }
  }, [pulse, ring]);

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
            borderRadius: 9999,
            borderWidth: 3,
            borderColor: colors.primary,
          },
          ringStyle,
        ]}
      />
      <View
        style={{
          width: size - 6,
          height: size - 6,
          borderRadius: 9999,
          backgroundColor: colors.accent,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: size * 0.4, fontFamily: 'Outfit_700Bold', color: colors.surfaceDark }}>
          ◐
        </Text>
      </View>
    </View>
  );
}

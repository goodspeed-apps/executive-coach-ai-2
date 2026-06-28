import React, { useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, FadeIn } from 'react-native-reanimated';
import { useThemeColors } from '@/context/ThemeContext';
import { Spacing, BorderRadius } from '@/lib/theme';

const spacing = Spacing;
const radii = BorderRadius;

interface CoachSeatProps {
  greeting: string;
  pulse?: boolean;
}

export function CoachSeat({ greeting, pulse }: CoachSeatProps) {
  const colors = useThemeColors();
  const ring = useSharedValue(0);

  useEffect(() => {
    if (pulse) {
      ring.value = withRepeat(withSequence(withTiming(1, { duration: 300 }), withTiming(0, { duration: 300 })), 2, false);
    }
  }, [pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ring.value,
    transform: [{ scale: 1 + ring.value * 0.08 }],
  }));

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
      <View>
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: 64,
              height: 64,
              borderRadius: radii.full,
              borderWidth: 3,
              borderColor: colors.primary,
            },
            ringStyle,
          ]}
        />
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: radii.full,
            backgroundColor: colors.accent,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <Image source={require('@/assets/images/logo.png')} style={{ width: 64, height: 64 }} resizeMode="cover" />
        </View>
      </View>
      <Animated.View entering={FadeIn.delay(120)} style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: 'Outfit_400Regular',
            fontSize: 20,
            color: colors.text,
            lineHeight: 28,
          }}
        >
          {greeting}
        </Text>
      </Animated.View>
    </View>
  );
}

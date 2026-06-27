import React, { useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useThemeColors } from '@/context/ThemeContext';

const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32 };
const radii = { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 };

interface CoachSeatProps {
  greeting: string;
  subtext?: string;
  pulse?: boolean;
}

export function CoachSeat({ greeting, subtext, pulse }: CoachSeatProps) {
  const colors = useThemeColors();
  const ring = useSharedValue(0);

  useEffect(() => {
    if (pulse) {
      ring.value = withRepeat(
        withSequence(withTiming(1, { duration: 300 }), withTiming(0, { duration: 300 })),
        2,
        false
      );
    }
  }, [pulse, ring]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ring.value,
    transform: [{ scale: 1 + ring.value * 0.06 }],
  }));

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
      <View>
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: -3,
              left: -3,
              right: -3,
              bottom: -3,
              borderRadius: radii.xl,
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
            borderRadius: radii.xl,
            backgroundColor: colors.surfaceElevated,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.borderAccent,
          }}
        >
          <Image
            source={require('@/assets/images/logo.png')}
            style={{ width: 44, height: 44, borderRadius: radii.full }}
          />
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: colors.text,
            fontFamily: 'Outfit_700Bold',
            fontSize: 20,
          }}
        >
          {greeting}
        </Text>
        {subtext ? (
          <Text
            style={{
              color: colors.textSecondary,
              fontFamily: 'Manrope_400Regular',
              fontSize: 13,
              marginTop: spacing.xs,
            }}
          >
            {subtext}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

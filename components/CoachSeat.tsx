import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useThemeColors } from '@/context/ThemeContext';

interface CoachSeatProps {
  greeting: string;
  pulse?: boolean;
  size?: number;
}

export function CoachSeat({ greeting, pulse = false, size = 64 }: CoachSeatProps) {
  const colors = useThemeColors();
  const ring = useSharedValue(0);

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

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ring.value,
    borderColor: colors.primary,
  }));

  return (
    <View style={styles.row}>
      <View style={[styles.glow, { backgroundColor: colors.primaryMuted, width: size + 16, height: size + 16, borderRadius: 9999 }]}>
        <Animated.View
          style={[
            styles.ring,
            { width: size + 12, height: size + 12, borderRadius: 9999, borderWidth: 3 },
            ringStyle,
          ]}
        />
        <Image
          source={require('@/assets/images/logo.png')}
          style={{ width: size, height: size, borderRadius: 9999 }}
          accessibilityLabel="Your coach"
        />
      </View>
      <Text
        style={[styles.greeting, { color: colors.text, fontFamily: 'Manrope_400Regular' }]}
        numberOfLines={3}
      >
        {greeting}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  glow: { alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute' },
  greeting: { flex: 1, fontSize: 16, lineHeight: 22 },
});

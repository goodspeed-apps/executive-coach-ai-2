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
import { CoachAvatar } from '@/components/CoachAvatar';

function Dot({ delay }: { delay: number }) {
  const colors = useThemeColors();
  const scale = useSharedValue(0.6);
  useEffect(() => {
    scale.value = withDelay(delay, withRepeat(withTiming(1, { duration: 600 }), -1, true));
  }, [delay, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View
      style={[
        { width: 8, height: 8, borderRadius: 9999, backgroundColor: colors.accent },
        style,
      ]}
    />
  );
}

export function CoachTyping() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <CoachAvatar size={36} />
      <View style={{ flexDirection: 'row', gap: 6 }}>
        <Dot delay={0} />
        <Dot delay={200} />
        <Dot delay={400} />
      </View>
    </View>
  );
}

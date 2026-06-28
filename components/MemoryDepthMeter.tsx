import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
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
  const fill = useSharedValue(0);
  const safe = Math.min(100, Math.max(0, score ?? 0));

  useEffect(() => {
    fill.value = withTiming(safe / 100, { duration: 800 });
  }, [safe, fill]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${fill.value * 100}%`,
  }));

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 6,
      }}
    >
      <Brain size={18} color={colors.secondary} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 13, fontFamily: 'Manrope_700Bold', color: colors.textSecondary, marginBottom: 6 }}>
          Memory depth · {safe}
        </Text>
        <View
          style={{
            height: 6,
            borderRadius: 9999,
            backgroundColor: colors.border,
            overflow: 'hidden',
          }}
        >
          <Animated.View
            style={[
              { height: 6, borderRadius: 9999, backgroundColor: colors.secondary },
              barStyle,
            ]}
          />
        </View>
      </View>
    </View>
  );
}

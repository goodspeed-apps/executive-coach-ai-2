import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Brain } from 'lucide-react-native';
import { useThemeColors } from '@/context/ThemeContext';
import { Spacing, BorderRadius } from '@/lib/theme';

const spacing = Spacing;
const radii = BorderRadius;

interface MemoryDepthMeterProps {
  score: number;
}

export function MemoryDepthMeter({ score }: MemoryDepthMeterProps) {
  const colors = useThemeColors();
  const fill = useSharedValue(0);
  const pct = Math.min(100, (score ?? 0));

  useEffect(() => {
    fill.value = withTiming(pct, { duration: 800 });
  }, [pct]);

  const barStyle = useAnimatedStyle(() => ({ width: `${fill.value}%` }));

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
        <Brain size={16} color={colors.secondary} strokeWidth={1.5} />
        <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 13, color: colors.textSecondary }}>
          Memory depth · {Math.round(pct)}%
        </Text>
      </View>
      <View
        style={{
          height: 6,
          borderRadius: radii.full,
          backgroundColor: colors.border,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={[{ height: 6, borderRadius: radii.full, backgroundColor: colors.secondary }, barStyle]}
        />
      </View>
    </View>
  );
}

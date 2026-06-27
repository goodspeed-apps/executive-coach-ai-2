import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Brain } from 'lucide-react-native';
import { useThemeColors } from '@/context/ThemeContext';

const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32 };
const radii = { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 };

interface MemoryDepthMeterProps {
  score: number;
}

export function MemoryDepthMeter({ score }: MemoryDepthMeterProps) {
  const colors = useThemeColors();
  const fill = useSharedValue(0);
  const pct = Math.min(100, (score ?? 0));

  useEffect(() => {
    fill.value = withTiming(pct, { duration: 600 });
  }, [pct, fill]);

  const barStyle = useAnimatedStyle(() => ({ width: `${fill.value}%` }));

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Brain size={18} color={colors.secondary} />
        <Text
          style={{
            color: colors.text,
            fontFamily: 'Outfit_700Bold',
            fontSize: 16,
            flex: 1,
          }}
        >
          Memory Depth
        </Text>
        <Text
          style={{
            color: colors.secondary,
            fontFamily: 'Outfit_700Bold',
            fontSize: 16,
          }}
        >
          {(score ?? 0).toFixed(0)}
        </Text>
      </View>
      <View
        style={{
          height: 6,
          backgroundColor: colors.border,
          borderRadius: radii.full,
          marginTop: spacing.md,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={[
            { height: 6, borderRadius: radii.full, backgroundColor: colors.secondary },
            barStyle,
          ]}
        />
      </View>
      <Text
        style={{
          color: colors.textMuted,
          fontFamily: 'Manrope_400Regular',
          fontSize: 13,
          marginTop: spacing.md,
        }}
      >
        Your coach has stored this much about your patterns.
      </Text>
    </View>
  );
}

import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Database } from 'lucide-react-native';
import { useThemeColors } from '@/context/ThemeContext';
import { Spacing, BorderRadius } from '@/lib/theme';

const spacing = Spacing;
const radii = BorderRadius;

interface MemoryDepthMeterProps {
  score: number;
}

export function MemoryDepthMeter({ score }: MemoryDepthMeterProps) {
  const colors = useThemeColors();
  const pct = Math.min(100, Math.round((score / 100) * 100));

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
      }}
    >
      <Database size={20} color={colors.accent} strokeWidth={1.5} />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: 'Manrope_400Regular',
            fontSize: 13,
            color: colors.textSecondary,
            marginBottom: spacing.xs,
          }}
        >
          Memory depth
        </Text>
        <View
          style={{
            height: 6,
            borderRadius: radii.sm,
            backgroundColor: colors.border,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: `${pct}%`,
              height: '100%',
              backgroundColor: colors.accent,
            }}
          />
        </View>
      </View>
      <Text
        style={{
          fontFamily: 'Outfit_700Bold',
          fontSize: 20,
          color: colors.text,
        }}
      >
        {score}
      </Text>
    </Animated.View>
  );
}

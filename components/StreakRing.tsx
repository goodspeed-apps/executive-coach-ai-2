import React from 'react';
import { View, Text } from 'react-native';
import { Flame } from 'lucide-react-native';
import { KitSurface } from '@/components/kit';
import { useThemeColors } from '@/context/ThemeContext';

interface StreakRingProps {
  current: number;
  longest: number;
}

export function StreakRing({ current, longest }: StreakRingProps) {
  const colors = useThemeColors();
  return (
    <KitSurface
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 9999,
          backgroundColor: colors.warningMuted ?? colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Flame size={24} color={colors.accent} />
      </View>
      <View>
        <Text style={{ fontSize: 24, fontFamily: 'Outfit_700Bold', color: colors.text }}>
          {current ?? 0} day{(current ?? 0) === 1 ? '' : 's'}
        </Text>
        <Text style={{ fontSize: 13, fontFamily: 'Manrope_400Regular', color: colors.textSecondary }}>
          Best: {longest ?? 0} days
        </Text>
      </View>
    </KitSurface>
  );
}

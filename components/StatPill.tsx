import React from 'react';
import { View, Text } from 'react-native';
import { KitSurface } from '@/components/kit';
import { useThemeColors } from '@/context/ThemeContext';
import { Spacing, BorderRadius } from '@/lib/theme';

const spacing = Spacing;
const radii = BorderRadius;

interface StatPillProps {
  label: string;
  value: string;
  accent?: boolean;
}

export function StatPill({ label, value, accent }: StatPillProps) {
  const colors = useThemeColors();
  return (
    <KitSurface
      style={{
        flex: 1,
        padding: spacing.lg,
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: accent ? colors.primary : colors.border,
        backgroundColor: colors.surface,
      }}
    >
      <Text
        style={{
          fontFamily: 'Outfit_700Bold',
          fontSize: 24,
          color: accent ? colors.primary : colors.text,
        }}
      >
        {value}
      </Text>
      <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 13, color: colors.textSecondary, marginTop: spacing.xs }}>
        {label}
      </Text>
    </KitSurface>
  );
}

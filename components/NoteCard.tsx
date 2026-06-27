import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { KitButton, KitSurface } from '@/components/kit';
import { useThemeColors } from '@/context/ThemeContext';

const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32 };
const radii = { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 };

interface NoteCardProps {
  title: string;
  body: string;
  ctaLabel?: string;
  onPress?: () => void;
  testID?: string;
}

export function NoteCard({ title, body, ctaLabel, onPress, testID }: NoteCardProps) {
  const colors = useThemeColors();
  return (
    <Animated.View entering={FadeInRight.duration(280)}>
      <KitSurface
        style={{
          backgroundColor: colors.warningMuted,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: colors.accent,
          padding: spacing.lg,
          gap: spacing.md,
        }}
      >
        <Text style={{ color: colors.text, fontFamily: 'Outfit_700Bold', fontSize: 20 }}>
          {title}
        </Text>
        <Text
          style={{
            color: colors.surfaceText,
            fontFamily: 'Manrope_400Regular',
            fontSize: 16,
            lineHeight: 22,
          }}
        >
          {body}
        </Text>
        {ctaLabel && onPress ? (
          <KitButton label={ctaLabel} onPress={onPress} testID={testID} />
        ) : null}
      </KitSurface>
    </Animated.View>
  );
}

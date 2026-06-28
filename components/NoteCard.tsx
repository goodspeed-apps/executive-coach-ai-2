import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { KitCard, KitButton } from '@/components/kit';
import { useThemeColors } from '@/context/ThemeContext';
import { Spacing } from '@/lib/theme';

const spacing = Spacing;

interface NoteCardProps {
  title: string;
  body: string;
  ctaLabel?: string;
  onPress?: () => void;
  testID?: string;
  index?: number;
}

export function NoteCard({ title, body, ctaLabel, onPress, testID, index = 0 }: NoteCardProps) {
  const colors = useThemeColors();

  return (
    <Animated.View entering={FadeInDown.delay(60 * index).springify()}>
      <KitCard style={{ backgroundColor: colors.surfaceElevated, borderColor: colors.accent, borderWidth: 1 }}>
        <Text
          style={{
            fontFamily: 'Outfit_700Bold',
            fontSize: 20,
            color: colors.text,
            marginBottom: spacing.sm,
          }}
        >
          {title}
        </Text>
        <Text
          style={{
            fontFamily: 'Manrope_400Regular',
            fontSize: 16,
            color: colors.textSecondary,
            lineHeight: 24,
            marginBottom: ctaLabel ? spacing.lg : 0,
          }}
        >
          {body}
        </Text>
        {ctaLabel && onPress && <KitButton label={ctaLabel} onPress={onPress} testID={testID} />}
      </KitCard>
    </Animated.View>
  );
}

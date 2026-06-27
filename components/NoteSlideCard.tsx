import React from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { KitCard, KitButton } from '@/components/kit';
import { useThemeColors } from '@/context/ThemeContext';

interface NoteSlideCardProps {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
}

export function NoteSlideCard({ title, body, actionLabel, onAction, testID }: NoteSlideCardProps) {
  const colors = useThemeColors();
  return (
    <Animated.View entering={FadeInRight.duration(280)}>
      <KitCard style={{ borderColor: colors.accent, backgroundColor: colors.warningMuted }}>
        <Text style={[styles.title, { color: colors.text, fontFamily: 'Outfit_700Bold' }]}>
          {title}
        </Text>
        <Text style={[styles.body, { color: colors.surfaceText, fontFamily: 'Manrope_400Regular' }]}>
          {body}
        </Text>
        {actionLabel && onAction ? (
          <KitButton
            label={actionLabel}
            onPress={onAction}
            testID={testID}
          />
        ) : null}
      </KitCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, marginBottom: 6 },
  body: { fontSize: 16, lineHeight: 22, marginBottom: 12 },
});

import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { KitCard } from '@/components/kit';
import { useThemeColors } from '@/context/ThemeContext';
import { CoachAvatar } from '@/components/CoachAvatar';

interface NoteSlideCardProps {
  greeting: string;
  body: string;
  pulse?: boolean;
  children?: React.ReactNode;
}

export function NoteSlideCard({ greeting, body, pulse, children }: NoteSlideCardProps) {
  const colors = useThemeColors();
  return (
    <KitCard style={{ backgroundColor: colors.warningMuted ?? colors.surface, borderColor: colors.accent }}>
      <Animated.View entering={FadeInDown.duration(300)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <CoachAvatar size={52} pulse={pulse} />
        <Text
          style={{
            flex: 1,
            fontSize: 20,
            fontFamily: 'Outfit_700Bold',
            color: colors.text,
          }}
        >
          {greeting}
        </Text>
      </Animated.View>
      <Animated.Text
        entering={FadeInDown.delay(60).duration(300)}
        style={{
          marginTop: 12,
          fontSize: 16,
          lineHeight: 24,
          fontFamily: 'Manrope_400Regular',
          color: colors.textSecondary,
        }}
      >
        {body}
      </Animated.Text>
      {children ? (
        <Animated.View entering={FadeInDown.delay(120).duration(300)} style={{ marginTop: 16 }}>
          {children}
        </Animated.View>
      ) : null}
    </KitCard>
  );
}

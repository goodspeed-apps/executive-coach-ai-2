import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useThemeColors } from '@/context/ThemeContext';

const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32 };
const radii = { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 };

interface ChatBubbleProps {
  role: 'user' | 'coach';
  content: string;
}

export function ChatBubble({ role, content }: ChatBubbleProps) {
  const colors = useThemeColors();
  const isCoach = role === 'coach';
  return (
    <Animated.View
      entering={FadeInUp.duration(220)}
      style={{
        alignSelf: isCoach ? 'flex-start' : 'flex-end',
        maxWidth: '85%',
        backgroundColor: isCoach ? colors.warningMuted : colors.primary,
        borderRadius: radii.md,
        borderWidth: isCoach ? 1 : 0,
        borderColor: colors.accent,
        padding: spacing.lg,
      }}
    >
      <Text
        style={{
          color: isCoach ? colors.surfaceText : colors.textOnPrimary,
          fontFamily: 'Manrope_400Regular',
          fontSize: 16,
          lineHeight: 22,
        }}
      >
        {content}
      </Text>
    </Animated.View>
  );
}

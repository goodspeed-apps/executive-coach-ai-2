import React from 'react';
import { View, Text } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { KitCard, KitButton } from '@/components/kit';
import { useThemeColors } from '@/context/ThemeContext';
import { Spacing } from '@/lib/theme';

const spacing = Spacing;

interface ErrorCardProps {
  message?: string;
  onRetry: () => void;
}

export function ErrorCard({ message, onRetry }: ErrorCardProps) {
  const colors = useThemeColors();
  return (
    <KitCard style={{ gap: spacing.md, alignItems: 'center' }}>
      <AlertTriangle size={28} color={colors.error} strokeWidth={1.5} />
      <Text
        style={{
          fontFamily: 'Manrope_400Regular',
          fontSize: 16,
          color: colors.text,
          textAlign: 'center',
        }}
      >
        {message ?? "Something went wrong. Let's try that again."}
      </Text>
      <KitButton label="Retry" onPress={onRetry} testID="error-retry" />
    </KitCard>
  );
}

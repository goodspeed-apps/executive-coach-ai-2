import React from 'react';
import { Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { KitPressable } from '@/components/kit';
import { useThemeColors } from '@/context/ThemeContext';

const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, '2xl': 32 };
const radii = { sm: 8, md: 12, lg: 16, xl: 24, full: 9999 };

interface MoodPillProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  large?: boolean;
}

export function MoodPill({ label, selected, onPress, large }: MoodPillProps) {
  const colors = useThemeColors();
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handle = () => {
    scale.value = withSpring(1.15, { damping: 8 }, () => {
      scale.value = withSpring(1);
    });
    onPress();
  };

  return (
    <Animated.View style={style}>
      <KitPressable
        onPress={handle}
        accessibilityLabel={`Select ${label}`}
        accessibilityHint="Selects this option for your check-in"
        style={{
          paddingVertical: spacing.md,
          paddingHorizontal: large ? spacing.md : spacing.lg,
          minHeight: 44,
          minWidth: 44,
          borderRadius: radii.full,
          backgroundColor: selected ? colors.primary : colors.surface,
          borderWidth: 1,
          borderColor: selected ? colors.primary : colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            color: selected ? colors.textOnPrimary : colors.text,
            fontFamily: 'Manrope_700Bold',
            fontSize: large ? 24 : 16,
          }}
        >
          {label}
        </Text>
      </KitPressable>
    </Animated.View>
  );
}

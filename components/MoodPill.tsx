import React from 'react';
import { Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { KitPressable } from '@/components/kit';
import { useThemeColors } from '@/context/ThemeContext';
import { Spacing, BorderRadius } from '@/lib/theme';

interface Props {
  label: string;
  emoji: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
}

export function MoodPill({ label, emoji, selected, onPress, testID }: Props) {
  const colors = useThemeColors();
  const scale = useSharedValue(1);

  const handle = () => {
    Haptics.selectionAsync();
    scale.value = withSequence(
      withTiming(1.15, { duration: 90 }),
      withTiming(1, { duration: 90 })
    );
    onPress();
  };

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animStyle}>
      <KitPressable
        onPress={handle}
        testID={testID}
        accessibilityLabel={label}
        accessibilityHint={`Select ${label} mood`}
        style={[
          styles.pill,
          {
            borderColor: selected ? colors.primary : colors.border,
            backgroundColor: selected ? colors.primaryMuted : colors.surface,
          },
        ]}
      >
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={[styles.label, { color: selected ? colors.primary : colors.textSecondary }]}>
          {label}
        </Text>
      </KitPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.xs,
    minWidth: 64,
    minHeight: 44,
  },
  emoji: { fontSize: 24 },
  label: { fontFamily: 'Manrope_700Bold', fontSize: 13 },
});

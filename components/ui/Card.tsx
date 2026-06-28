/**
 * GAS Template, Card
 *
 * Themed container card that respects gasConfig.design.layout.cardStyle.
 * Variants: flat, elevated, outlined, filled.
 *
 * Dependencies: useThemeColors (ThemeContext), gasConfig
 */

import { View, Pressable, type ViewStyle } from 'react-native';
import { useThemeColors } from '@/context/ThemeContext';
import { gasConfig } from '../../gas.config';
import { containerRadius, cardShadow } from '../../lib/design-tokens';

interface CardProps {
  children: React.ReactNode;
  /** Override cardStyle from gasConfig */
  variant?: 'flat' | 'elevated' | 'outlined' | 'filled';
  /** Press handler, makes the card tappable */
  onPress?: () => void;
  /** Additional style overrides */
  style?: ViewStyle;
  /** Padding preset (default: 16) */
  padding?: number;
  /** Accessibility label for the tappable card (only used when onPress is set) */
  accessibilityLabel?: string;
  /** Test ID for automated testing (only used when onPress is set) */
  testID?: string;
}

export function Card({
  children,
  variant,
  onPress,
  style,
  padding = 16,
  accessibilityLabel,
  testID,
}: CardProps) {
  const { colors } = useThemeColors();
  const cardVariant = variant ?? gasConfig.design.layout.cardStyle;

  const base: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: containerRadius(),
    padding,
  };

  const variantStyles: Record<string, ViewStyle> = {
    flat: {},
    elevated: {
      ...cardShadow(),
    },
    outlined: {
      borderWidth: 1,
      borderColor: colors.border,
    },
    filled: {
      backgroundColor: colors.surface,
    },
  };

  const cardStyle: ViewStyle = { ...base, ...variantStyles[cardVariant], ...style };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        accessibilityRole="button"
        style={({ pressed }) => [cardStyle, pressed && { opacity: 0.9 }]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

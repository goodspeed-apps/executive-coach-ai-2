/**
 * KitCard, drop-in superset of components/ui/Card with 7 genuinely-different
 * variant FAMILIES. Same prop surface (children/variant?/onPress?/style/padding/
 * testID); composes KitSurface/KitPressable where sensible. Active family from
 * useKit().kit?.card (read unconditionally at the top, fail-soft to 'elevated'
 * == today's cardShadow).
 *
 * Families differ in SHAPE / FILL / BORDER / ELEVATION:
 *  - elevated        : surface + cardShadow                       (today's look)
 *  - flat            : surface, no elevation, no border
 *  - outlined        : surface + 1px border
 *  - glass           : translucent surface ('D9') + hairline border
 *  - brutalist       : 0 radius, 2px border, hard offset shadow
 *  - gradient-border : an outer LinearGradient ring wrapping the surface
 *  - inset           : surfaceSecondary + top hairline (recessed)
 */

import { View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '@/context/ThemeContext';
import { useKit } from '../KitContext';
import { KitPressable } from './KitPressable';
import { containerRadius, cardShadow } from '../../../lib/design-tokens';
import {
  DEFAULT_KIT_CARD_VARIANT,
  type KitCardVariantId,
  type ResolvedKitTuple,
} from './types';

type KitWithTuple = { readonly kit?: ResolvedKitTuple | null };

export interface KitCardProps {
  children: React.ReactNode;
  /** Override the active card family. */
  variant?: KitCardVariantId;
  onPress?: () => void;
  style?: ViewStyle;
  padding?: number;
  testID?: string;
}

export function KitCard({
  children,
  variant,
  onPress,
  style,
  padding = 16,
  testID,
}: KitCardProps) {
  // useKit() unconditionally at the top, never inside `??`.
  const kit = (useKit() as unknown as KitWithTuple).kit;
  const { colors } = useThemeColors();
  const family: KitCardVariantId = variant ?? kit?.card ?? DEFAULT_KIT_CARD_VARIANT;

  const r = containerRadius();
  const base: ViewStyle = { backgroundColor: colors.surface, borderRadius: r, padding };

  // gradient-border is special: an outer ring View wraps an inner surface.
  if (family === 'gradient-border') {
    const inner: ViewStyle = {
      backgroundColor: colors.surface,
      borderRadius: Math.max(r - 2, 0),
      padding,
      ...style,
    };
    const ring = (
      <LinearGradient
        colors={[colors.primary, colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: r, padding: 2 }}
        testID={testID}
      >
        <View style={inner}>{children}</View>
      </LinearGradient>
    );
    if (onPress) {
      return (
        <KitPressable onPress={onPress} accessibilityRole="button" testID={testID}>
          {ring}
        </KitPressable>
      );
    }
    return ring;
  }

  let cardStyle: ViewStyle;
  switch (family) {
    case 'flat':
      cardStyle = { ...base };
      break;
    case 'outlined':
      cardStyle = { ...base, borderWidth: 1, borderColor: colors.border };
      break;
    case 'glass':
      cardStyle = {
        ...base,
        backgroundColor: colors.surface + 'D9',
        borderWidth: 1,
        borderColor: colors.border,
      };
      break;
    case 'brutalist':
      cardStyle = {
        ...base,
        borderRadius: 0,
        borderWidth: 2,
        borderColor: colors.text,
        shadowColor: colors.text,
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 0,
      };
      break;
    case 'inset':
      cardStyle = {
        ...base,
        backgroundColor: colors.surfaceSecondary,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      };
      break;
    case 'elevated':
    default:
      cardStyle = { ...base, ...(cardShadow() as ViewStyle) };
      break;
  }

  const finalStyle: ViewStyle = { ...cardStyle, ...style };

  if (onPress) {
    return (
      <KitPressable onPress={onPress} accessibilityRole="button" style={finalStyle} testID={testID}>
        {children}
      </KitPressable>
    );
  }
  return (
    <View style={finalStyle} testID={testID}>
      {children}
    </View>
  );
}

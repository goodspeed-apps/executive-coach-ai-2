/**
 * KitButton, drop-in superset of components/ui/Button with 8 genuinely-different
 * variant FAMILIES (not color swaps). Same prop surface as ui/Button
 * (label/onPress/variant?/size/loading/disabled/icon/iconSize/fullWidth/style/
 * accessibilityLabel/testID) so it slots in additively; the active family comes
 * from useKit().kit?.button (read unconditionally at the top, fail-soft to
 * 'solid' == today's primary fill).
 *
 * Families differ in SHAPE / FILL / BORDER / ELEVATION:
 *  - solid      : primary fill, textOnPrimary            (today's look)
 *  - soft       : primaryMuted bg, primary text
 *  - outline    : 1.5px primary border, transparent fill
 *  - ghost      : transparent, primary text, no box
 *  - pill       : solid fill, radius 999
 *  - underline  : 2px primary bottom rule, no box
 *  - brutalist  : 0 radius, 2px text-colour border, hard 3/3 offset shadow
 *  - gradient   : LinearGradient primary -> accent fill
 */

import { isValidElement } from 'react';
import { ActivityIndicator, Text, View, type ViewStyle, type TextStyle, type StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '@/context/ThemeContext';
import { useKit } from '../KitContext';
import { KitPressable } from './KitPressable';
import { radius as radiusToken } from '../../../lib/design-tokens';
import {
  DEFAULT_KIT_BUTTON_VARIANT,
  type KitButtonVariantId,
  type ResolvedKitTuple,
} from './types';

type KitWithTuple = { readonly kit?: ResolvedKitTuple | null };
type ButtonSize = 'sm' | 'md' | 'lg';

export interface KitButtonProps {
  label: string;
  onPress: () => void;
  /** Override the active button family. */
  variant?: KitButtonVariantId;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  /** Either an icon component (rendered with size/color) or an already-rendered element. */
  icon?: React.ElementType | React.ReactElement;
  iconSize?: number;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

const SIZE_MAP: Record<ButtonSize, { height: number; px: number; fontSize: number }> = {
  sm: { height: 36, px: 14, fontSize: 13 },
  md: { height: 48, px: 20, fontSize: 15 },
  lg: { height: 56, px: 28, fontSize: 17 },
};

export function KitButton({
  label,
  onPress,
  variant,
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconSize,
  fullWidth = false,
  style,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: KitButtonProps) {
  // useKit() unconditionally at the top, never inside `??`.
  const kit = (useKit() as unknown as KitWithTuple).kit;
  const { colors } = useThemeColors();
  const family: KitButtonVariantId = variant ?? kit?.button ?? DEFAULT_KIT_BUTTON_VARIANT;

  const s = SIZE_MAP[size];
  const isDisabled = disabled || loading;
  const baseRadius = radiusToken();

  // Per-family container geometry (shape/fill/border/elevation) + text colour.
  let container: ViewStyle = {
    height: s.height,
    paddingHorizontal: s.px,
    borderRadius: baseRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  };
  let textColor: string = colors.textOnPrimary;
  let useGradient = false;

  switch (family) {
    case 'soft':
      container = { ...container, backgroundColor: colors.primaryMuted };
      textColor = colors.primary;
      break;
    case 'outline':
      container = {
        ...container,
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.primary,
      };
      textColor = colors.primary;
      break;
    case 'ghost':
      container = { ...container, backgroundColor: 'transparent' };
      textColor = colors.primary;
      break;
    case 'pill':
      container = { ...container, backgroundColor: colors.primary, borderRadius: 999 };
      textColor = colors.textOnPrimary;
      break;
    case 'underline':
      // No box: a 2px bottom rule, transparent fill, square edges.
      container = {
        ...container,
        backgroundColor: 'transparent',
        borderRadius: 0,
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
      };
      textColor = colors.primary;
      break;
    case 'brutalist':
      // Hard offset shadow (opacity 1, radius 0), 0 radius, 2px text-colour border.
      container = {
        ...container,
        backgroundColor: colors.primary,
        borderRadius: 0,
        borderWidth: 2,
        borderColor: colors.text,
        shadowColor: colors.text,
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 0,
      };
      textColor = colors.textOnPrimary;
      break;
    case 'gradient':
      // LinearGradient fill; the gradient renders as a child layer below.
      container = { ...container, backgroundColor: 'transparent', overflow: 'hidden' };
      textColor = colors.textOnPrimary;
      useGradient = true;
      break;
    case 'solid':
    default:
      container = { ...container, backgroundColor: colors.primary };
      textColor = colors.textOnPrimary;
      break;
  }

  const containerStyle: StyleProp<ViewStyle> = [
    {
      ...container,
      opacity: isDisabled ? 0.5 : 1,
      alignSelf: fullWidth ? 'stretch' : 'auto',
    },
    style,
  ];

  const textStyle: TextStyle = { color: textColor, fontSize: s.fontSize, fontWeight: '600' };
  const iconSz = iconSize ?? s.fontSize;

  const content = loading ? (
    <ActivityIndicator accessibilityLabel="Loading" size="small" color={textColor} />
  ) : (
    <>
      {Icon ? <Icon size={iconSz} color={textColor} /> : null}
      <Text style={textStyle}>{label}</Text>
    </>
  );

  return (
    <KitPressable
      onPress={onPress}
      disabled={isDisabled}
      feedbackFamily={family}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      testID={testID}
    >
      {/* Container geometry lives on this View (not the Pressable) so the
          family's shape/border/elevation are a real, inspectable substrate. */}
      <View style={containerStyle}>
        {useGradient ? (
          <>
            <LinearGradient
              colors={[colors.primary, colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheetFill}
            />
            <View style={CenterRow}>{content}</View>
          </>
        ) : (
          content
        )}
      </View>
    </KitPressable>
  );
}

const StyleSheetFill: ViewStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

const CenterRow: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
};

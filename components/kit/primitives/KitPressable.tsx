/**
 * KitPressable, the bespoke tap-target primitive.
 *
 * Wraps RN Pressable and applies family-appropriate press feedback. Most
 * families dim on press (opacity); the punchier families (pill / brutalist /
 * gradient) press-IN (a subtle scale) so the affordance matches the surface
 * weight. accessibilityRole defaults to 'button'. The active button family is
 * read from useKit().kit, read unconditionally at the top, fail-soft to the
 * default.
 */

import { Pressable, type ViewStyle, type StyleProp } from 'react-native';
import { useKit } from '../KitContext';
import {
  DEFAULT_KIT_BUTTON_VARIANT,
  type KitButtonVariantId,
  type ResolvedKitTuple,
} from './types';

type KitWithTuple = { readonly kit?: ResolvedKitTuple | null };

/** Families whose press feedback is a press-in scale rather than a dim. */
const SCALE_FEEDBACK_FAMILIES = new Set<KitButtonVariantId>(['pill', 'brutalist', 'gradient']);

export interface KitPressableProps {
  children?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  /** Override the family that drives press feedback (defaults to the active button family). */
  feedbackFamily?: KitButtonVariantId;
  accessibilityRole?: 'button' | 'link' | 'none';
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function KitPressable({
  children,
  onPress,
  disabled = false,
  feedbackFamily,
  accessibilityRole = 'button',
  accessibilityLabel,
  style,
  testID,
}: KitPressableProps) {
  // useKit() unconditionally at the top, never inside `??`.
  const kit = (useKit() as unknown as KitWithTuple).kit;
  const family: KitButtonVariantId =
    feedbackFamily ?? kit?.button ?? DEFAULT_KIT_BUTTON_VARIANT;
  const usesScale = SCALE_FEEDBACK_FAMILIES.has(family);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      testID={testID}
      style={({ pressed }) => [
        style,
        pressed &&
          (usesScale
            ? { transform: [{ scale: 0.97 }], opacity: 0.95 }
            : { opacity: 0.7 }),
      ]}
    >
      {children}
    </Pressable>
  );
}

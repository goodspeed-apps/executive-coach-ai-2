/**
 * KitHeader, a screen/section header with 5 genuinely-different variant
 * FAMILIES. Active family from useKit().kit?.header (read unconditionally at the
 * top, fail-soft to 'standard'). The title carries accessibilityRole='header'.
 *
 * Families differ in SIZE / ALIGNMENT / HEIGHT:
 *  - standard    : left-aligned title                              (default)
 *  - large-title : oversized bold title (iOS large-title feel)
 *  - centered    : centered title
 *  - compact     : small, dense single line
 *  - hero        : tall block, very large title, optional bg tint
 */

import { View, Text, type ViewStyle, type TextStyle } from 'react-native';
import { useThemeColors } from '@/context/ThemeContext';
import { useKit } from '../KitContext';
import {
  DEFAULT_KIT_HEADER_VARIANT,
  type KitHeaderVariantId,
  type ResolvedKitTuple,
} from './types';

type KitWithTuple = { readonly kit?: ResolvedKitTuple | null };

export interface KitHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  /** Override the active header family. */
  variant?: KitHeaderVariantId;
  testID?: string;
}

export function KitHeader({ title, subtitle, right, variant, testID }: KitHeaderProps) {
  // useKit() unconditionally at the top, never inside `??`.
  const kit = (useKit() as unknown as KitWithTuple).kit;
  const { colors } = useThemeColors();
  const family: KitHeaderVariantId = variant ?? kit?.header ?? DEFAULT_KIT_HEADER_VARIANT;

  // Per-family container + title geometry.
  let container: ViewStyle;
  let titleStyle: TextStyle;
  let centered = false;

  switch (family) {
    case 'large-title':
      container = { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12 };
      titleStyle = { fontSize: 34, fontWeight: '800', color: colors.text };
      break;
    case 'centered':
      container = { paddingHorizontal: 16, paddingVertical: 14, alignItems: 'center' };
      titleStyle = { fontSize: 18, fontWeight: '700', color: colors.text, textAlign: 'center' };
      centered = true;
      break;
    case 'compact':
      container = { paddingHorizontal: 16, paddingVertical: 8 };
      titleStyle = { fontSize: 15, fontWeight: '600', color: colors.text };
      break;
    case 'hero':
      container = {
        paddingHorizontal: 20,
        paddingTop: 32,
        paddingBottom: 24,
        backgroundColor: colors.primaryMuted,
      };
      titleStyle = { fontSize: 40, fontWeight: '800', color: colors.text };
      break;
    case 'standard':
    default:
      container = { paddingHorizontal: 16, paddingVertical: 14 };
      titleStyle = { fontSize: 22, fontWeight: '700', color: colors.text };
      break;
  }

  return (
    <View
      style={{ flexDirection: 'row', alignItems: centered ? 'center' : 'flex-start', ...container }}
      testID={testID}
    >
      <View style={{ flex: 1 }}>
        <Text accessibilityRole="header" style={titleStyle}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 14,
              marginTop: 4,
              textAlign: centered ? 'center' : 'left',
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right != null ? <View style={{ marginLeft: 12 }}>{right}</View> : null}
    </View>
  );
}

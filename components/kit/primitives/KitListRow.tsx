/**
 * KitListRow, a list row with 5 genuinely-different variant FAMILIES. Active
 * family from useKit().kit?.listRow (read unconditionally at the top, fail-soft
 * to 'plain'). Wraps in KitPressable when onPress is given.
 *
 * Families differ in CONTAINER / DIVIDER / LEADING geometry:
 *  - plain        : flat row + hairline bottom divider              (default)
 *  - card         : each row is its own KitCard
 *  - inset        : grouped recessed (surfaceSecondary) background
 *  - leading-icon : prominent leading icon in a tinted circle
 *  - split        : title pinned left, trailing value pinned right
 */

import { View, Text, type ViewStyle } from 'react-native';
import { useThemeColors } from '@/context/ThemeContext';
import { useKit } from '../KitContext';
import { KitPressable } from './KitPressable';
import { KitCard } from './KitCard';
import { radius as radiusToken } from '../../../lib/design-tokens';
import {
  DEFAULT_KIT_LISTROW_VARIANT,
  type KitListRowVariantId,
  type ResolvedKitTuple,
} from './types';

type KitWithTuple = { readonly kit?: ResolvedKitTuple | null };

export interface KitListRowProps {
  title: string;
  subtitle?: string;
  leadingIcon?: React.ElementType;
  trailing?: React.ReactNode;
  onPress?: () => void;
  /** Override the active list-row family. */
  variant?: KitListRowVariantId;
  testID?: string;
}

export function KitListRow({
  title,
  subtitle,
  leadingIcon: Leading,
  trailing,
  onPress,
  variant,
  testID,
}: KitListRowProps) {
  // useKit() unconditionally at the top, never inside `??`.
  const kit = (useKit() as unknown as KitWithTuple).kit;
  const { colors } = useThemeColors();
  const family: KitListRowVariantId = variant ?? kit?.listRow ?? DEFAULT_KIT_LISTROW_VARIANT;
  const r = radiusToken();

  const prominentLeading = family === 'leading-icon';

  const inner = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: family === 'plain' ? 0 : 14,
      }}
    >
      {Leading ? (
        prominentLeading ? (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.primaryMuted,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Leading size={20} color={colors.primary} />
          </View>
        ) : (
          <Leading size={20} color={colors.textSecondary} />
        )
      ) : null}

      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontSize: 15, fontWeight: '500' }}>{title}</Text>
        {subtitle ? (
          <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>{subtitle}</Text>
        ) : null}
      </View>

      {/* split pins the trailing value hard-right; others render it inline. */}
      {trailing != null ? (
        <View style={family === 'split' ? { marginLeft: 'auto' } : undefined}>
          {typeof trailing === 'string' || typeof trailing === 'number' ? (
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{trailing}</Text>
          ) : (
            trailing
          )}
        </View>
      ) : null}
    </View>
  );

  // 'card' wraps the row content in its own KitCard.
  if (family === 'card') {
    return (
      <KitCard onPress={onPress} padding={0} testID={testID} style={{ marginVertical: 4 }}>
        {inner}
      </KitCard>
    );
  }

  let containerStyle: ViewStyle;
  switch (family) {
    case 'inset':
      containerStyle = {
        backgroundColor: colors.surfaceSecondary,
        borderRadius: r,
        marginVertical: 1,
      };
      break;
    case 'plain':
    case 'leading-icon':
    case 'split':
    default:
      // Hairline bottom divider for the row families.
      containerStyle = { borderBottomWidth: 1, borderBottomColor: colors.border };
      break;
  }

  if (onPress) {
    return (
      <KitPressable onPress={onPress} accessibilityRole="button" style={containerStyle} testID={testID}>
        {inner}
      </KitPressable>
    );
  }
  return (
    <View style={containerStyle} testID={testID}>
      {inner}
    </View>
  );
}

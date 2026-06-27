/**
 * useKitStyle, the single bridge between useThemeColors(), the design-token
 * helpers (radius/pad/cardShadow), and the active resolved kit tuple
 * (useKit().kit). Every kit primitive geometry routes through here so elevation,
 * radius, density and the surface substrate stay consistent app-wide.
 *
 * Memoized on the resolved palette + tuple so a re-render with the same theme
 * does not churn style objects.
 */

import { useMemo } from 'react';
import type { ViewStyle, TextStyle } from 'react-native';
import { useThemeColors } from '@/context/ThemeContext';
import { useKit } from '../KitContext';
import { radius as radiusToken, pad as padPx, cardShadow } from '../../../lib/design-tokens';
import {
  DEFAULT_KIT_TUPLE,
  type KitStyleResult,
  type KitSurfaceVariantId,
  type ResolvedKitTuple,
  type ShadowLevel,
} from './types';

/**
 * The sibling resolver populates `kit` onto the KitContext value. Until it
 * lands, that field is simply absent, so we read it through this optional
 * accessor (fail-soft to DEFAULT_KIT_TUPLE) and this module type-checks
 * standalone.
 */
type KitWithTuple = { readonly kit?: ResolvedKitTuple | null };

export function useKitStyle(): KitStyleResult {
  // useKit() and useThemeColors() are BOTH called unconditionally at the top.
  const kitCtx = useKit() as unknown as KitWithTuple;
  const { colors } = useThemeColors();
  const tuple: ResolvedKitTuple = kitCtx.kit ?? DEFAULT_KIT_TUPLE;

  return useMemo<KitStyleResult>(() => {
    const radius = (token?: string): number => radiusToken(token);
    const pad = (basePx: number): number => padPx(basePx);

    // Discrete elevation -> the param-driven cardShadow moods.
    const shadow = (level: ShadowLevel = 'md'): ViewStyle => {
      switch (level) {
        case 'none':
          return {};
        case 'sm':
          return cardShadow('minimal') as ViewStyle;
        case 'lg':
          return cardShadow('bold') as ViewStyle;
        case 'md':
        default:
          return cardShadow() as ViewStyle;
      }
    };

    // Surface family substrate. Each id is a genuinely-different substrate, not
    // a recolor: raised adds elevation, plain is flat-on-background, bordered
    // adds a hairline box, inset recesses with a top hairline.
    const surfaceStyle = (variant: KitSurfaceVariantId = tuple.surface): ViewStyle => {
      const base: ViewStyle = { backgroundColor: colors.surface };
      switch (variant) {
        case 'plain':
          return { backgroundColor: colors.background };
        case 'bordered':
          return { ...base, borderWidth: 1, borderColor: colors.border };
        case 'inset':
          return {
            backgroundColor: colors.surfaceSecondary,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          };
        case 'raised':
        default:
          return { ...base, ...(cardShadow() as ViewStyle) };
      }
    };

    const textOnSurface: TextStyle = { color: colors.text };

    return { colors, radius, pad, shadow, surfaceStyle, tuple, textOnSurface };
    // colors object identity changes per scheme; tuple identity changes per app.
  }, [colors, tuple]);
}

/**
 * KitSurface, the kit substrate primitive.
 *
 * A View whose background / elevation / border comes from the active surface
 * family (useKitStyle().surfaceStyle), so every higher-level primitive that
 * needs a "panel" shares one consistent substrate. The per-call `variant`
 * overrides the app's resolved surface family; otherwise the resolved family is
 * used (defaulting fail-soft to 'raised', today's look).
 */

import { View, type ViewStyle } from 'react-native';
import { useKit } from '../KitContext';
import { useKitStyle } from './useKitStyle';
import { containerRadius } from '../../../lib/design-tokens';
import {
  DEFAULT_KIT_SURFACE_VARIANT,
  type KitSurfaceVariantId,
  type ResolvedKitTuple,
} from './types';

type KitWithTuple = { readonly kit?: ResolvedKitTuple | null };

export interface KitSurfaceProps {
  children?: React.ReactNode;
  /** Override the app's resolved surface family. */
  variant?: KitSurfaceVariantId;
  /** Inner padding px (rounded by density). */
  padding?: number;
  style?: ViewStyle;
  testID?: string;
}

export function KitSurface({ children, variant, padding, style, testID }: KitSurfaceProps) {
  // useKit() unconditionally at the top, never inside `??`.
  const kit = (useKit() as unknown as KitWithTuple).kit;
  const ks = useKitStyle();
  const family: KitSurfaceVariantId = variant ?? kit?.surface ?? DEFAULT_KIT_SURFACE_VARIANT;

  const surfaceStyle: ViewStyle = {
    borderRadius: containerRadius(),
    ...ks.surfaceStyle(family),
    ...(padding != null ? { padding: ks.pad(padding) } : null),
    ...style,
  };

  return (
    <View style={surfaceStyle} testID={testID}>
      {children}
    </View>
  );
}

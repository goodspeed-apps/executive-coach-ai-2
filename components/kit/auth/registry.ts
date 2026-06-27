/**
 * GAS Template, Auth Variant Registry
 *
 * The 5 seed-selectable auth layouts and the fail-soft resolver the four thin
 * auth route shells call. The dev-agent writes one of AUTH_VARIANT_IDS into
 * gasConfig.design.variants.auth; the shell passes that string to
 * resolveAuthVariant(), which returns the matching layout or fail-softs to the
 * default (centered-card) for any unknown / undefined / null value, the same
 * `resolveIcon(name) ?? Fallback` pattern used at app/(tabs)/_layout.tsx.
 */

import type { ComponentType } from 'react';
import type { AuthVariantProps } from './types';
import { AuthCenteredCard } from './AuthCenteredCard';
import { AuthSplitHero } from './AuthSplitHero';
import { AuthMinimalStack } from './AuthMinimalStack';
import { AuthBoldHeader } from './AuthBoldHeader';
import { AuthCompact } from './AuthCompact';

// MUST match @goodspeed/shared AUTH_VARIANT_IDS
// Re-exported from ids.ts (pure module, safe for scripts/jest projects without RN env).
export { AUTH_VARIANT_IDS, DEFAULT_AUTH_VARIANT_ID } from './ids';

export const AUTH_VARIANTS: Record<string, ComponentType<AuthVariantProps>> = {
  'centered-card': AuthCenteredCard,
  'split-hero': AuthSplitHero,
  'minimal-stack': AuthMinimalStack,
  'bold-header': AuthBoldHeader,
  'compact': AuthCompact,
};

/**
 * Resolve a variant id (from gasConfig.design.variants.auth) to its component,
 * fail-softing any unknown / undefined / null id to the default centered-card.
 */
export function resolveAuthVariant(id?: string | null): ComponentType<AuthVariantProps> {
  return AUTH_VARIANTS[id ?? ''] ?? AuthCenteredCard;
}

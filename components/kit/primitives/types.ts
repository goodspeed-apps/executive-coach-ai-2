/**
 * Kit primitives, the single canonical source of variant identity.
 *
 * Phase 3 (M2) content kit. This module OWNS the frozen, ordered variant-id
 * lists for all six kit families and the `ResolvedKitTuple` shape that a sibling
 * resolver populates into KitContext (`useKit().kit`).
 *
 * INVARIANTS (do not break later):
 *  - Each list is ORDERED. Index 0 is the fail-soft default and reproduces
 *    today's look (button 'solid' == today's primary fill, card 'elevated' ==
 *    today's cardShadow, surface 'raised' == cardShadow). NEVER reorder an
 *    existing list, only APPEND new ids to the end. Reordering would silently
 *    repaint every app whose tuple was resolved against an old index.
 *  - The unions / DEFAULT_* / DEFAULT_KIT_TUPLE are all derived from these lists,
 *    so a single edit to a list keeps everything in sync.
 *
 * Pure types + frozen const data only, no React, no react-native. Safe to
 * import from any jest project.
 */

// ─── Frozen, ordered variant-id lists (index 0 = fail-soft default) ───────────

export const KIT_BUTTON_VARIANT_IDS = [
  'solid',
  'soft',
  'outline',
  'ghost',
  'pill',
  'underline',
  'brutalist',
  'gradient',
] as const;

export const KIT_CARD_VARIANT_IDS = [
  'elevated',
  'flat',
  'outlined',
  'glass',
  'brutalist',
  'gradient-border',
  'inset',
] as const;

export const KIT_SURFACE_VARIANT_IDS = ['raised', 'plain', 'bordered', 'inset'] as const;

export const KIT_INPUT_VARIANT_IDS = [
  'outline',
  'filled',
  'underline',
  'floating-label',
  'inset',
] as const;

export const KIT_LISTROW_VARIANT_IDS = [
  'plain',
  'card',
  'inset',
  'leading-icon',
  'split',
] as const;

export const KIT_HEADER_VARIANT_IDS = [
  'standard',
  'large-title',
  'centered',
  'compact',
  'hero',
] as const;

// ─── Per-family union types ───────────────────────────────────────────────────

export type KitButtonVariantId = (typeof KIT_BUTTON_VARIANT_IDS)[number];
export type KitCardVariantId = (typeof KIT_CARD_VARIANT_IDS)[number];
export type KitSurfaceVariantId = (typeof KIT_SURFACE_VARIANT_IDS)[number];
export type KitInputVariantId = (typeof KIT_INPUT_VARIANT_IDS)[number];
export type KitListRowVariantId = (typeof KIT_LISTROW_VARIANT_IDS)[number];
export type KitHeaderVariantId = (typeof KIT_HEADER_VARIANT_IDS)[number];

// ─── Per-family defaults (index 0, reproduces today's look) ──────────────────

export const DEFAULT_KIT_BUTTON_VARIANT: KitButtonVariantId = KIT_BUTTON_VARIANT_IDS[0];
export const DEFAULT_KIT_CARD_VARIANT: KitCardVariantId = KIT_CARD_VARIANT_IDS[0];
export const DEFAULT_KIT_SURFACE_VARIANT: KitSurfaceVariantId = KIT_SURFACE_VARIANT_IDS[0];
export const DEFAULT_KIT_INPUT_VARIANT: KitInputVariantId = KIT_INPUT_VARIANT_IDS[0];
export const DEFAULT_KIT_LISTROW_VARIANT: KitListRowVariantId = KIT_LISTROW_VARIANT_IDS[0];
export const DEFAULT_KIT_HEADER_VARIANT: KitHeaderVariantId = KIT_HEADER_VARIANT_IDS[0];

// ─── The resolved per-app tuple (one active family per primitive) ─────────────

export interface ResolvedKitTuple {
  readonly button: KitButtonVariantId;
  readonly card: KitCardVariantId;
  readonly surface: KitSurfaceVariantId;
  readonly input: KitInputVariantId;
  readonly listRow: KitListRowVariantId;
  readonly header: KitHeaderVariantId;
}

/**
 * The fail-soft tuple: index-0 of every family. A primitive that reads
 * `useKit().kit ?? DEFAULT_KIT_TUPLE` therefore reproduces today's look
 * verbatim until the sibling resolver populates a real tuple.
 */
export const DEFAULT_KIT_TUPLE: ResolvedKitTuple = Object.freeze({
  button: DEFAULT_KIT_BUTTON_VARIANT,
  card: DEFAULT_KIT_CARD_VARIANT,
  surface: DEFAULT_KIT_SURFACE_VARIANT,
  input: DEFAULT_KIT_INPUT_VARIANT,
  listRow: DEFAULT_KIT_LISTROW_VARIANT,
  header: DEFAULT_KIT_HEADER_VARIANT,
});

// ─── Style-bridge result types (what useKitStyle returns) ─────────────────────

/** Discrete elevation levels useKitStyle.shadow() understands. */
export type ShadowLevel = 'none' | 'sm' | 'md' | 'lg';

/**
 * The shape useKitStyle returns. Kept here so primitives can type their
 * `const ks = useKitStyle()` without importing the hook's implementation.
 */
export interface KitStyleResult {
  /** The active resolved theme palette (light or dark). */
  readonly colors: import('../../../context/ThemeContext').ThemeColors;
  /** Corner radius px for a RadiusToken (or app default when omitted). */
  readonly radius: (token?: string) => number;
  /** Apply the app's density scale to a base px value. */
  readonly pad: (basePx: number) => number;
  /** Elevation style for a discrete level, routed through cardShadow(). */
  readonly shadow: (level?: ShadowLevel) => import('react-native').ViewStyle;
  /** Substrate style for a surface family id. */
  readonly surfaceStyle: (variant?: KitSurfaceVariantId) => import('react-native').ViewStyle;
  /** The active resolved tuple (active family per primitive). */
  readonly tuple: ResolvedKitTuple;
  /** Default text style that reads correctly on a surface. */
  readonly textOnSurface: import('react-native').TextStyle;
}

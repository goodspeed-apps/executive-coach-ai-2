/**
 * @/components/kit, the Phase 3 (M2) content-kit barrel.
 *
 * Re-exports the six kit primitives, their substrate/tap primitives, the style
 * bridge, the KitProvider/useKit context seam, the canonical variant-id consts,
 * the default tuple, the pure variant selector, and all kit types.
 *
 * NOTE: scaffolds (and NavigatorSwitch/HubLayout/NavigationGate from Phase 2)
 * are intentionally NOT re-exported here, a sibling task appends the scaffold
 * exports.
 */

// ─── The six primitives ───────────────────────────────────────────────────────
export { KitButton } from './primitives/KitButton';
export type { KitButtonProps } from './primitives/KitButton';
export { KitCard } from './primitives/KitCard';
export type { KitCardProps } from './primitives/KitCard';
export { KitInput } from './primitives/KitInput';
export type { KitInputProps } from './primitives/KitInput';
export { KitListRow } from './primitives/KitListRow';
export type { KitListRowProps } from './primitives/KitListRow';
export { KitHeader } from './primitives/KitHeader';
export type { KitHeaderProps } from './primitives/KitHeader';

// ─── Substrate + tap primitives ───────────────────────────────────────────────
export { KitSurface } from './primitives/KitSurface';
export type { KitSurfaceProps } from './primitives/KitSurface';
export { KitPressable } from './primitives/KitPressable';
export type { KitPressableProps } from './primitives/KitPressable';

// ─── Style bridge ─────────────────────────────────────────────────────────────
export { useKitStyle } from './primitives/useKitStyle';

// ─── Context seam ─────────────────────────────────────────────────────────────
export { KitProvider, useKit } from './KitContext';
export type { KitContextValue } from './KitContext';

// ─── Pure variant selector ────────────────────────────────────────────────────
export { pickKitVariant } from './primitives/selectVariant';

// ─── Canonical variant-id consts + the default tuple ──────────────────────────
export {
  KIT_BUTTON_VARIANT_IDS,
  KIT_CARD_VARIANT_IDS,
  KIT_SURFACE_VARIANT_IDS,
  KIT_INPUT_VARIANT_IDS,
  KIT_LISTROW_VARIANT_IDS,
  KIT_HEADER_VARIANT_IDS,
  DEFAULT_KIT_BUTTON_VARIANT,
  DEFAULT_KIT_CARD_VARIANT,
  DEFAULT_KIT_SURFACE_VARIANT,
  DEFAULT_KIT_INPUT_VARIANT,
  DEFAULT_KIT_LISTROW_VARIANT,
  DEFAULT_KIT_HEADER_VARIANT,
  DEFAULT_KIT_TUPLE,
} from './primitives/types';

// ─── Scaffolds ────────────────────────────────────────────────────────────────
export * from './scaffolds';

// ─── Design-language type ─────────────────────────────────────────────────────
export type { ResolvedDesignLanguage } from '../../lib/design-language';

// ─── Types ────────────────────────────────────────────────────────────────────
export type {
  KitButtonVariantId,
  KitCardVariantId,
  KitSurfaceVariantId,
  KitInputVariantId,
  KitListRowVariantId,
  KitHeaderVariantId,
  ResolvedKitTuple,
  ShadowLevel,
  KitStyleResult,
} from './primitives/types';

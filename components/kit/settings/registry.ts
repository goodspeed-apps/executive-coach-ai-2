/**
 * GAS Template, Settings Variant Registry
 *
 * The 4 seed-selectable settings layouts and the fail-soft resolver the thin
 * settings shell calls. The dev-agent writes one of SETTINGS_VARIANT_IDS into
 * gasConfig.design.variants.settings; the shell passes that string to
 * resolveSettingsVariant(), which returns the matching layout or fail-softs to
 * the default (grouped-cards) for any unknown / undefined / null value, the
 * same resolve-or-fallback pattern as the auth kit.
 */

import type { SettingsVariantComponent } from './types';
import { SettingsGroupedCards } from './SettingsGroupedCards';
import { SettingsFlatList } from './SettingsFlatList';
import { SettingsSidebarSections } from './SettingsSidebarSections';
import { SettingsCompact } from './SettingsCompact';

// MUST match @goodspeed/shared SETTINGS_VARIANT_IDS
// Re-exported from ids.ts (pure module, safe for scripts/jest projects without RN env).
export { SETTINGS_VARIANT_IDS, DEFAULT_SETTINGS_VARIANT_ID } from './ids';

export const SETTINGS_VARIANTS: Record<string, SettingsVariantComponent> = {
  'grouped-cards': SettingsGroupedCards,
  'flat-list': SettingsFlatList,
  'sidebar-sections': SettingsSidebarSections,
  compact: SettingsCompact,
};

/**
 * Resolve a variant id (from gasConfig.design.variants.settings) to its
 * component, fail-softing any unknown / undefined / null id to the default
 * grouped-cards.
 */
export function resolveSettingsVariant(id?: string | null): SettingsVariantComponent {
  return SETTINGS_VARIANTS[id ?? ''] ?? SettingsGroupedCards;
}

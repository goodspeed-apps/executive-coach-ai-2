/**
 * Settings variant id list, pure const, no React/RN imports.
 * Safe to import from any jest project (scripts, smoke, etc.).
 *
 * Source of truth: registry.ts re-exports from here so there is exactly one
 * authoritative list.
 */

export const SETTINGS_VARIANT_IDS = [
  'grouped-cards',
  'flat-list',
  'sidebar-sections',
  'compact',
] as const;

export type SettingsVariantId = (typeof SETTINGS_VARIANT_IDS)[number];
export const DEFAULT_SETTINGS_VARIANT_ID = 'grouped-cards';

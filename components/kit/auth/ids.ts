/**
 * Auth variant id list, pure const, no React/RN imports.
 * Safe to import from any jest project (scripts, smoke, etc.).
 *
 * Source of truth: registry.ts re-exports from here so there is exactly one
 * authoritative list.
 */

export const AUTH_VARIANT_IDS = [
  'centered-card',
  'split-hero',
  'minimal-stack',
  'bold-header',
  'compact',
] as const;

export type AuthVariantId = (typeof AUTH_VARIANT_IDS)[number];
export const DEFAULT_AUTH_VARIANT_ID = 'centered-card';

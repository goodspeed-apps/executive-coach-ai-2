/**
 * Scaffold id list, pure const, no React/RN imports.
 * Safe to import from any jest project (scripts, smoke, etc.).
 *
 * Source of truth: registry.ts re-exports from here so there is exactly one
 * authoritative list. GOLDEN-LOCKED to the 10 frozen archetype-registry keys.
 */

export const SCAFFOLD_IDS = [
  'dense-dashboard',
  'media-player',
  'conversation-list',
  'photo-grid',
  'hero-cta',
  'profile-detail',
  'map-split',
  'timeline-feed',
  'horizontal-showcase',
  'settings-list',
] as const;

export type ScaffoldId = (typeof SCAFFOLD_IDS)[number];

/** Generic content list, safe for any data, so it is the fail-soft default. */
export const DEFAULT_SCAFFOLD_ID: ScaffoldId = 'settings-list';

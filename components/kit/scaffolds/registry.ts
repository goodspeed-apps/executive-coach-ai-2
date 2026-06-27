/**
 * GAS Template, Layout Archetype Scaffold Registry
 *
 * The 10 layout-archetype scaffolds and the fail-soft resolver generated screens
 * call. The dev-agent writes a chosen archetype id (from @goodspeed/development's
 * archetype DEFINITIONS); the screen passes that string to resolveScaffold(),
 * which returns the matching scaffold or fail-softs to the default
 * (settings-list, a generic content list safe for any data) for any unknown /
 * undefined / null value. Same `resolveX(id) ?? Fallback` pattern as
 * components/kit/auth/registry.ts.
 *
 * SCAFFOLD_IDS is GOLDEN-LOCKED (scaffold-contract.test.tsx) to the 10 frozen
 * archetype-registry keys, so the kit can never silently drift out of sync.
 */

import type { ScaffoldComponent } from './types';
import { DenseDashboardScaffold } from './DenseDashboardScaffold';
import { MediaPlayerScaffold } from './MediaPlayerScaffold';
import { ConversationListScaffold } from './ConversationListScaffold';
import { PhotoGridScaffold } from './PhotoGridScaffold';
import { HeroCtaScaffold } from './HeroCtaScaffold';
import { ProfileDetailScaffold } from './ProfileDetailScaffold';
import { MapSplitScaffold } from './MapSplitScaffold';
import { TimelineFeedScaffold } from './TimelineFeedScaffold';
import { HorizontalShowcaseScaffold } from './HorizontalShowcaseScaffold';
import { SettingsListScaffold } from './SettingsListScaffold';

// MUST match the keys of goodspeed-studio
// packages/development/src/archetype-registry.ts DEFINITIONS (golden-locked).
// Re-exported from ids.ts (pure module, safe for scripts/jest projects without RN env).
import { DEFAULT_SCAFFOLD_ID } from './ids';
export { SCAFFOLD_IDS, DEFAULT_SCAFFOLD_ID } from './ids';
export type { ScaffoldId } from './ids';

export const SCAFFOLDS: Record<string, ScaffoldComponent> = {
  'dense-dashboard': DenseDashboardScaffold,
  'media-player': MediaPlayerScaffold,
  'conversation-list': ConversationListScaffold,
  'photo-grid': PhotoGridScaffold,
  'hero-cta': HeroCtaScaffold,
  'profile-detail': ProfileDetailScaffold,
  'map-split': MapSplitScaffold,
  'timeline-feed': TimelineFeedScaffold,
  'horizontal-showcase': HorizontalShowcaseScaffold,
  'settings-list': SettingsListScaffold,
};

/**
 * Resolve an archetype id to its scaffold component, fail-softing any unknown /
 * undefined / null id to the default (settings-list).
 */
export function resolveScaffold(id?: string | null): ScaffoldComponent {
  return SCAFFOLDS[id ?? ''] ?? SCAFFOLDS[DEFAULT_SCAFFOLD_ID];
}

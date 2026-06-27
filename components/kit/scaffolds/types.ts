/**
 * GAS Template, Layout Archetype Scaffolds: shared types
 *
 * The canonical slot+data interface EVERY scaffold accepts. A scaffold is
 * STRUCTURE ONLY: it composes the Task-3 kit primitives into one of the 10
 * layout archetypes, themes via useThemeColors(), wraps in Entrance, and reads
 * its payload off `data`. It owns NO state beyond pure layout and does NO data
 * fetching (no supabase / useState / effects), the generated screen passes in
 * real data + slots.
 *
 * Slots are optional ReactNodes the screen injects (a real search bar, the live
 * transport controls, a header action, etc.). `data` is the archetype payload;
 * the per-archetype shapes below are loose-but-typed so a scaffold renders with
 * empty/partial/undefined data (every access is guarded with `?? defaults`).
 */

import type { ReactNode } from 'react';

export type Slot = ReactNode;

export interface ScaffoldProps<TData = unknown> {
  /** Top-of-screen slot (a search bar, a real KitHeader, a nav row). */
  header?: Slot;
  /** Main content slot (overrides/augments the archetype's body region). */
  primary?: Slot;
  /** Secondary content slot (a sidebar, a detail panel, a footer region). */
  secondary?: Slot;
  /** Action slot (transport controls, a CTA, a toolbar). */
  actions?: Slot;
  /** The archetype payload. */
  data?: TData;
  /** Optional per-item renderer for list/grid archetypes. */
  renderItem?: (item: unknown, index: number) => ReactNode;
  /** Forwarded to the outermost SafeAreaView for test/automation targeting. */
  testID?: string;
}

/**
 * A scaffold is a function component over ScaffoldProps. The `data` payload is
 * intentionally `ScaffoldProps<any>` here so the registry can hold scaffolds
 * declared with their own narrower per-archetype data shape (DashboardData,
 * TrackData, …) without TypeScript's contravariant-parameter check rejecting
 * the assignment, every scaffold guards each data access internally, so the
 * narrowing is a typing convenience, not a runtime contract.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ScaffoldComponent = (props: ScaffoldProps<any>) => ReactNode;

// --- Loose-but-typed per-archetype data shapes ---------------------------------
// Every field is optional so a scaffold renders on empty/partial data.

/** dense-dashboard: a single stat cell in the 2-col grid. */
export interface StatCell {
  label?: string;
  value?: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'flat';
}

/** dense-dashboard payload. */
export interface DashboardData {
  title?: string;
  primaryLabel?: string;
  primaryValue?: string | number;
  change?: string;
  stats?: StatCell[];
}

/** media-player payload. */
export interface TrackData {
  title?: string;
  artist?: string;
  album?: string;
  artworkUrl?: string;
  progress?: number; // 0..1
  elapsed?: string;
  duration?: string;
}

/** conversation-list: a single conversation row. */
export interface ConversationRow {
  id?: string;
  name?: string;
  preview?: string;
  timestamp?: string;
  unread?: number;
  avatarUrl?: string;
}

/** photo-grid: a single cell. */
export interface PhotoCell {
  id?: string;
  url?: string;
  caption?: string;
}

/** horizontal-showcase: a card inside a section. */
export interface ShowcaseCard {
  id?: string;
  title?: string;
  subtitle?: string;
  imageUrl?: string;
}

/** horizontal-showcase: a titled horizontal-scroll section. */
export interface ShowcaseSection {
  id?: string;
  title?: string;
  cards?: ShowcaseCard[];
}

/** timeline-feed: a single timeline entry. */
export interface TimelineEntry {
  id?: string;
  time?: string;
  title?: string;
  body?: string;
}

/** map-split: a single result row under the map. */
export interface MapResult {
  id?: string;
  name?: string;
  detail?: string;
  distance?: string;
}

/** settings-list: a row inside a group. */
export interface SettingsRow {
  id?: string;
  label?: string;
  value?: string;
}

/** settings-list: a titled, grouped section. */
export interface SettingsGroup {
  id?: string;
  title?: string;
  rows?: SettingsRow[];
}

/** profile-detail payload. */
export interface ProfileData {
  name?: string;
  handle?: string;
  bio?: string;
  avatarUrl?: string;
  stats?: StatCell[];
}

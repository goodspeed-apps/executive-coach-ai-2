/**
 * navigation-pattern, Pure resolution of the configured navigator pattern.
 *
 * NO react-native / expo imports: this is the testable core that both the
 * NavigatorSwitch (which navigator to mount) and HubLayout (which spokes to
 * render) build on. The DevAgent writes gasConfig.navigation.navigationPattern;
 * anything unknown/absent fails soft to the tab bar.
 */

export type NavigationPattern = 'tab-bar' | 'drawer' | 'hub-and-spoke';

const KNOWN: ReadonlySet<string> = new Set(['tab-bar', 'drawer', 'hub-and-spoke']);

export function resolveNavigationPattern(
  nav: { navigationPattern?: string | null } | null | undefined,
): NavigationPattern {
  const p = nav?.navigationPattern;
  return p && KNOWN.has(p) ? (p as NavigationPattern) : 'tab-bar';
}

export interface HubSpoke {
  id: string;
  label: string;
  icon: string;
  file: string;
}

/**
 * Spokes = the NON-FIRST tabs (the first tab IS the launcher root, so it is not
 * a self-referential spoke).
 */
export function hubSpokesFromTabs(
  tabs: ReadonlyArray<{ id: string; label: string; icon: string; file: string }>,
): HubSpoke[] {
  return tabs.slice(1).map((t) => ({ id: t.id, label: t.label, icon: t.icon, file: t.file }));
}

export function hubSpokeHref(spoke: { file: string }): string {
  return `/(tabs)/${spoke.file}`;
}

/**
 * navigation-pattern (lib project, pure) — resolution + spoke derivation.
 *
 * Locks the fail-soft contract (anything unknown/absent/null -> 'tab-bar') and
 * the hub-spoke rule (the FIRST tab is the launcher root, so spokes are the
 * non-first tabs in order). No RN/expo import; pure functions only.
 */

import {
  resolveNavigationPattern,
  hubSpokesFromTabs,
  hubSpokeHref,
  type NavigationPattern,
} from '../../lib/navigation-pattern';

describe('resolveNavigationPattern', () => {
  it('returns each valid pattern unchanged', () => {
    const valid: NavigationPattern[] = ['tab-bar', 'drawer', 'hub-and-spoke'];
    for (const p of valid) {
      expect(resolveNavigationPattern({ navigationPattern: p })).toBe(p);
    }
  });

  it('fails soft to tab-bar for an unknown pattern', () => {
    expect(resolveNavigationPattern({ navigationPattern: 'carousel' })).toBe('tab-bar');
    expect(resolveNavigationPattern({ navigationPattern: 'TAB-BAR' })).toBe('tab-bar');
    expect(resolveNavigationPattern({ navigationPattern: '' })).toBe('tab-bar');
  });

  it('fails soft to tab-bar for absent / null / undefined input', () => {
    expect(resolveNavigationPattern({})).toBe('tab-bar');
    expect(resolveNavigationPattern({ navigationPattern: null })).toBe('tab-bar');
    expect(resolveNavigationPattern(null)).toBe('tab-bar');
    expect(resolveNavigationPattern(undefined)).toBe('tab-bar');
  });
});

describe('hubSpokesFromTabs', () => {
  const tabs = [
    { id: 'home', label: 'Home', icon: 'Home', file: 'index' },
    { id: 'explore', label: 'Explore', icon: 'Compass', file: 'explore' },
    { id: 'settings', label: 'Settings', icon: 'Settings', file: 'settings' },
  ];

  it('DROPS the first tab (3 tabs -> 2 spokes, the non-first ones, order preserved)', () => {
    const spokes = hubSpokesFromTabs(tabs);
    expect(spokes).toEqual([
      { id: 'explore', label: 'Explore', icon: 'Compass', file: 'explore' },
      { id: 'settings', label: 'Settings', icon: 'Settings', file: 'settings' },
    ]);
  });

  it('returns [] for empty tabs', () => {
    expect(hubSpokesFromTabs([])).toEqual([]);
  });

  it('returns [] when there is only the launcher-root tab', () => {
    expect(hubSpokesFromTabs([tabs[0]])).toEqual([]);
  });
});

describe('hubSpokeHref', () => {
  it('builds an in-(tabs)-group href from the spoke file', () => {
    expect(hubSpokeHref({ file: 'explore' })).toBe('/(tabs)/explore');
    expect(hubSpokeHref({ file: 'settings' })).toBe('/(tabs)/settings');
  });
});

/**
 * GAS Template — Scaffold Contract Test (app project)
 *
 * Phase 3 (M2) ships 10 layout-archetype SCAFFOLDS (components/kit/scaffolds/)
 * as real, composable React Native screen scaffolds. Each accepts the common
 * ScaffoldProps slot+data interface, composes the Task-3 kit primitives, themes
 * via useThemeColors(), and wraps in Entrance. The dev-agent writes a chosen
 * archetype id; resolveScaffold(id) returns the matching scaffold or fail-softs
 * to the default (settings-list) for any unknown / undefined / null value.
 *
 * This test:
 *  (1) GOLDEN anti-drift — the scaffold registry ids === the 10 frozen
 *      archetype-registry keys (asserted BOTH directions: SCAFFOLD_IDS and the
 *      SCAFFOLDS map keys), so the kit can never silently drift out of sync with
 *      @goodspeed/development's archetype DEFINITIONS.
 *  (2) per-scaffold — every scaffold renders without throwing on EMPTY data and
 *      surfaces the header + actions slots it is handed.
 *  (3) resolveScaffold fail-softs unknown/undefined/null to settings-list and
 *      returns the requested scaffold for a known id.
 */

import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';

// Link/router would need a navigation context to render; neutralize them.
jest.mock('expo-router', () => ({
  __esModule: true,
  Link: ({ children }: { children?: React.ReactNode }) => children ?? null,
  router: { replace: jest.fn(), push: jest.fn(), back: jest.fn(), navigate: jest.fn() },
  useLocalSearchParams: () => ({}),
}));

import {
  SCAFFOLDS,
  SCAFFOLD_IDS,
  DEFAULT_SCAFFOLD_ID,
  resolveScaffold,
} from '../../components/kit/scaffolds/registry';

// The 10 frozen archetype ids, hardcoded + sorted. These are the keys of
// goodspeed-studio packages/development/src/archetype-registry.ts DEFINITIONS
// (golden-locked). The scaffold registry MUST stay byte-identical to this set.
const ARCHETYPE_IDS_SORTED = [
  'conversation-list',
  'dense-dashboard',
  'hero-cta',
  'horizontal-showcase',
  'map-split',
  'media-player',
  'photo-grid',
  'profile-detail',
  'settings-list',
  'timeline-feed',
].sort();

describe('scaffold contract', () => {
  // (1) GOLDEN anti-drift — both directions.
  it('SCAFFOLD_IDS === the 10 frozen archetype-registry keys (golden anti-drift)', () => {
    expect([...SCAFFOLD_IDS].sort()).toEqual(ARCHETYPE_IDS_SORTED);
  });

  it('the SCAFFOLDS map keys === the 10 frozen archetype-registry keys (golden anti-drift)', () => {
    expect(Object.keys(SCAFFOLDS).sort()).toEqual(ARCHETYPE_IDS_SORTED);
  });

  // (2) per-scaffold — renders on empty data + surfaces the header/actions slots.
  for (const id of Object.keys(SCAFFOLDS)) {
    const Scaffold = SCAFFOLDS[id];
    it(`scaffold "${id}": renders on empty data and surfaces header + actions slots`, async () => {
      const { getByText, getByTestId } = await render(
        <Scaffold
          header={<Text>HDR_SLOT</Text>}
          actions={<Text>ACT_SLOT</Text>}
          data={{}}
          testID={`scaffold-${id}`}
        />,
      );
      expect(getByTestId(`scaffold-${id}`)).toBeTruthy();
      expect(getByText('HDR_SLOT')).toBeTruthy();
      expect(getByText('ACT_SLOT')).toBeTruthy();
    });
  }

  // (3) resolver fail-soft + exact-match.
  it('resolveScaffold fail-softs unknown/undefined/null to settings-list (the default)', () => {
    expect(resolveScaffold('not-a-real-archetype')).toBe(SCAFFOLDS['settings-list']);
    expect(resolveScaffold(undefined)).toBe(SCAFFOLDS['settings-list']);
    expect(resolveScaffold(null)).toBe(SCAFFOLDS['settings-list']);
    expect(DEFAULT_SCAFFOLD_ID).toBe('settings-list');
  });

  it('resolveScaffold returns the requested scaffold for a known id', () => {
    expect(resolveScaffold('dense-dashboard')).toBe(SCAFFOLDS['dense-dashboard']);
    for (const id of SCAFFOLD_IDS) {
      expect(resolveScaffold(id)).toBe(SCAFFOLDS[id]);
    }
  });
});

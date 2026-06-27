/**
 * Tests for the Phase 3 (M2) content kit: the canonical variant-id lists, the
 * pure pickKitVariant selector, and a render smoke pass over every family of
 * each of the six primitives.
 *
 * Golden anti-drift: the family lists are asserted non-trivial and ordered with
 * index-0 == the documented default, so a future edit that reorders or shrinks a
 * list trips here. The brutalist!=solid container assertion proves the families
 * are genuinely-different GEOMETRY, not color swaps.
 *
 * Lives in __tests__/components/ so setup.ts's RN / reanimated / lucide mocks
 * load. expo-linear-gradient + ThemeContext are mocked here.
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

// ─── Mocks (hoisted before component imports) ─────────────────────────────────

// expo-linear-gradient is a native module — render it as a plain host that keeps
// children so gradient families render without the native binding.
jest.mock('expo-linear-gradient', () => {
  const RealReact = require('react');
  return {
    LinearGradient: ({ children, ...rest }: { children?: React.ReactNode }) =>
      RealReact.createElement('LinearGradient', rest, children),
  };
});

// Full-enough palette so every family resolves a colour. useThemeColors returns
// BOTH the spread palette and `.colors` (the real hook does too).
const PALETTE = {
  primary: '#3366FF',
  primaryMuted: '#3366FF22',
  textOnPrimary: '#FFFFFF',
  accent: '#FF6633',
  surface: '#FFFFFF',
  surfaceSecondary: '#F2F2F7',
  background: '#FAFAFA',
  text: '#111111',
  textSecondary: '#666666',
  border: '#E0E0E0',
  success: '#22AA55',
  warning: '#FFAA00',
  error: '#FF3333',
};
jest.mock('@/context/ThemeContext', () => ({
  useThemeColors: () => ({ ...PALETTE, colors: PALETTE }),
}));

// ─── Subject imports (after mocks) ────────────────────────────────────────────

import {
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
  pickKitVariant,
  KitButton,
  KitCard,
  KitInput,
  KitListRow,
  KitHeader,
  KitSurface,
} from '@/components/kit';

// ─── Golden anti-drift: the family lists ──────────────────────────────────────

describe('kit variant-id lists (golden anti-drift)', () => {
  test('each family list is non-trivial', () => {
    expect(KIT_BUTTON_VARIANT_IDS.length).toBeGreaterThanOrEqual(8);
    expect(KIT_CARD_VARIANT_IDS.length).toBeGreaterThanOrEqual(7);
    expect(KIT_SURFACE_VARIANT_IDS.length).toBeGreaterThanOrEqual(4);
    expect(KIT_INPUT_VARIANT_IDS.length).toBeGreaterThanOrEqual(5);
    expect(KIT_LISTROW_VARIANT_IDS.length).toBeGreaterThanOrEqual(5);
    expect(KIT_HEADER_VARIANT_IDS.length).toBeGreaterThanOrEqual(5);
  });

  test('default per family is a member AND is index 0 (today-look)', () => {
    expect(KIT_BUTTON_VARIANT_IDS).toContain(DEFAULT_KIT_BUTTON_VARIANT);
    expect(KIT_BUTTON_VARIANT_IDS[0]).toBe(DEFAULT_KIT_BUTTON_VARIANT);
    expect(KIT_CARD_VARIANT_IDS[0]).toBe(DEFAULT_KIT_CARD_VARIANT);
    expect(KIT_SURFACE_VARIANT_IDS[0]).toBe(DEFAULT_KIT_SURFACE_VARIANT);
    expect(KIT_INPUT_VARIANT_IDS[0]).toBe(DEFAULT_KIT_INPUT_VARIANT);
    expect(KIT_LISTROW_VARIANT_IDS[0]).toBe(DEFAULT_KIT_LISTROW_VARIANT);
    expect(KIT_HEADER_VARIANT_IDS[0]).toBe(DEFAULT_KIT_HEADER_VARIANT);
  });

  test('button list includes gradient, card list includes gradient-border', () => {
    expect(KIT_BUTTON_VARIANT_IDS).toContain('gradient');
    expect(KIT_CARD_VARIANT_IDS).toContain('gradient-border');
  });

  test('DEFAULT_KIT_TUPLE is index-0 of every family and frozen', () => {
    expect(DEFAULT_KIT_TUPLE).toEqual({
      button: KIT_BUTTON_VARIANT_IDS[0],
      card: KIT_CARD_VARIANT_IDS[0],
      surface: KIT_SURFACE_VARIANT_IDS[0],
      input: KIT_INPUT_VARIANT_IDS[0],
      listRow: KIT_LISTROW_VARIANT_IDS[0],
      header: KIT_HEADER_VARIANT_IDS[0],
    });
    expect(Object.isFrozen(DEFAULT_KIT_TUPLE)).toBe(true);
  });
});

// ─── pickKitVariant (pure, fail-soft) ─────────────────────────────────────────

describe('pickKitVariant', () => {
  const ids = KIT_BUTTON_VARIANT_IDS;

  test('index == byte % len', () => {
    for (let b = 0; b < 20; b++) {
      expect(pickKitVariant(ids, b)).toBe(ids[b % ids.length]);
    }
  });

  test('fail-soft: NaN / undefined / Infinity / -0 -> ids[0]', () => {
    expect(pickKitVariant(ids, NaN)).toBe(ids[0]);
    expect(pickKitVariant(ids, undefined)).toBe(ids[0]);
    expect(pickKitVariant(ids, Infinity)).toBe(ids[0]);
    expect(pickKitVariant(ids, -0)).toBe(ids[0]);
  });

  test('negative + fractional bytes use abs(trunc)', () => {
    expect(pickKitVariant(ids, -3)).toBe(ids[3 % ids.length]);
    expect(pickKitVariant(ids, 9.9)).toBe(ids[9 % ids.length]);
  });

  test('distinct bytes spread across distinct ids', () => {
    const seen = new Set(ids.map((_, i) => pickKitVariant(ids, i)));
    expect(seen.size).toBe(ids.length);
  });
});

// ─── Render smoke: every family of every primitive ────────────────────────────

describe('KitButton renders every family', () => {
  test.each(KIT_BUTTON_VARIANT_IDS)('family %s renders without crashing', async (v) => {
    const r = await render(<KitButton label="Go" onPress={() => {}} variant={v} testID={`btn-${v}`} />);
    expect(r.getByTestId(`btn-${v}`)).toBeTruthy();
  });

  test('brutalist container geometry differs from solid (not a color swap)', async () => {
    const solid = JSON.stringify(
      (await render(<KitButton label="Go" onPress={() => {}} variant="solid" testID="btn-solid" />)).toJSON(),
    );
    const brutalist = JSON.stringify(
      (
        await render(
          <KitButton label="Go" onPress={() => {}} variant="brutalist" testID="btn-brutalist" />,
        )
      ).toJSON(),
    );
    expect(brutalist).not.toEqual(solid);
    // Brutalist's hard offset shadow + square corners are present; solid has neither.
    expect(brutalist).toContain('"shadowOpacity":1');
    expect(solid).not.toContain('"shadowOpacity":1');
  });
});

describe('KitCard renders every family', () => {
  test.each(KIT_CARD_VARIANT_IDS)('family %s renders without crashing', async (v) => {
    const r = await render(
      <KitCard variant={v} testID={`card-${v}`}>
        <Text>Body</Text>
      </KitCard>,
    );
    expect(r.getByTestId(`card-${v}`)).toBeTruthy();
  });
});

describe('KitSurface renders every family', () => {
  test.each(KIT_SURFACE_VARIANT_IDS)('family %s renders without crashing', async (v) => {
    const r = await render(
      <KitSurface variant={v} padding={12} testID={`surface-${v}`}>
        <Text>Body</Text>
      </KitSurface>,
    );
    expect(r.getByTestId(`surface-${v}`)).toBeTruthy();
  });
});

describe('KitInput renders every family', () => {
  test.each(KIT_INPUT_VARIANT_IDS)('family %s renders without crashing', async (v) => {
    const r = await render(
      <KitInput
        label="Name"
        value=""
        onChangeText={() => {}}
        variant={v}
        testID={`input-${v}`}
      />,
    );
    expect(r.getByTestId(`input-${v}`)).toBeTruthy();
  });

  test('error state surfaces the error message', async () => {
    const r = await render(
      <KitInput label="Email" value="x" onChangeText={() => {}} error="Bad email" testID="input-err" />,
    );
    expect(r.getByText('Bad email')).toBeTruthy();
  });
});

describe('KitListRow renders every family', () => {
  test.each(KIT_LISTROW_VARIANT_IDS)('family %s renders without crashing', async (v) => {
    const r = await render(
      <KitListRow title="Row" subtitle="Sub" variant={v} testID={`row-${v}`} />,
    );
    expect(r.getByTestId(`row-${v}`)).toBeTruthy();
  });
});

describe('KitHeader renders every family', () => {
  test.each(KIT_HEADER_VARIANT_IDS)('family %s renders without crashing', async (v) => {
    const r = await render(<KitHeader title="Title" subtitle="Sub" variant={v} testID={`hdr-${v}`} />);
    expect(r.getByTestId(`hdr-${v}`)).toBeTruthy();
  });
});

/**
 * Tests for the kit motion language:
 *   (1) the pure resolveMotion resolver (clamping, fallbacks, freezing,
 *       JSON-roundtrippability), and
 *   (2) the Entrance primitive's degrade-safe path (reducedMotion -> plain
 *       <View>, no Animated wrapper).
 *
 * Lives in __tests__/components/ so setup.ts's reanimated mock is loaded
 * (the lib jest project cannot load reanimated).
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { View } from 'react-native';
import AnimatedDefault from 'react-native-reanimated';

import {
  resolveMotion,
  DEFAULT_MOTION,
  type ResolvedMotion,
} from '../../components/kit/motion/resolveMotion';

// ─── ThemeContext mock (reducedMotion = true) ─────────────────────────────────
// Hoisted before component imports so Entrance sees reducedMotion=true.

jest.mock('../../context/ThemeContext', () => ({
  useThemeColors: () => ({ reducedMotion: true }),
}));

import { Entrance } from '../../components/kit/motion/Entrance';

// ─── resolveMotion (pure) ─────────────────────────────────────────────────────

describe('resolveMotion', () => {
  test('undefined -> DEFAULT_MOTION (entrance none) — identity', () => {
    expect(resolveMotion(undefined)).toBe(DEFAULT_MOTION);
    expect(resolveMotion(undefined).entrance).toBe('none');
  });

  test('null -> DEFAULT_MOTION', () => {
    expect(resolveMotion(null)).toBe(DEFAULT_MOTION);
  });

  test('valid motion passes through, clamped, and JSON-roundtrips', () => {
    const resolved = resolveMotion({
      entrance: 'slide',
      durationMs: 300,
      springStiffness: 200,
      springDamping: 18,
    });
    const expected: ResolvedMotion = {
      entrance: 'slide',
      durationMs: 300,
      spring: { stiffness: 200, damping: 18 },
    };
    expect(JSON.parse(JSON.stringify(resolved))).toEqual(expected);
    // frozen (deep)
    expect(Object.isFrozen(resolved)).toBe(true);
    expect(Object.isFrozen(DEFAULT_MOTION)).toBe(true);
  });

  test('bad entrance -> none', () => {
    expect(resolveMotion({ entrance: 'whoosh' }).entrance).toBe('none');
    expect(resolveMotion({ entrance: null }).entrance).toBe('none');
  });

  test('durationMs over-max -> 800, under-min -> 80', () => {
    expect(resolveMotion({ durationMs: 99999 }).durationMs).toBe(800);
    expect(resolveMotion({ durationMs: 1 }).durationMs).toBe(80);
  });

  test('spring damping/stiffness clamp to [5,60] / [40,400]', () => {
    expect(resolveMotion({ springDamping: -5 }).spring.damping).toBe(5);
    expect(resolveMotion({ springDamping: 9999 }).spring.damping).toBe(60);
    expect(resolveMotion({ springStiffness: 1 }).spring.stiffness).toBe(40);
    expect(resolveMotion({ springStiffness: 9999 }).spring.stiffness).toBe(400);
  });

  test('non-finite numbers fall back to defaults', () => {
    const r = resolveMotion({ durationMs: NaN, springStiffness: Infinity, springDamping: NaN });
    expect(r.durationMs).toBe(DEFAULT_MOTION.durationMs);
    expect(r.spring.stiffness).toBe(DEFAULT_MOTION.spring.stiffness);
    expect(r.spring.damping).toBe(DEFAULT_MOTION.spring.damping);
  });
});

// ─── Entrance (degrade-safe) ──────────────────────────────────────────────────

describe('Entrance', () => {
  it('reducedMotion=true renders a plain View (no Animated.View)', async () => {
    const result = await render(
      <Entrance kind="fade" style={{ flex: 1 }}>
        <View testID="entrance-child" />
      </Entrance>,
    );
    // The child renders, and no entering animation wrapper is applied.
    expect(result.getByTestId('entrance-child')).toBeTruthy();
    // The reanimated mock renders Animated.View as the string host 'Animated.View';
    // in the reducedMotion path Entrance must emit a plain 'View' instead.
    const json = JSON.stringify(result.toJSON());
    const AnimatedViewType = (AnimatedDefault as unknown as { View: string }).View;
    expect(AnimatedViewType).toBe('Animated.View');
    expect(json).not.toContain(AnimatedViewType);
  });
});

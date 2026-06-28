/**
 * Tests for components/kit/KitContext and components/kit/NavigationGate.
 *
 * Verifies:
 * (a) KitProvider renders children unchanged.
 * (b) useKit() returns { passthrough: true, mood: <string> }.
 * (c) NavigationGate is a pure identity wrapper — children pass through unchanged.
 */

import React from 'react';
import { act, create } from 'react-test-renderer';

// Mock gas.config before importing so the context receives a controlled config.
jest.mock('../../gas.config', () => ({
  gasConfig: {
    design: {
      mood: 'professional',
    },
  },
}));

import { KitProvider, useKit } from '../../components/kit/KitContext';
import { NavigationGate } from '../../components/kit/NavigationGate';

// Sentinel component for tree inspection.
function Sentinel({ label }: { label: string }) {
  return React.createElement('sentinel', { label });
}

// Consumer component that captures useKit() output via props.
function KitConsumer({ onValue }: { onValue: (v: ReturnType<typeof useKit>) => void }) {
  const value = useKit();
  onValue(value);
  return React.createElement('consumer', null);
}

// ─── KitProvider ──────────────────────────────────────────────────────────────

describe('KitProvider', () => {
  test('renders children unchanged', () => {
    let tree: ReturnType<typeof create>;
    act(() => {
      tree = create(
        React.createElement(KitProvider, null, React.createElement(Sentinel, { label: 'child' })),
      );
    });
    const sentinel = tree!.root.findByType(Sentinel);
    expect(sentinel).toBeTruthy();
    expect(sentinel.props.label).toBe('child');
  });

  test('useKit returns { passthrough: true, mood: string }', () => {
    let captured: ReturnType<typeof useKit> | undefined;
    act(() => {
      create(
        React.createElement(
          KitProvider,
          null,
          React.createElement(KitConsumer, {
            onValue: (v) => { captured = v; },
          }),
        ),
      );
    });
    expect(captured).toBeDefined();
    expect(captured!.passthrough).toBe(true);
    expect(typeof captured!.mood).toBe('string');
    expect(captured!.mood.length).toBeGreaterThan(0);
  });

  test('useKit mood matches gasConfig.design.mood', () => {
    let captured: ReturnType<typeof useKit> | undefined;
    act(() => {
      create(
        React.createElement(
          KitProvider,
          null,
          React.createElement(KitConsumer, {
            onValue: (v) => { captured = v; },
          }),
        ),
      );
    });
    expect(captured!.mood).toBe('professional');
  });
});

// ─── KitProvider design language (Phase 3 M2) ────────────────────────────────

describe('KitProvider design language', () => {
  // Helper: render a KitProvider and capture the useKit() value.
  function captureKit(): ReturnType<typeof useKit> {
    let captured: ReturnType<typeof useKit> | undefined;
    act(() => {
      create(
        React.createElement(
          KitProvider,
          null,
          React.createElement(KitConsumer, {
            onValue: (v) => { captured = v; },
          }),
        ),
      );
    });
    return captured!;
  }

  test('useKit().design is defined and frozen', () => {
    const kit = captureKit();
    expect(kit.design).toBeDefined();
    expect(Object.isFrozen(kit.design)).toBe(true);
  });

  test('design is referentially stable across two separate KitProvider mounts', () => {
    const a = captureKit();
    const b = captureKit();
    // Module-level frozen const — same object reference across mounts.
    expect(a.design).toBe(b.design);
  });

  test('useKit().motion === useKit().design.motion AND useKit().kit === useKit().design.kit', () => {
    const kit = captureKit();
    expect(kit.motion).toBe(kit.design.motion);
    expect(kit.kit).toBe(kit.design.kit);
  });
});

// ─── NavigationGate ───────────────────────────────────────────────────────────

describe('NavigationGate', () => {
  test('renders children unchanged (identity wrapper)', () => {
    let tree: ReturnType<typeof create>;
    act(() => {
      tree = create(
        React.createElement(NavigationGate, null, React.createElement(Sentinel, { label: 'inner' })),
      );
    });
    const sentinel = tree!.root.findByType(Sentinel);
    expect(sentinel).toBeTruthy();
    expect(sentinel.props.label).toBe('inner');
  });

  test('renders multiple children unchanged', () => {
    let tree: ReturnType<typeof create>;
    act(() => {
      tree = create(
        React.createElement(
          NavigationGate,
          null,
          React.createElement(Sentinel, { label: 'a' }),
          React.createElement(Sentinel, { label: 'b' }),
        ),
      );
    });
    const sentinels = tree!.root.findAllByType(Sentinel);
    expect(sentinels).toHaveLength(2);
    expect(sentinels[0].props.label).toBe('a');
    expect(sentinels[1].props.label).toBe('b');
  });
});

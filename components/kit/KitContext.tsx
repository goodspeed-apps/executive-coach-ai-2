/**
 * KitContext, Phase 1 passthrough seam + Phase 2 motion language + Phase 3 (M2)
 * full design-language wiring.
 *
 * Provides a frozen context value carrying the app's design `mood`, its resolved
 * `motion` (entrance/duration/spring), and the full `ResolvedDesignLanguage`
 * (including the per-primitive `kit` variant tuple). Resolved ONCE at module load
 * from gasConfig slices so the value is referentially stable across all mounts.
 *
 * The `passthrough` flag is retained from Phase 1 for backward-compat.
 *
 * PURE: no react-native / reanimated import at module load, safe for the lib
 * jest project. resolveDesignLanguage is itself pure; gasConfig is plain JSON.
 */

import React, { createContext, useContext, type ReactNode } from 'react';
import { gasConfig } from '../../gas.config';
import {
  resolveDesignLanguage,
  kitBytesFromSeed,
  deriveKitBytes,
  type ResolvedDesignLanguage,
} from '../../lib/design-language';
import type { ResolvedKitTuple } from './primitives/types';

export interface KitContextValue {
  readonly passthrough: boolean;
  readonly mood: string;
  /** Resolved motion config (single source, identical to design.motion). */
  readonly motion: ResolvedDesignLanguage['motion'];
  /** Full resolved design language (tokens, kit tuple, motion, archetype map…). */
  readonly design: ResolvedDesignLanguage;
  /** Top-level convenience accessor, identical to design.kit. */
  readonly kit: ResolvedKitTuple;
}

// ─── Resolve once at module load ──────────────────────────────────────────────

// Cast to the loose DesignSlice-compatible shape; fields may be absent on the
// minimal { design: { mood } } lib-test mock, all defensive.
const _design = gasConfig.design as {
  mood?: string;
  kitSeed?: string;
  designIntent?: { descriptor?: string };
  motion?: Parameters<typeof resolveDesignLanguage>[0] extends { motion?: infer M } ? M : unknown;
  screenArchetypes?: Record<string, string>;
};

const _slug = (gasConfig.app as { slug?: string } | undefined)?.slug ?? 'app';
const _descriptor = _design?.designIntent?.descriptor ?? _design?.mood ?? '';
const _stableKey = `${_slug}:${_descriptor}`;

const KIT_BYTES =
  kitBytesFromSeed(_design?.kitSeed) ?? deriveKitBytes(_stableKey);

const RESOLVED_DESIGN: ResolvedDesignLanguage = resolveDesignLanguage(
  // Pass the raw design slice; resolveDesignLanguage is null-safe on every field.
  gasConfig.design as Parameters<typeof resolveDesignLanguage>[0],
  // Pass the navigation slice if present; resolver fail-softs on null.
  (gasConfig as { navigation?: Parameters<typeof resolveDesignLanguage>[1] }).navigation ?? null,
  KIT_BYTES,
  _design?.screenArchetypes ?? null,
);

const KIT_VALUE: KitContextValue = Object.freeze({
  passthrough: true,
  mood: _design?.mood ?? 'professional',
  motion: RESOLVED_DESIGN.motion,   // single source of truth
  design: RESOLVED_DESIGN,
  kit: RESOLVED_DESIGN.kit,
});

// ─── Context ──────────────────────────────────────────────────────────────────

const KitContext = createContext<KitContextValue>(KIT_VALUE);

/** Mount once at the app root. The module-level frozen const is passed directly
 *  so the context value is referentially stable across every re-mount. */
export function KitProvider({ children }: { children: ReactNode }): React.ReactElement {
  return <KitContext.Provider value={KIT_VALUE}>{children}</KitContext.Provider>;
}

export function useKit(): KitContextValue {
  return useContext(KitContext);
}

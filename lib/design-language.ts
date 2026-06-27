/**
 * design-language, the ONE canonical ResolvedDesignLanguage + a PURE
 * resolveDesignLanguage that, at mount, maps gas.config slices + 2 kit-entropy
 * bytes into the resolved design language INCLUDING the per-primitive
 * kit-variant tuple (seed-spread so same-enum apps diverge).
 *
 * ── LOCKED field ownership (M3 studio compiler ⇄ this resolver) ──────────────
 *  - The studio compiler (M3) serializes only a short `design.kitSeed` hex (the
 *    TWO kit-partition bytes) + `design.screenArchetypes`. It NEVER serializes
 *    the resolved kit TUPLE.
 *  - resolveDesignLanguage derives the tuple at MOUNT, here, from those 2 bytes
 *    via `spreadTuple`. The tuple is a runtime-only artifact, do not persist it.
 *  - When `kitSeed` is absent (template / pre-M3 apps), the caller passes bytes
 *    self-derived via `deriveKitBytes` of a per-app-stable string
 *    (e.g. `app.slug + ':' + descriptor`) so the same app always resolves the
 *    same tuple across mounts, yet different apps diverge.
 *
 * PURE: no react-native runtime import, no gas.config import. The caller passes
 * the already-read config slices. Safe to import from the lib jest project, its
 * only imports are pure modules (visual-params, resolveMotion, navigation-pattern)
 * and the TYPE-only kit primitive lists.
 */

import {
  paramsToShadow,
  paramsToDensityScale,
  paramsToRadiusScale,
  type VisualParams,
} from './visual-params';
import { resolveMotion, type ResolvedMotion } from '../components/kit/motion/resolveMotion';
import { resolveNavigationPattern, type NavigationPattern } from './navigation-pattern';
import {
  KIT_BUTTON_VARIANT_IDS,
  KIT_CARD_VARIANT_IDS,
  KIT_SURFACE_VARIANT_IDS,
  KIT_INPUT_VARIANT_IDS,
  KIT_LISTROW_VARIANT_IDS,
  KIT_HEADER_VARIANT_IDS,
  DEFAULT_KIT_TUPLE,
  type ResolvedKitTuple,
} from '../components/kit/primitives/types';

// ─── Canonical resolved shapes ────────────────────────────────────────────────

export interface ResolvedTokens {
  readonly shadow: ReturnType<typeof paramsToShadow>;
  readonly densityScale: number;
  readonly radiusScale: number;
}

export interface ResolvedDesignLanguage {
  readonly descriptor: string;
  readonly params: VisualParams;
  readonly tokens: ResolvedTokens;
  readonly motion: ResolvedMotion;
  readonly navigationPattern: NavigationPattern;
  readonly tabBarVariant: 'standard' | 'floating' | 'minimal' | 'icon-only';
  readonly screenArchetypes: Readonly<Record<string, string>>;
  readonly kit: ResolvedKitTuple;
}

// ─── Loose input slices (whatever gas.config gives us; any field nullish) ──────

export interface DesignSlice {
  designIntent?: { descriptor?: string | null; params?: VisualParams | null } | null;
  motion?: Parameters<typeof resolveMotion>[0];
  expression?: { concept?: string | null } | null;
  kitSeed?: string | null;
  mood?: string | null;
}

export interface NavigationSlice {
  navigationPattern?: string | null;
  tabBarVariant?: string | null;
}

// ─── tabBarVariant ─────────────────────────────────────────────────────────────

const TAB_BAR_VARIANTS = ['standard', 'floating', 'minimal', 'icon-only'] as const;

function resolveTabBarVariant(v?: string | null): ResolvedDesignLanguage['tabBarVariant'] {
  return (TAB_BAR_VARIANTS as readonly string[]).includes(v ?? '')
    ? (v as ResolvedDesignLanguage['tabBarVariant'])
    : 'standard';
}

// ─── Kit-entropy bytes ─────────────────────────────────────────────────────────

/**
 * Parse the serialized 2-byte `design.kitSeed` (4 hex chars) into [b0, b1].
 * Returns null when absent / too short / not hex, caller then falls back to
 * `deriveKitBytes`.
 */
export function kitBytesFromSeed(kitSeed?: string | null): [number, number] | null {
  if (!kitSeed || kitSeed.length < 4) return null;
  const b0 = parseInt(kitSeed.slice(0, 2), 16);
  const b1 = parseInt(kitSeed.slice(2, 4), 16);
  return Number.isFinite(b0) && Number.isFinite(b1) ? [b0, b1] : null;
}

/**
 * Deterministic fallback for template / pre-M3 apps that have no serialized
 * kitSeed: hash a per-app-stable key (e.g. `app.slug + ':' + descriptor`) with
 * fnv1a32 and take two decorrelated bytes of the 32-bit digest.
 */
export function deriveKitBytes(stableKey: string): [number, number] {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { fnv1a32 } = require('./hash') as { fnv1a32: (s: string) => number };
  const h = fnv1a32(stableKey);
  return [(h >>> 8) & 0xff, h & 0xff];
}

// ─── Seed-spread → the per-primitive tuple ────────────────────────────────────

/** FIXED family order, index i maps to the ResolvedKitTuple key below. */
const KIT_FAMILIES = [
  KIT_BUTTON_VARIANT_IDS,
  KIT_CARD_VARIANT_IDS,
  KIT_SURFACE_VARIANT_IDS,
  KIT_INPUT_VARIANT_IDS,
  KIT_LISTROW_VARIANT_IDS,
  KIT_HEADER_VARIANT_IDS,
] as const;

/**
 * Map 2 entropy bytes → one variant id per family. DECORRELATED so that
 * button and card don't both track byte0: each family folds the 16-bit seed
 * through a per-index salt and reads a different nibble slice.
 */
export function spreadTuple(bytes: [number, number] | null): ResolvedKitTuple {
  if (!bytes) return DEFAULT_KIT_TUPLE;
  const [b0, b1] = bytes;
  const seed16 = ((b0 << 8) | b1) & 0xffff;
  const ids = KIT_FAMILIES.map((family, i) => {
    const mixed = seed16 ^ (i * 0x9e37 + (i << 3));
    const byte = (mixed >>> ((i % 4) * 4)) & 0xff;
    const len = family.length;
    return family[((byte % len) + len) % len];
  });
  return Object.freeze({
    button: ids[0] as ResolvedKitTuple['button'],
    card: ids[1] as ResolvedKitTuple['card'],
    surface: ids[2] as ResolvedKitTuple['surface'],
    input: ids[3] as ResolvedKitTuple['input'],
    listRow: ids[4] as ResolvedKitTuple['listRow'],
    header: ids[5] as ResolvedKitTuple['header'],
  });
}

// ─── The resolver ──────────────────────────────────────────────────────────────

/**
 * Map the gas.config design + navigation slices and 2 kit-entropy bytes into
 * the single canonical ResolvedDesignLanguage. Frozen. `kitBytes === null`
 * yields the fail-soft DEFAULT_KIT_TUPLE (today's look).
 */
export function resolveDesignLanguage(
  design: DesignSlice | null | undefined,
  navigation: NavigationSlice | null | undefined,
  kitBytes: [number, number] | null,
  screenArchetypes?: Record<string, string> | null,
): ResolvedDesignLanguage {
  const descriptor =
    design?.designIntent?.descriptor?.trim() ||
    design?.expression?.concept?.trim() ||
    design?.mood?.trim() ||
    'app';

  const params: VisualParams = design?.designIntent?.params ?? {};

  const tokens: ResolvedTokens = Object.freeze({
    shadow: paramsToShadow(params),
    densityScale: paramsToDensityScale(params),
    radiusScale: paramsToRadiusScale(params),
  });

  return Object.freeze({
    descriptor,
    params,
    tokens,
    motion: resolveMotion(design?.motion ?? null),
    navigationPattern: resolveNavigationPattern(navigation ?? null),
    tabBarVariant: resolveTabBarVariant(navigation?.tabBarVariant),
    screenArchetypes: Object.freeze({ ...(screenArchetypes ?? {}) }),
    kit: spreadTuple(kitBytes),
  });
}

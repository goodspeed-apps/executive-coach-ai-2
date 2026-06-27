import { gasConfig } from '../gas.config';
import {
  hasParams,
  paramsToShadow,
  paramsToDensityScale,
  paramsToRadiusScale,
  type VisualParams,
} from './visual-params';

/**
 * The dev-agent writes `design.designIntent.params` (6 continuous knobs) into a
 * generated app's gas.config. When present, those params drive the app's shadow /
 * spacing / radius tokens (see lib/visual-params.ts, which mirrors the studio
 * design-language-compiler endpoint math). When absent, as in the unmodified
 * template, we fall back, verbatim, to the legacy mood/layout derivation so a
 * params-free app is visually unchanged. Read defensively: designIntent and its
 * params are both optional/nullable.
 */
const designParams: VisualParams | undefined =
  (gasConfig.design as { designIntent?: { params?: VisualParams | null } | null }).designIntent
    ?.params ?? undefined;
const usingParams = hasParams(designParams);

export type RadiusToken = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
const RADIUS_PX: Record<RadiusToken, number> = { none: 0, sm: 6, md: 10, lg: 14, xl: 20, '2xl': 28, full: 999 };
/**
 * Resolve the app's base corner radius (number) from the string enum, with a sane fallback.
 * When the caller passes no explicit token AND the app carries designIntent.params,
 * the base radius is scaled by the cornerSoftness-derived multiplier; otherwise the
 * legacy enum lookup is used verbatim (so radius('sm') etc. stay exactly as before).
 */
export function radius(token?: RadiusToken | string): number {
  const useDefault = token === undefined;
  const base = RADIUS_PX[(token ?? gasConfig.design.layout.borderRadius) as RadiusToken] ?? RADIUS_PX.lg;
  if (useDefault && usingParams && designParams) {
    return Math.round(base * paramsToRadiusScale(designParams));
  }
  return base;
}

/** Like radius(), but capped for large/tall containers (cards, modals) so the `full` token (999) never produces a pill artifact on content-height boxes. */
export function containerRadius(token?: RadiusToken | string): number {
  return Math.min(radius(token), 28);
}

export type SpacingToken = 'compact' | 'comfortable' | 'spacious';
const SPACING_SCALE: Record<SpacingToken, number> = { compact: 0.8, comfortable: 1, spacious: 1.25 };
/**
 * Multiplier applied to base paddings/gaps so density varies per app.
 * With no explicit token AND designIntent.params present, the density knob drives
 * the scale; otherwise the legacy enum lookup is used verbatim.
 */
export function densityScale(token?: SpacingToken | string): number {
  if (token === undefined && usingParams && designParams) {
    return paramsToDensityScale(designParams);
  }
  const resolved = token ?? gasConfig.design.layout.spacing;
  return SPACING_SCALE[resolved as SpacingToken] ?? 1;
}
/** Pad helper: base px * density, rounded. */
export function pad(basePx: number): number {
  return Math.round(basePx * densityScale());
}

/**
 * Shadow intensity. When the app carries designIntent.params (and no explicit mood
 * is passed), the elevation knob drives it via the compiler endpoint math; otherwise
 * it is derived from mood so "bold" apps get heavier elevation, "minimal" gets flatter.
 */
export function cardShadow(mood?: string) {
  if (mood === undefined && usingParams && designParams) {
    return paramsToShadow(designParams);
  }
  const m = mood ?? gasConfig.design.mood;
  const bold = m === 'bold' || m === 'energetic';
  const minimal = m === 'minimal' || m === 'calm';
  if (minimal) return { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 };
  if (bold) return { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.16, shadowRadius: 16, elevation: 6 };
  return { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 };
}

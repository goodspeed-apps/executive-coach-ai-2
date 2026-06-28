/**
 * visual-params, PURE param→token resolver.
 *
 * The dev-agent writes `design.designIntent.params` (6 continuous knobs in
 * [0,1]) into a generated app's gas.config. This module turns those knobs into
 * the same design tokens the studio's design-language-compiler produces, so the
 * shipped app and the compiler agree at the endpoints. It mirrors the endpoint
 * math in goodspeed-studio packages/development/src/design-language-compiler.ts.
 *
 * No react-native / no I/O, safe to import from anywhere (incl. pure jest).
 */

/** The 6 continuous design knobs. Each is `0..1`; zod types them as nullish. */
export interface VisualParams {
  elevation?: number | null;
  density?: number | null;
  warmth?: number | null;
  cornerSoftness?: number | null;
  typeWeight?: number | null;
  motionEnergy?: number | null;
}

const KNOBS = [
  'elevation',
  'density',
  'warmth',
  'cornerSoftness',
  'typeWeight',
  'motionEnergy',
] as const;

const NEUTRAL = 0.5;

/** Clamp an unknown into [0,1]; non-finite / non-number → neutral 0.5. */
export function clamp01(x: unknown): number {
  const n = typeof x === 'number' ? x : NaN;
  if (!Number.isFinite(n)) return NEUTRAL;
  return Math.min(1, Math.max(0, n));
}

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const round2 = (n: number): number => Math.round(n * 100) / 100;

/** True only when at least one knob is a finite number. */
export function hasParams(p: VisualParams | null | undefined): boolean {
  if (!p) return false;
  return KNOBS.some((k) => typeof p[k] === 'number' && Number.isFinite(p[k] as number));
}

/**
 * Shadow derived from `elevation`. Returns the SAME shape `cardShadow` returns
 * today: { shadowColor, shadowOffset: { width, height }, shadowOpacity,
 * shadowRadius, elevation }. Endpoint math matches the compiler's CompiledShadow
 * (shadowOffsetHeight→shadowOffset.height, androidElevation→elevation).
 */
export function paramsToShadow(p: VisualParams) {
  const e = clamp01(p?.elevation);
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: Math.round(lerp(1, 4, e)) },
    shadowOpacity: round2(lerp(0.04, 0.16, e)),
    shadowRadius: Math.round(lerp(4, 16, e)),
    elevation: Math.round(lerp(1, 6, e)),
  };
}

/** Density multiplier from `density` (compiler spacingScale). */
export function paramsToDensityScale(p: VisualParams): number {
  const d = clamp01(p?.density);
  return round2(lerp(1.25, 0.8, d));
}

/** Radius multiplier from `cornerSoftness` (compiler radiusScale). */
export function paramsToRadiusScale(p: VisualParams): number {
  const c = clamp01(p?.cornerSoftness);
  return round2(lerp(0, 1.6, c));
}

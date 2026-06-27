/**
 * resolveMotion, pure, RN-free normalizer for a per-app motion language.
 *
 * Takes the loose `design.motion` block from gas.config (any field may be
 * missing / null / out of range) and resolves it into a frozen, fully-clamped
 * ResolvedMotion. No React, no react-native, no side effects, safe to import
 * from the lib jest project or any non-RN context.
 *
 * Clamps: durationMs [80, 800], spring.stiffness [40, 400], spring.damping
 * [5, 60]. Unknown / missing `entrance` falls back to 'none'.
 */

export type EntranceKind = 'fade' | 'slide' | 'scale' | 'none';

export interface ResolvedMotion {
  readonly entrance: EntranceKind;
  readonly durationMs: number;
  readonly spring: { readonly stiffness: number; readonly damping: number };
}

export const DEFAULT_MOTION: ResolvedMotion = Object.freeze({
  entrance: 'none',
  durationMs: 250,
  spring: { stiffness: 180, damping: 20 },
});

const ENTRANCES: readonly EntranceKind[] = ['fade', 'slide', 'scale', 'none'];

function num(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

export function resolveMotion(
  motion?: {
    springStiffness?: number | null;
    springDamping?: number | null;
    durationMs?: number | null;
    entrance?: string | null;
  } | null,
): ResolvedMotion {
  if (!motion) return DEFAULT_MOTION;
  const entrance = (ENTRANCES as readonly string[]).includes(motion.entrance ?? '')
    ? (motion.entrance as EntranceKind)
    : DEFAULT_MOTION.entrance;
  return Object.freeze({
    entrance,
    durationMs: Math.min(Math.max(num(motion.durationMs, DEFAULT_MOTION.durationMs), 80), 800),
    spring: {
      stiffness: Math.min(
        Math.max(num(motion.springStiffness, DEFAULT_MOTION.spring.stiffness), 40),
        400,
      ),
      damping: Math.min(Math.max(num(motion.springDamping, DEFAULT_MOTION.spring.damping), 5), 60),
    },
  });
}

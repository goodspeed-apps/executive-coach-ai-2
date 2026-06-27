/**
 * pickKitVariant, pure, deterministic, fail-soft variant selector.
 *
 * Maps a seed byte (e.g. a per-app hash byte) onto one id from an ordered list:
 *   ids[(abs(trunc(byte)) || 0) % ids.length]
 *
 * Fail-soft: a NaN / undefined / non-finite seed (and an empty `||` fallthrough)
 * resolves to ids[0], the family default. No React, no react-native; safe to
 * import anywhere.
 */
export function pickKitVariant<T extends string>(
  ids: readonly T[],
  seedByte: number | undefined,
): T {
  // Empty list guard (should never happen for the canonical lists, but stay total).
  if (ids.length === 0) {
    return undefined as unknown as T;
  }
  const n =
    typeof seedByte === 'number' && Number.isFinite(seedByte)
      ? Math.abs(Math.trunc(seedByte)) || 0
      : 0;
  return ids[n % ids.length];
}

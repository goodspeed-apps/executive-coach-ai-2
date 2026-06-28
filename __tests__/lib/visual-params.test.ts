/**
 * Tests for lib/visual-params.ts — the param→token resolver that mirrors the
 * studio design-language-compiler endpoint math. Pure module; no react-native.
 */
import {
  clamp01,
  hasParams,
  paramsToShadow,
  paramsToDensityScale,
  paramsToRadiusScale,
  type VisualParams,
} from '../../lib/visual-params';

const NEUTRAL: VisualParams = {
  elevation: 0.5,
  density: 0.5,
  warmth: 0.5,
  cornerSoftness: 0.5,
  typeWeight: 0.5,
  motionEnergy: 0.5,
};

describe('clamp01', () => {
  it('clamps into [0,1]', () => {
    expect(clamp01(0)).toBe(0);
    expect(clamp01(1)).toBe(1);
    expect(clamp01(0.42)).toBe(0.42);
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(2)).toBe(1);
    expect(clamp01(1.5)).toBe(1);
    expect(clamp01(-0.0001)).toBe(0);
  });
  it('maps NaN / undefined / non-number to the neutral 0.5', () => {
    expect(clamp01(NaN)).toBe(0.5);
    expect(clamp01(undefined)).toBe(0.5);
    expect(clamp01(null)).toBe(0.5);
    expect(clamp01('0.7' as unknown)).toBe(0.5);
    expect(clamp01(Infinity)).toBe(0.5);
  });
});

describe('hasParams', () => {
  it('is false when no knob is a finite number', () => {
    expect(hasParams(undefined)).toBe(false);
    expect(hasParams(null)).toBe(false);
    expect(hasParams({})).toBe(false);
    expect(hasParams({ elevation: null, density: undefined })).toBe(false);
    expect(hasParams({ elevation: NaN })).toBe(false);
    expect(hasParams({ warmth: Infinity })).toBe(false);
  });
  it('is true when at least one knob is a finite number', () => {
    expect(hasParams({ elevation: 0 })).toBe(true);
    expect(hasParams({ density: 0.5 })).toBe(true);
    expect(hasParams({ cornerSoftness: 1, typeWeight: null })).toBe(true);
  });
});

describe('paramsToShadow', () => {
  it('returns the RN cardShadow shape', () => {
    const s = paramsToShadow(NEUTRAL);
    expect(s).toEqual({
      shadowColor: '#000',
      shadowOffset: { width: 0, height: expect.any(Number) },
      shadowOpacity: expect.any(Number),
      shadowRadius: expect.any(Number),
      elevation: expect.any(Number),
    });
  });
  it('neutral 0.5 reproduces the compiler endpoint values', () => {
    const s = paramsToShadow(NEUTRAL);
    // lerp(0.04,0.16,0.5)=0.10 ; lerp(4,16,0.5)=10 ; lerp(1,4,0.5)=2.5->3 ; lerp(1,6,0.5)=3.5->4
    expect(s.shadowOpacity).toBe(0.1);
    expect(s.shadowRadius).toBe(10);
    expect(s.shadowOffset.height).toBe(3);
    expect(s.elevation).toBe(4);
  });
  it('higher elevation yields a heavier shadow', () => {
    const low = paramsToShadow({ ...NEUTRAL, elevation: 0.1 });
    const high = paramsToShadow({ ...NEUTRAL, elevation: 0.9 });
    expect(high.shadowOpacity).toBeGreaterThan(low.shadowOpacity);
    expect(high.shadowRadius).toBeGreaterThan(low.shadowRadius);
    expect(high.elevation).toBeGreaterThan(low.elevation);
  });
  it('clamps out-of-range elevation', () => {
    expect(paramsToShadow({ elevation: 5 }).shadowOpacity).toBe(
      paramsToShadow({ elevation: 1 }).shadowOpacity,
    );
    expect(paramsToShadow({ elevation: -5 }).shadowOpacity).toBe(
      paramsToShadow({ elevation: 0 }).shadowOpacity,
    );
  });
});

describe('paramsToDensityScale', () => {
  it('neutral 0.5 ≈ 1 (comfortable today)', () => {
    // lerp(1.25,0.8,0.5)=1.025 -> round2 -> 1.02
    expect(paramsToDensityScale(NEUTRAL)).toBe(1.02);
  });
  it('denser params shrink the scale', () => {
    const loose = paramsToDensityScale({ ...NEUTRAL, density: 0.1 });
    const dense = paramsToDensityScale({ ...NEUTRAL, density: 0.9 });
    expect(loose).toBeGreaterThan(dense);
    expect(dense).toBeLessThan(1);
  });
});

describe('paramsToRadiusScale', () => {
  it('neutral 0.5 -> 0.8 multiplier', () => {
    // lerp(0,1.6,0.5)=0.8
    expect(paramsToRadiusScale(NEUTRAL)).toBe(0.8);
  });
  it('softer corners -> larger multiplier', () => {
    const sharp = paramsToRadiusScale({ ...NEUTRAL, cornerSoftness: 0.1 });
    const soft = paramsToRadiusScale({ ...NEUTRAL, cornerSoftness: 0.95 });
    expect(soft).toBeGreaterThan(sharp);
  });
});

describe('two different param sets move tokens', () => {
  it('shadow, density and radius all differ', () => {
    const a: VisualParams = { ...NEUTRAL, elevation: 0.2, density: 0.2, cornerSoftness: 0.2 };
    const b: VisualParams = { ...NEUTRAL, elevation: 0.8, density: 0.8, cornerSoftness: 0.8 };
    expect(paramsToShadow(a).shadowOpacity).not.toBe(paramsToShadow(b).shadowOpacity);
    expect(paramsToDensityScale(a)).not.toBe(paramsToDensityScale(b));
    expect(paramsToRadiusScale(a)).not.toBe(paramsToRadiusScale(b));
  });
});

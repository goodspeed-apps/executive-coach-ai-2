/**
 * resolveDesignLanguage — pure, RN-free resolver (lib jest project).
 *
 * Covers: seedless default tuple + frozen result; token endpoint math;
 * seed entropy (same enums + different kit bytes -> different tuples, all
 * picked ids valid members); kitBytesFromSeed / deriveKitBytes; and the
 * frozen screenArchetypes passthrough.
 */
import {
  resolveDesignLanguage,
  kitBytesFromSeed,
  deriveKitBytes,
} from '../../lib/design-language';
import {
  DEFAULT_KIT_TUPLE,
  KIT_BUTTON_VARIANT_IDS,
  KIT_CARD_VARIANT_IDS,
  KIT_SURFACE_VARIANT_IDS,
  KIT_INPUT_VARIANT_IDS,
  KIT_LISTROW_VARIANT_IDS,
  KIT_HEADER_VARIANT_IDS,
} from '../../components/kit/primitives/types';

describe('resolveDesignLanguage', () => {
  it('(1) seedless input -> default tuple + sane defaults + frozen', () => {
    const r = resolveDesignLanguage({ mood: 'professional' }, null, null);
    expect(r.kit).toEqual(DEFAULT_KIT_TUPLE);
    expect(r.navigationPattern).toBe('tab-bar');
    expect(r.tabBarVariant).toBe('standard');
    expect(r.descriptor).toBe('professional');
    expect(Object.isFrozen(r)).toBe(true);
  });

  it('(2) tokens follow the elevation endpoint math', () => {
    const lo = resolveDesignLanguage({ designIntent: { params: { elevation: 0 } } }, null, null);
    const hi = resolveDesignLanguage({ designIntent: { params: { elevation: 1 } } }, null, null);
    expect(hi.tokens.shadow.elevation).toBeGreaterThan(lo.tokens.shadow.elevation);
  });

  it('(3) seed entropy — identical enums + different kit bytes -> different tuples, all ids valid', () => {
    const design = { mood: 'professional' };
    const a = resolveDesignLanguage(design, null, [12, 200]);
    const b = resolveDesignLanguage(design, null, [201, 7]);
    expect(a.kit).not.toEqual(b.kit);

    for (const t of [a.kit, b.kit]) {
      expect(KIT_BUTTON_VARIANT_IDS as readonly string[]).toContain(t.button);
      expect(KIT_CARD_VARIANT_IDS as readonly string[]).toContain(t.card);
      expect(KIT_SURFACE_VARIANT_IDS as readonly string[]).toContain(t.surface);
      expect(KIT_INPUT_VARIANT_IDS as readonly string[]).toContain(t.input);
      expect(KIT_LISTROW_VARIANT_IDS as readonly string[]).toContain(t.listRow);
      expect(KIT_HEADER_VARIANT_IDS as readonly string[]).toContain(t.header);
    }
  });

  it('(4) kitBytesFromSeed parses 4-hex; deriveKitBytes is deterministic + descriptor-spread', () => {
    expect(kitBytesFromSeed('0cff')).toEqual([12, 255]);
    expect(kitBytesFromSeed(null)).toBeNull();
    expect(kitBytesFromSeed('ab')).toBeNull();

    expect(deriveKitBytes('a:fin')).not.toEqual(deriveKitBytes('b:fin'));
    expect(deriveKitBytes('a:fin')).toEqual(deriveKitBytes('a:fin'));
  });

  it('(5) screenArchetypes passes through frozen', () => {
    const r = resolveDesignLanguage({ mood: 'x' }, null, null, { home: 'dense-dashboard' });
    expect(r.screenArchetypes.home).toBe('dense-dashboard');
    expect(Object.isFrozen(r.screenArchetypes)).toBe(true);
  });
});

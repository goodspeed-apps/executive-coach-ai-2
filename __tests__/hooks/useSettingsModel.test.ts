/**
 * Tests for hooks/headless/useSettingsModel.ts — the PURE buildSettingsModel.
 *
 * Pure-logic style (like useSubscription.test.ts): exercise buildSettingsModel
 * directly with injected config + no-op handlers via a makeDeps() helper. No
 * React rendering, no IO. The `upgrade` field is asserted ALWAYS present (gate
 * must-have) — visible for free + IAP-on, hidden with a `reason` otherwise.
 */

// useSettingsModel.ts eagerly imports the real hooks (useAuth -> @/context/...)
// which the `hooks` jest project can't resolve. These tests only exercise the
// PURE builder, so stub every transitive dependency the module pulls in at load
// time (the useLoginController.test precedent). The builder itself takes all
// state/handlers via injected deps, so the stubs are never invoked.
jest.mock('../../hooks/useAuth', () => ({ useAuth: () => ({}) }));
jest.mock('../../hooks/useAnalytics', () => ({ useAnalytics: () => ({ track: jest.fn() }) }));
jest.mock('../../hooks/useSubscription', () => ({ useSubscription: () => ({}) }));
jest.mock('../../context/ThemeContext', () => ({ useThemeColors: () => ({}) }));
jest.mock('../../context/HelpContext', () => ({ useHelp: () => ({}) }));
jest.mock('../../lib/performance', () => ({ trackScreenLoad: jest.fn() }));
jest.mock('../../lib/sentry', () => ({ captureException: jest.fn(), addBreadcrumb: jest.fn() }));
jest.mock('../../services/api', () => ({ requestAccountDeletion: jest.fn() }));

import { buildSettingsModel } from '../../hooks/headless/useSettingsModel';
import type {
  SettingsModelConfig,
  SettingsModelDeps,
} from '../../hooks/headless/useSettingsModel';

const noop = () => {};

function makeConfig(over: Partial<SettingsModelConfig['features']> = {}): SettingsModelConfig {
  return {
    app: { name: 'MyApp', version: '1.0.0' },
    design: { colors: { primary: '#6366F1' } },
    features: {
      darkMode: { enabled: true },
      pushNotifications: { enabled: true },
      inAppPurchases: {
        enabled: true,
        tiers: [
          { name: 'Free', features: ['Basic features'] },
          { name: 'Pro', features: ['Unlimited access', 'Premium features'] },
        ],
      },
      auth: { biometric: { enabled: true } },
      helpSystem: true,
      csvExport: true,
      compliance: { dataExport: true },
      ...over,
    },
    legal: { privacyUrl: '', termsUrl: '' },
  };
}

function makeDeps(over: Partial<SettingsModelDeps> = {}): SettingsModelDeps {
  return {
    config: makeConfig(),
    tier: 'free',
    displayName: 'Jane',
    themePreference: 'system',
    notificationsEnabled: true,
    biometricAvailable: true,
    biometricEnabled: false,
    helpDismissed: false,
    purchasing: false,
    subLoading: false,
    onSelectTheme: noop,
    toggleNotifications: noop,
    toggleBiometric: noop,
    csvExport: noop,
    howToUse: noop,
    resetHelp: noop,
    rateApp: noop,
    openPrivacy: noop,
    openTerms: noop,
    exportData: noop,
    signOut: noop,
    deleteAccount: noop,
    upgrade: noop,
    restore: noop,
    ...over,
  };
}

describe('buildSettingsModel — section tree', () => {
  test('contains preferences, about, and account sections', () => {
    const m = buildSettingsModel(makeDeps());
    const ids = m.sections.map((s) => s.id);
    expect(ids).toContain('preferences');
    expect(ids).toContain('about');
    expect(ids).toContain('account');
  });

  test('account rows are exactly sign-out + delete-account (kind nav)', () => {
    const m = buildSettingsModel(makeDeps());
    const account = m.sections.find((s) => s.id === 'account')!;
    expect(account.rows.map((r) => r.id)).toEqual(['sign-out', 'delete-account']);
    expect(account.rows.every((r) => r.kind === 'nav')).toBe(true);
    expect(account.rows.every((r) => r.destructive === true)).toBe(true);
  });
});

describe('buildSettingsModel — upgrade (always present)', () => {
  test('visible for free tier + IAP enabled (reason "visible")', () => {
    const m = buildSettingsModel(makeDeps({ tier: 'free' }));
    expect(m.upgrade).toBeDefined();
    expect(m.upgrade.visible).toBe(true);
    expect(m.upgrade.reason).toBe('visible');
    expect(m.upgrade.ctaLabel.startsWith('Upgrade to')).toBe(true);
    expect(m.upgrade.features.length).toBeGreaterThan(0);
  });

  test('ALWAYS present even when hidden: paid tier -> visible false, reason "already-paid"', () => {
    const m = buildSettingsModel(makeDeps({ tier: 'pro' }));
    expect(m.upgrade).toBeDefined();
    expect(m.upgrade.visible).toBe(false);
    expect(m.upgrade.reason).toBe('already-paid');
  });

  test('IAP disabled -> visible false, reason "iap-disabled"', () => {
    const config = makeConfig({
      inAppPurchases: {
        enabled: false,
        tiers: [
          { name: 'Free', features: ['Basic features'] },
          { name: 'Pro', features: ['Unlimited access'] },
        ],
      },
    });
    const m = buildSettingsModel(makeDeps({ config, tier: 'free' }));
    expect(m.upgrade).toBeDefined();
    expect(m.upgrade.visible).toBe(false);
    expect(m.upgrade.reason).toBe('iap-disabled');
  });
});

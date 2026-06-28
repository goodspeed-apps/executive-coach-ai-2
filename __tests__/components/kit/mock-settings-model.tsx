/**
 * GAS Template — mockSettingsModel factory
 *
 * Returns a valid `SettingsModel` (the shape from hooks/headless/useSettingsModel)
 * for the settings-variant stories + tests. Defaults to a free user with the
 * upgrade card VISIBLE and a couple of real rows per section so every variant has
 * something to render. Override any slice via the `over` partial.
 */

import type { SettingsModel } from '@/hooks/headless/useSettingsModel';

const noop = () => {};

export function mockSettingsModel(over: Partial<SettingsModel> = {}): SettingsModel {
  const base: SettingsModel = {
    profile: { displayName: 'Ada Lovelace', tierLabel: 'Free', showTierBadge: true },
    appearance: {
      visible: true,
      options: [
        { value: 'dark', label: 'Dark', active: false },
        { value: 'light', label: 'Light', active: true },
        { value: 'system', label: 'System', active: false },
      ],
      onSelect: noop,
    },
    sections: [
      {
        id: 'preferences',
        title: 'Preferences',
        rows: [
          {
            id: 'push-notifications',
            label: 'Push Notifications',
            kind: 'switch',
            value: true,
            onChange: noop,
          },
          {
            id: 'csv-export',
            label: 'Export Data (CSV)',
            kind: 'nav',
            onPress: noop,
            badge: 'Pro only',
          },
        ],
      },
      {
        id: 'help',
        title: 'Help',
        rows: [{ id: 'how-to-use', label: 'How To Use Acme', kind: 'nav', onPress: noop }],
      },
      {
        id: 'about',
        title: 'About',
        rows: [
          { id: 'rate-app', label: 'Rate on App Store', kind: 'nav', onPress: noop },
          { id: 'privacy', label: 'Privacy Policy', kind: 'nav', onPress: noop },
        ],
      },
      {
        id: 'account',
        title: 'Account',
        rows: [
          { id: 'sign-out', label: 'Sign Out', kind: 'nav', destructive: true, onPress: noop },
          {
            id: 'delete-account',
            label: 'Delete Account',
            kind: 'nav',
            destructive: true,
            onPress: noop,
          },
        ],
      },
    ],
    upgrade: {
      visible: true,
      reason: 'visible',
      title: 'Acme Pro',
      subtitle: 'Unlock the full experience',
      features: ['Unlimited exports', 'Priority support', 'Advanced analytics'],
      ctaLabel: 'Upgrade to Pro',
      accent: '#6366F1',
      purchasing: false,
      disabled: false,
      onUpgrade: noop,
      onRestore: noop,
    },
    footer: { appName: 'Acme', version: '1.0.0' },
    version: 'Acme v1.0.0',
  };

  return {
    ...base,
    ...over,
    // Deep-merge the upgrade slice so callers can flip a single field
    // (e.g. visible) without re-specifying the whole object.
    upgrade: { ...base.upgrade, ...(over.upgrade ?? {}) },
  };
}

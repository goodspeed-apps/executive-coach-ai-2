/**
 * GAS Template — Settings Variant Kit tests
 *
 * Parameterized contract test over every registered settings variant:
 *   (a) when model.upgrade.visible === true, the frozen 'Upgrade to Pro' button
 *       (accessibilityLabel) is present;
 *   (b) when model.upgrade.visible === false, it is absent AND the variant still
 *       mounts (no crash).
 *
 * Plus a golden parity test (SETTINGS_VARIANTS keys === SETTINGS_VARIANT_IDS)
 * and the fail-soft resolver test (unknown / undefined → grouped-cards).
 *
 * Mocks ThemeContext like Paywall.test.tsx so the variants get a stable palette.
 */

import React from 'react';
import { render } from '@testing-library/react-native';

// The shared setup.ts lucide mock only exports a subset of glyphs; the settings
// variants + SettingsRow use more (User, LogOut, BookOpen, …). Stub every icon
// the kit imports to a host string so the elements resolve (the contract is the
// label + role, never the glyph pixels). Test-file mocks override setup.ts.
jest.mock('lucide-react-native', () => ({
  User: 'User',
  Bell: 'Bell',
  Shield: 'Shield',
  LogOut: 'LogOut',
  Sun: 'Sun',
  Moon: 'Moon',
  Smartphone: 'Smartphone',
  BookOpen: 'BookOpen',
  HelpCircle: 'HelpCircle',
  Star: 'Star',
  Download: 'Download',
  ExternalLink: 'ExternalLink',
  FileText: 'FileText',
  Trash2: 'Trash2',
  ChevronRight: 'ChevronRight',
}));

jest.mock('../../../context/ThemeContext', () => ({
  useThemeColors: () => ({
    colors: {
      background: '#fff',
      surface: '#f5f5f5',
      text: '#000',
      textSecondary: '#666',
      primary: '#6366F1',
      border: '#ccc',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
    },
    resolved: 'light',
    preference: 'light',
    setTheme: jest.fn(),
  }),
}));

import {
  SETTINGS_VARIANTS,
  SETTINGS_VARIANT_IDS,
  DEFAULT_SETTINGS_VARIANT_ID,
  resolveSettingsVariant,
} from '@/components/kit/settings/registry';
import { SettingsGroupedCards } from '@/components/kit/settings/SettingsGroupedCards';
import { mockSettingsModel } from './mock-settings-model';

describe('settings variant kit', () => {
  const ids = Object.keys(SETTINGS_VARIANTS);

  describe.each(ids)('variant %s', (id) => {
    const Variant = SETTINGS_VARIANTS[id]!;

    it('renders the Upgrade to Pro button when upgrade.visible', async () => {
      const { queryByLabelText } = await render(
        <Variant model={mockSettingsModel({ upgrade: { visible: true } as any })} />,
      );
      expect(queryByLabelText('Upgrade to Pro')).toBeTruthy();
    });

    it('omits the Upgrade to Pro button (and still mounts) when not visible', async () => {
      const { queryByLabelText } = await render(
        <Variant model={mockSettingsModel({ upgrade: { visible: false } as any })} />,
      );
      expect(queryByLabelText('Upgrade to Pro')).toBeNull();
    });
  });

  it('golden: SETTINGS_VARIANTS keys match SETTINGS_VARIANT_IDS exactly', () => {
    expect(Object.keys(SETTINGS_VARIANTS).sort()).toEqual([...SETTINGS_VARIANT_IDS].sort());
  });

  it('exposes exactly 4 variant ids', () => {
    expect(SETTINGS_VARIANT_IDS).toHaveLength(4);
  });

  it('default id is grouped-cards', () => {
    expect(DEFAULT_SETTINGS_VARIANT_ID).toBe('grouped-cards');
  });

  describe('resolveSettingsVariant fail-soft', () => {
    it('resolves a known id to its component', () => {
      expect(resolveSettingsVariant('grouped-cards')).toBe(SETTINGS_VARIANTS['grouped-cards']);
    });

    it('fail-softs an unknown id to grouped-cards', () => {
      expect(resolveSettingsVariant('does-not-exist')).toBe(SettingsGroupedCards);
    });

    it('fail-softs undefined to grouped-cards', () => {
      expect(resolveSettingsVariant(undefined)).toBe(SettingsGroupedCards);
    });
  });
});

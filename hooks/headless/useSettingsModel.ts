/**
 * GAS Template, Settings Model (headless)
 *
 * Zero-JSX view-model for the settings screen. Phase 1 of per-app
 * screen-uniqueness: the declarative section tree + every IO/security handler
 * are extracted here so any settings variant renders from the same model and
 * the must-have `upgrade` paywall is ALWAYS present on the model (gate
 * must-have), even when hidden.
 *
 * Two exports:
 *   - buildSettingsModel(deps): PURE builder, no React, no side effects, config
 *     injected, assembles the declarative tree (unit-testable).
 *   - useSettingsModel(): wires the real hooks and MOVES the handlers verbatim
 *     from app/(tabs)/settings.tsx, then delegates to the builder.
 *
 * Imports are RELATIVE (the `hooks` jest project has no @/ mapper).
 */

import { useEffect, useRef, useState } from 'react';
import { Alert, Linking } from 'react-native';
import * as StoreReview from 'expo-store-review';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../useAuth';
import { useAnalytics } from '../useAnalytics';
import { useSubscription } from '../useSubscription';
import { trackScreenLoad } from '../../lib/performance';
import { captureException } from '../../lib/sentry';
import { requestAccountDeletion } from '../../services/api';
import { useThemeColors } from '../../context/ThemeContext';
import { useHelp } from '../../context/HelpContext';
import { gasConfig } from '../../gas.config';

// ─── Model types ──────────────────────────────────────────────────────────────

export interface SettingsRowModel {
  id: string;
  label: string;
  description?: string;
  kind: 'switch' | 'nav' | 'custom';
  value?: boolean;
  onChange?: (v: boolean) => void | Promise<void>;
  onPress?: () => void | Promise<void>;
  badge?: string;
  destructive?: boolean;
}

export interface SettingsSectionModel {
  id: string;
  title?: string;
  rows: SettingsRowModel[];
}

export interface SettingsUpgradeModel {
  visible: boolean;
  reason: 'visible' | 'iap-disabled' | 'already-paid' | 'no-pro-features';
  title: string;
  subtitle: string;
  features: string[];
  ctaLabel: string;
  accent: string;
  purchasing: boolean;
  disabled: boolean;
  onUpgrade: () => void | Promise<void>;
  onRestore: () => void | Promise<void>;
}

export interface SettingsModel {
  profile: { displayName: string; tierLabel: string; showTierBadge: boolean };
  appearance: {
    visible: boolean;
    options: { value: 'dark' | 'light' | 'system'; label: string; active: boolean }[];
    onSelect: (v: 'dark' | 'light' | 'system') => void;
  };
  sections: SettingsSectionModel[];
  upgrade: SettingsUpgradeModel;
  footer: { appName: string; version: string };
  version: string;
}

// ─── Pure builder deps ────────────────────────────────────────────────────────

/**
 * The injectable config slice the pure builder reads. Mirrors the parts of
 * gasConfig the screen used so tests can flip IAP on/off, swap tiers, etc.
 */
export interface SettingsModelConfig {
  app: { name: string; version: string };
  design: { colors: { primary: string } };
  features: {
    darkMode: { enabled: boolean };
    pushNotifications: { enabled: boolean };
    inAppPurchases: {
      enabled: boolean;
      tiers: { name: string; features?: string[] }[];
    };
    auth: { biometric: { enabled: boolean } };
    helpSystem: boolean;
    csvExport: boolean;
    compliance: { dataExport: boolean };
  };
  legal: { privacyUrl: string; termsUrl: string };
}

/**
 * Everything buildSettingsModel needs. All state + handlers are injected so the
 * builder stays pure (no React, no IO). The hook supplies the real values.
 */
export interface SettingsModelDeps {
  config: SettingsModelConfig;
  // Live state
  tier: string;
  displayName: string;
  themePreference: 'dark' | 'light' | 'system';
  notificationsEnabled: boolean;
  biometricAvailable: boolean;
  biometricEnabled: boolean;
  helpDismissed: boolean;
  purchasing: boolean;
  subLoading: boolean;
  // Handlers (moved verbatim into the hook)
  onSelectTheme: (v: 'dark' | 'light' | 'system') => void;
  toggleNotifications: (v: boolean) => void | Promise<void>;
  toggleBiometric: (v: boolean) => void | Promise<void>;
  csvExport: () => void | Promise<void>;
  howToUse: () => void | Promise<void>;
  resetHelp: () => void | Promise<void>;
  rateApp: () => void | Promise<void>;
  openPrivacy: () => void | Promise<void>;
  openTerms: () => void | Promise<void>;
  exportData: () => void | Promise<void>;
  signOut: () => void | Promise<void>;
  deleteAccount: () => void | Promise<void>;
  upgrade: () => void | Promise<void>;
  restore: () => void | Promise<void>;
}

const THEME_OPTION_LABELS: { value: 'dark' | 'light' | 'system'; label: string }[] = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' },
];

// ─── Pure builder ─────────────────────────────────────────────────────────────

/**
 * buildSettingsModel, PURE. Assembles the declarative settings tree from
 * injected state + handlers + config. No React, no side effects.
 *
 * The `upgrade` field is ALWAYS present (gate must-have); `upgrade.visible`
 * mirrors the exact today predicate at settings.tsx and a `reason` discriminator
 * explains why it is hidden otherwise.
 */
export function buildSettingsModel(deps: SettingsModelDeps): SettingsModel {
  const { config } = deps;
  const { inAppPurchases } = config.features;
  const primary = config.design.colors.primary;

  // --- Derived values (moved verbatim from settings.tsx) ---
  const tierLabel = deps.tier.charAt(0).toUpperCase() + deps.tier.slice(1);
  // isFreeUser keeps BOTH clauses: explicit 'free' OR the configured first tier.
  const isFreeUser =
    deps.tier === 'free' ||
    deps.tier === (inAppPurchases.tiers[0]?.name.toLowerCase() ?? 'free');

  // Pro features from the second tier (if available).
  const proTier = inAppPurchases.tiers[1];
  const proFeatures = proTier?.features ?? [];

  // --- Profile ---
  const profile = {
    displayName: deps.displayName,
    tierLabel,
    showTierBadge: inAppPurchases.enabled,
  };

  // --- Appearance ---
  const appearance = {
    visible: config.features.darkMode.enabled,
    options: THEME_OPTION_LABELS.map((o) => ({
      value: o.value,
      label: o.label,
      active: deps.themePreference === o.value,
    })),
    onSelect: deps.onSelectTheme,
  };

  // --- Preferences section ---
  const preferenceRows: SettingsRowModel[] = [];
  if (config.features.pushNotifications.enabled) {
    preferenceRows.push({
      id: 'push-notifications',
      label: 'Push Notifications',
      kind: 'switch',
      value: deps.notificationsEnabled,
      onChange: deps.toggleNotifications,
    });
  }
  if (config.features.auth.biometric.enabled && deps.biometricAvailable) {
    preferenceRows.push({
      id: 'biometric-lock',
      label: 'Biometric Lock',
      description: 'Locks app after 5 min background',
      kind: 'switch',
      value: deps.biometricEnabled,
      onChange: deps.toggleBiometric,
    });
  }
  if (config.features.csvExport) {
    preferenceRows.push({
      id: 'csv-export',
      label: 'Export Data (CSV)',
      kind: 'nav',
      onPress: deps.csvExport,
      badge: isFreeUser && inAppPurchases.enabled ? 'Pro only' : undefined,
    });
  }

  // --- Help section ---
  const helpRows: SettingsRowModel[] = [];
  if (config.features.helpSystem) {
    helpRows.push({
      id: 'how-to-use',
      label: `How To Use ${config.app.name}`,
      kind: 'nav',
      onPress: deps.howToUse,
    });
    if (deps.helpDismissed) {
      helpRows.push({
        id: 'show-help-icon',
        label: 'Show ? Help Icon',
        kind: 'nav',
        onPress: deps.resetHelp,
      });
    }
  }

  // --- About section (rate + legal + data export) ---
  const aboutRows: SettingsRowModel[] = [];
  aboutRows.push({
    id: 'rate-app',
    label: 'Rate on App Store',
    kind: 'nav',
    onPress: deps.rateApp,
  });
  const privacyUrl = config.legal?.privacyUrl?.trim() ?? '';
  const termsUrl = config.legal?.termsUrl?.trim() ?? '';
  if (privacyUrl !== '') {
    aboutRows.push({
      id: 'privacy',
      label: 'Privacy Policy',
      kind: 'nav',
      onPress: deps.openPrivacy,
    });
  }
  if (termsUrl !== '') {
    aboutRows.push({
      id: 'terms',
      label: 'Terms of Service',
      kind: 'nav',
      onPress: deps.openTerms,
    });
  }
  if (config.features.compliance.dataExport) {
    aboutRows.push({
      id: 'export-data',
      label: 'Export My Data',
      kind: 'nav',
      onPress: deps.exportData,
    });
  }

  // --- Account section ---
  const accountRows: SettingsRowModel[] = [
    {
      id: 'sign-out',
      label: 'Sign Out',
      kind: 'nav',
      destructive: true,
      onPress: deps.signOut,
    },
    {
      id: 'delete-account',
      label: 'Delete Account',
      kind: 'nav',
      destructive: true,
      onPress: deps.deleteAccount,
    },
  ];

  const sections: SettingsSectionModel[] = [
    { id: 'preferences', title: 'Preferences', rows: preferenceRows },
    { id: 'help', title: 'Help', rows: helpRows },
    { id: 'about', title: 'About', rows: aboutRows },
    { id: 'account', title: 'Account', rows: accountRows },
  ];

  // --- Upgrade (ALWAYS present; visible mirrors today's exact predicate) ---
  // settings.tsx render gate: inAppPurchases.enabled && isFreeUser && proFeatures.length > 0
  const visible = inAppPurchases.enabled && isFreeUser && proFeatures.length > 0;
  let reason: SettingsUpgradeModel['reason'] = 'visible';
  if (!inAppPurchases.enabled) {
    reason = 'iap-disabled';
  } else if (!isFreeUser) {
    reason = 'already-paid';
  } else if (proFeatures.length === 0) {
    reason = 'no-pro-features';
  }

  const upgrade: SettingsUpgradeModel = {
    visible,
    reason,
    title: `${config.app.name} ${proTier?.name ?? 'Pro'}`,
    subtitle: 'Unlock the full experience',
    features: proFeatures,
    ctaLabel: `Upgrade to ${proTier?.name ?? 'Pro'}`,
    accent: primary,
    purchasing: deps.purchasing,
    disabled: deps.purchasing || deps.subLoading,
    onUpgrade: deps.upgrade,
    onRestore: deps.restore,
  };

  const version = `${config.app.name} v${config.app.version}`;

  return {
    profile,
    appearance,
    sections,
    upgrade,
    footer: { appName: config.app.name, version: config.app.version },
    version,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

// --- AsyncStorage key for notification preference (moved verbatim) ---
const NOTIF_KEY = `@${gasConfig.app.slug}:notifications_enabled`;

/**
 * useSettingsModel, wires the real hooks and MOVES the ~9 handlers verbatim
 * from app/(tabs)/settings.tsx, then delegates to buildSettingsModel.
 */
export function useSettingsModel(): SettingsModel {
  // --- Hooks ---
  const { user, biometricAvailable, biometricEnabled, setBiometricPreference, signOut } = useAuth();
  const { track } = useAnalytics();
  const { tier, offerings, purchase, restore, isLoading: subLoading } = useSubscription();
  const { preference, setTheme } = useThemeColors();
  const { dismissed, reset: resetHelp } = useHelp();

  // --- Local state ---
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  // Config slice referenced by handleCSVExport / handleUpgrade below.
  const { inAppPurchases } = gasConfig.features;

  // --- Analytics: track screen view ---
  const screenStart = useRef(Date.now());
  useEffect(() => {
    track('settings_screen_viewed');
    trackScreenLoad('settings', screenStart.current);
  }, []);

  // --- Load notification preference from storage ---
  useEffect(() => {
    AsyncStorage.getItem(NOTIF_KEY).then((v) => {
      if (v !== null) setNotificationsEnabled(v === 'true');
    });
  }, []);

  // --- Handlers (moved verbatim) ---

  const handleToggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem(NOTIF_KEY, String(value));
    track('notifications_toggled', { enabled: value });
  };

  const handleToggleBiometric = async (value: boolean) => {
    await setBiometricPreference(value);
    track('biometric_toggled', { enabled: value });
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          track('signed_out');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will schedule deletion of your account and all associated data per the deletion policy in your data rights settings. You can cancel within the grace period.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              track('account_deletion_requested');
              await requestAccountDeletion();
              await signOut();
            } catch (err) {
              captureException(err, { context: 'account_deletion' });
              Alert.alert('Error', 'Failed to schedule deletion. Please try again or contact support.');
            }
          },
        },
      ],
    );
  };

  const handleRateApp = async () => {
    try {
      const isAvailable = await StoreReview.isAvailableAsync();
      if (isAvailable) {
        await StoreReview.requestReview();
        track('store_review_prompted');
      } else {
        // Fallback: open app store listing
        // DevAgent should replace this URL with the actual store listing
        Alert.alert('Rate Us', 'Thank you for your support! Rating is not available on this device.');
      }
    } catch {
      // Silently fail, store review is best-effort
    }
  };

  // Declared BEFORE csvExport: csvExport's Alert closes over handleUpgrade.
  const handleUpgrade = async () => {
    track('upgrade_tapped', { from: 'settings' });
    const current = offerings?.current;
    if (!current || current.availablePackages.length === 0) {
      Alert.alert('Upgrade', 'Subscriptions are being set up. Check back soon!', [{ text: 'OK' }]);
      return;
    }
    const pkg = current.availablePackages[0];
    if (!pkg) {
      Alert.alert('No packages', 'No packages available.');
      return;
    }
    try {
      setPurchasing(true);
      await purchase(pkg.identifier);
      Alert.alert('Welcome to Pro!', 'Your subscription is now active.', [{ text: 'Thanks!' }]);
    } catch (e: any) {
      if (!e?.userCancelled) {
        Alert.alert('Purchase failed', e?.message ?? 'Please try again.');
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setPurchasing(true);
      await restore();
      Alert.alert('Restored', 'Your purchases have been restored.', [{ text: 'OK' }]);
    } catch {
      Alert.alert('Restore failed', 'No purchases found to restore.', [{ text: 'OK' }]);
    } finally {
      setPurchasing(false);
    }
  };

  const handleExportData = () => {
    // TODO: DevAgent implements data export via Supabase edge function
    track('data_export_requested');
    Alert.alert(
      'Data Export',
      'Your data export has been requested. You will receive a download link via email.',
    );
  };

  const handleCSVExport = () => {
    if (tier === 'free' && inAppPurchases.enabled) {
      Alert.alert('Pro Feature', 'Upgrade to Pro to export your data as CSV.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Upgrade', onPress: handleUpgrade },
      ]);
      return;
    }
    // TODO: DevAgent implements CSV export
    track('csv_export_requested');
    Alert.alert('Export', 'CSV export is being prepared...');
  };

  const handleHowToUse = () => {
    // TODO: DevAgent connects this to a HowToUseModal
    track('how_to_use_tapped');
  };

  const handleOpenPrivacy = () => {
    const privacyUrl = gasConfig.legal?.privacyUrl?.trim() ?? '';
    Linking.openURL(privacyUrl);
    track('privacy_policy_tapped');
  };

  const handleOpenTerms = () => {
    const termsUrl = gasConfig.legal?.termsUrl?.trim() ?? '';
    Linking.openURL(termsUrl);
    track('terms_tapped');
  };

  // --- Derived value (moved verbatim) ---
  const displayName = user?.user_metadata?.full_name ?? user?.email ?? 'Account';

  return buildSettingsModel({
    config: gasConfig,
    tier,
    displayName,
    themePreference: preference,
    notificationsEnabled,
    biometricAvailable,
    biometricEnabled,
    helpDismissed: dismissed,
    purchasing,
    subLoading,
    onSelectTheme: setTheme,
    toggleNotifications: handleToggleNotifications,
    toggleBiometric: handleToggleBiometric,
    csvExport: handleCSVExport,
    howToUse: handleHowToUse,
    resetHelp,
    rateApp: handleRateApp,
    openPrivacy: handleOpenPrivacy,
    openTerms: handleOpenTerms,
    exportData: handleExportData,
    signOut: handleSignOut,
    deleteAccount: handleDeleteAccount,
    upgrade: handleUpgrade,
    restore: handleRestore,
  });
}

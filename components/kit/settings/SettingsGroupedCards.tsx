/**
 * GAS Template, Settings Variant: Grouped Cards (DEFAULT)
 *
 * Reproduces the original settings screen: a profile card, theme tri-toggle,
 * grouped Card sections (SectionHeader + SettingsRow), the upgrade paywall card
 * and an app-version footer. This is the byte-for-byte default look, the body
 * is the former app/(tabs)/settings.tsx render, now driven by `props.model`
 * (no hook calls beyond useThemeColors) with the upgrade card delegated to the
 * shared <UpgradeAffordance/> so the frozen contract button can't drift.
 */

import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Bell,
  Shield,
  LogOut,
  Sun,
  Moon,
  Smartphone,
  BookOpen,
  HelpCircle,
  Star,
  Download,
  ExternalLink,
  FileText,
  Trash2,
} from 'lucide-react-native';
import { useThemeColors } from '@/context/ThemeContext';
import { SettingsRow } from '@/components/ui/SettingsRow';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { gasConfig } from '../../../gas.config';
import { UpgradeAffordance } from './UpgradeAffordance';
import { Entrance } from '../motion/Entrance';
import type { SettingsVariantProps } from './types';

const primary = gasConfig.design.colors.primary;

// --- Icon lookup so the declarative rows keep their original glyphs ---
const THEME_ICONS: Record<'dark' | 'light' | 'system', typeof Sun> = {
  dark: Moon,
  light: Sun,
  system: Smartphone,
};

export function SettingsGroupedCards({ model: m }: SettingsVariantProps) {
  const { colors } = useThemeColors();

  const sectionById = (id: string) => m.sections.find((s) => s.id === id);
  const preferences = sectionById('preferences');
  const help = sectionById('help');
  const about = sectionById('about');
  const account = sectionById('account');

  // Per-row icon mapping (keeps the original glyphs + accent colors per row).
  const rowIcon: Record<string, { icon: typeof Sun; iconColor?: string; iconBgColor?: string }> = {
    'push-notifications': { icon: Bell },
    'biometric-lock': { icon: Shield, iconColor: colors.primary, iconBgColor: colors.primary + '15' },
    'csv-export': { icon: Download, iconColor: colors.success, iconBgColor: colors.success + '15' },
    'how-to-use': { icon: BookOpen },
    'show-help-icon': { icon: HelpCircle, iconColor: colors.textSecondary, iconBgColor: colors.surface },
    'rate-app': { icon: Star, iconColor: colors.warning, iconBgColor: colors.warning + '15' },
    privacy: { icon: FileText, iconColor: colors.textSecondary, iconBgColor: colors.textSecondary + '15' },
    terms: { icon: ExternalLink, iconColor: colors.textSecondary, iconBgColor: colors.textSecondary + '15' },
    'export-data': { icon: Download, iconColor: colors.primary, iconBgColor: colors.primary + '15' },
  };

  const tierColor =
    m.profile.tierLabel.toLowerCase() === 'free' ? colors.textSecondary : primary;

  return (
    <Entrance style={{ flex: 1 }}>
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Screen title */}
        <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 }}>
          <Text style={{ color: colors.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 }}>
            Settings
          </Text>
        </View>

        {/* ── Profile Card ── */}
        <View
          style={{
            marginHorizontal: 16,
            marginBottom: 24,
            backgroundColor: colors.surface,
            borderRadius: 20,
            padding: 20,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          {/* Avatar circle */}
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: primary + '18',
              borderWidth: 2,
              borderColor: primary + '30',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <User size={32} color={primary} />
          </View>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
            {m.profile.displayName}
          </Text>
          {/* Subscription tier badge */}
          {m.profile.showTierBadge && (
            <View
              style={{
                marginTop: 8,
                backgroundColor: tierColor + '18',
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 5,
                borderWidth: 1,
                borderColor: tierColor + '30',
              }}
            >
              <Text style={{ color: tierColor, fontSize: 12, fontWeight: '700' }}>
                {m.profile.tierLabel} Plan
              </Text>
            </View>
          )}
        </View>

        {/* ── Appearance ── */}
        {m.appearance.visible && (
          <>
            <SectionHeader title="Appearance" />
            <View
              style={{
                marginHorizontal: 16,
                backgroundColor: colors.surface,
                borderRadius: 20,
                overflow: 'hidden',
                marginBottom: 20,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', padding: 8, gap: 8 }}>
                {m.appearance.options.map((opt) => {
                  const Icon = THEME_ICONS[opt.value];
                  const active = opt.active;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        paddingVertical: 12,
                        borderRadius: 14,
                        backgroundColor: active ? primary + '18' : 'transparent',
                        borderWidth: 1,
                        borderColor: active ? primary + '40' : 'transparent',
                      }}
                      onPress={() => m.appearance.onSelect(opt.value)}
                      accessibilityLabel={`${opt.label} theme`}
                    >
                      <Icon size={18} color={active ? primary : colors.textSecondary} />
                      <Text
                        style={{
                          color: active ? primary : colors.textSecondary,
                          fontSize: 12,
                          fontWeight: '600',
                          marginTop: 5,
                        }}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
        )}

        {/* ── Preferences ── */}
        {preferences && preferences.rows.length > 0 && (
          <>
            <SectionHeader title={preferences.title ?? 'Preferences'} />
            <View
              style={{
                marginHorizontal: 16,
                backgroundColor: colors.surface,
                borderRadius: 20,
                overflow: 'hidden',
                marginBottom: 20,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              {preferences.rows.map((row, i) => {
                const meta = rowIcon[row.id];
                const showBorder = i < preferences.rows.length - 1;
                if (row.kind === 'switch') {
                  return (
                    <SettingsRow
                      key={row.id}
                      label={row.label}
                      description={row.description}
                      icon={meta?.icon}
                      iconColor={meta?.iconColor}
                      iconBgColor={meta?.iconBgColor}
                      switchValue={row.value}
                      onSwitchChange={row.onChange}
                      switchActiveColor={
                        row.id === 'biometric-lock' ? colors.primary + '80' : undefined
                      }
                      showBorder={showBorder}
                    />
                  );
                }
                return (
                  <SettingsRow
                    key={row.id}
                    label={row.label}
                    icon={meta?.icon}
                    iconColor={meta?.iconColor}
                    iconBgColor={meta?.iconBgColor}
                    onPress={row.onPress}
                    badge={row.badge}
                    badgeColor={colors.warning}
                    showBorder={showBorder}
                  />
                );
              })}
            </View>
          </>
        )}

        {/* ── Help ── */}
        {help && help.rows.length > 0 && (
          <>
            <SectionHeader title={help.title ?? 'Help'} />
            <View
              style={{
                marginHorizontal: 16,
                backgroundColor: colors.surface,
                borderRadius: 20,
                overflow: 'hidden',
                marginBottom: 20,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              {help.rows.map((row, i) => {
                const meta = rowIcon[row.id];
                const showBorder = i < help.rows.length - 1;
                return (
                  <SettingsRow
                    key={row.id}
                    label={row.label}
                    icon={meta?.icon}
                    iconColor={meta?.iconColor}
                    iconBgColor={meta?.iconBgColor}
                    onPress={row.onPress}
                    rightElement={
                      row.id === 'show-help-icon' ? (
                        <Text style={{ color: colors.textSecondary, fontSize: 12, marginRight: 4 }}>
                          Hidden
                        </Text>
                      ) : undefined
                    }
                    showBorder={showBorder}
                  />
                );
              })}
            </View>
          </>
        )}

        {/* ── Upgrade (rendered iff the model says it's visible) ── */}
        {m.upgrade.visible && (
          <View style={{ marginHorizontal: 16, marginBottom: 20 }}>
            <SectionHeader title="Upgrade" />
            <UpgradeAffordance upgrade={m.upgrade} />
          </View>
        )}

        {/* ── About (Rate & Legal) ── */}
        {about && about.rows.length > 0 && (
          <>
            <SectionHeader title={about.title ?? 'About'} />
            <View
              style={{
                marginHorizontal: 16,
                backgroundColor: colors.surface,
                borderRadius: 20,
                overflow: 'hidden',
                marginBottom: 20,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              {about.rows.map((row, i) => {
                const meta = rowIcon[row.id];
                const showBorder = i < about.rows.length - 1;
                return (
                  <SettingsRow
                    key={row.id}
                    label={row.label}
                    icon={meta?.icon}
                    iconColor={meta?.iconColor}
                    iconBgColor={meta?.iconBgColor}
                    onPress={row.onPress}
                    showBorder={showBorder}
                  />
                );
              })}
            </View>
          </>
        )}

        {/* ── Account actions ── */}
        {account && account.rows.length > 0 && (
          <>
            <SectionHeader title={account.title ?? 'Account'} />
            {account.rows.map((row) => {
              const isSignOut = row.id === 'sign-out';
              const iconColor = isSignOut ? colors.error : colors.error + '80';
              const Icon = isSignOut ? LogOut : Trash2;
              return (
                <TouchableOpacity
                  key={row.id}
                  style={{
                    marginHorizontal: 16,
                    backgroundColor: isSignOut ? colors.surface : undefined,
                    borderRadius: 20,
                    padding: 18,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: colors.border,
                    marginBottom: isSignOut ? 12 : 24,
                  }}
                  onPress={row.onPress}
                  accessibilityLabel={isSignOut ? 'Sign out' : 'Delete account'}
                >
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: isSignOut ? colors.error + '15' : colors.error + '10',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Icon size={18} color={iconColor} />
                  </View>
                  <Text style={{ color: iconColor, fontWeight: '600', fontSize: 15, flex: 1 }}>
                    {row.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* ── App version footer ── */}
        <View style={{ alignItems: 'center', paddingBottom: 16 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{m.version}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
    </Entrance>
  );
}

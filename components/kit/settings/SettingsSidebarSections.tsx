/**
 * GAS Template, Settings Variant: Sidebar Sections
 *
 * A two-pane layout: a left RAIL of section chips (Preferences / Help / About /
 * Account) and a right DETAIL pane that shows the rows for the active section.
 * Tapping a chip swaps the active section (local view state only, no behavior).
 * The upgrade paywall is PINNED in the detail pane (under the active rows) via
 * the shared <UpgradeAffordance/>. Profile + theme live in the rail header.
 *
 * Layout only, pure function of `{ model }`, themed via useThemeColors().
 */

import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User } from 'lucide-react-native';
import { useThemeColors } from '@/context/ThemeContext';
import { SettingsRow } from '@/components/ui/SettingsRow';
import { gasConfig } from '../../../gas.config';
import { UpgradeAffordance } from './UpgradeAffordance';
import { Entrance } from '../motion/Entrance';
import type { SettingsVariantProps } from './types';

const primary = gasConfig.design.colors.primary;

export function SettingsSidebarSections({ model: m }: SettingsVariantProps) {
  const { colors } = useThemeColors();

  const visibleSections = m.sections.filter((s) => s.rows.length > 0);
  const [activeId, setActiveId] = useState<string>(visibleSections[0]?.id ?? '');
  const active =
    visibleSections.find((s) => s.id === activeId) ?? visibleSections[0];

  return (
    <Entrance style={{ flex: 1 }}>
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* ── Left rail ── */}
        <View
          style={{
            width: 132,
            backgroundColor: colors.surface,
            borderRightWidth: 1,
            borderRightColor: colors.border,
            paddingTop: 12,
          }}
        >
          {/* Rail header: avatar + name */}
          <View style={{ alignItems: 'center', paddingHorizontal: 8, marginBottom: 16 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: primary + '18',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 6,
              }}
            >
              <User size={22} color={primary} />
            </View>
            <Text
              numberOfLines={1}
              style={{ color: colors.text, fontSize: 13, fontWeight: '700', textAlign: 'center' }}
            >
              {m.profile.displayName}
            </Text>
            {m.profile.showTierBadge && (
              <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 2 }}>
                {m.profile.tierLabel}
              </Text>
            )}
          </View>

          {/* Section chips */}
          {visibleSections.map((section) => {
            const isActive = section.id === active?.id;
            return (
              <TouchableOpacity
                key={section.id}
                onPress={() => setActiveId(section.id)}
                accessibilityRole="button"
                accessibilityLabel={`${section.title ?? section.id} section`}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  backgroundColor: isActive ? primary + '18' : 'transparent',
                  borderLeftWidth: 3,
                  borderLeftColor: isActive ? primary : 'transparent',
                }}
              >
                <Text
                  style={{
                    color: isActive ? primary : colors.textSecondary,
                    fontSize: 13,
                    fontWeight: isActive ? '700' : '500',
                  }}
                >
                  {section.title ?? section.id}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Theme toggle pinned to the rail bottom */}
          {m.appearance.visible && (
            <View style={{ paddingHorizontal: 8, marginTop: 16, gap: 6 }}>
              {m.appearance.options.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => m.appearance.onSelect(opt.value)}
                  accessibilityLabel={`${opt.label} theme`}
                  style={{
                    paddingVertical: 7,
                    borderRadius: 8,
                    alignItems: 'center',
                    backgroundColor: opt.active ? primary + '18' : 'transparent',
                    borderWidth: 1,
                    borderColor: opt.active ? primary + '40' : colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: opt.active ? primary : colors.textSecondary,
                      fontSize: 12,
                      fontWeight: '600',
                    }}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ── Detail pane ── */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 22,
              fontWeight: '800',
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 8,
            }}
          >
            {active?.title ?? active?.id ?? 'Settings'}
          </Text>

          {active?.rows.map((row, i) => {
            const showBorder = i < active.rows.length - 1;
            if (row.kind === 'switch') {
              return (
                <SettingsRow
                  key={row.id}
                  label={row.label}
                  description={row.description}
                  switchValue={row.value}
                  onSwitchChange={row.onChange}
                  showBorder={showBorder}
                />
              );
            }
            return (
              <SettingsRow
                key={row.id}
                label={row.label}
                onPress={row.onPress}
                badge={row.badge}
                badgeColor={row.destructive ? colors.error : colors.warning}
                showBorder={showBorder}
              />
            );
          })}

          {/* Upgrade pinned in the detail pane */}
          {m.upgrade.visible && (
            <View style={{ marginHorizontal: 16, marginTop: 24 }}>
              <UpgradeAffordance upgrade={m.upgrade} />
            </View>
          )}

          <View style={{ alignItems: 'center', paddingTop: 24 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{m.version}</Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
    </Entrance>
  );
}

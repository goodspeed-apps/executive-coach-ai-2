/**
 * GAS Template, Settings Variant: Flat List
 *
 * One continuous list, no grouped card stacks. Sections become inline header
 * dividers; every row is a flat full-bleed SettingsRow with a hairline under it.
 * The upgrade paywall is a PINNED banner at the bottom of the scroll, rendered
 * through the shared <UpgradeAffordance/>. Profile + theme toggle live in a slim
 * inline header rather than a floating card.
 *
 * Layout only, pure function of `{ model }`, themed via useThemeColors().
 */

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

export function SettingsFlatList({ model: m }: SettingsVariantProps) {
  const { colors } = useThemeColors();

  return (
    <Entrance style={{ flex: 1 }}>
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Slim inline header: avatar + name + tier inline */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 16,
            gap: 12,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: primary + '18',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <User size={22} color={primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>
              {m.profile.displayName}
            </Text>
            {m.profile.showTierBadge && (
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>
                {m.profile.tierLabel} Plan
              </Text>
            )}
          </View>
        </View>

        {/* Theme toggle as an inline segmented row (no card) */}
        {m.appearance.visible && (
          <View
            style={{
              flexDirection: 'row',
              marginHorizontal: 16,
              marginBottom: 8,
              gap: 8,
            }}
          >
            {m.appearance.options.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: opt.active ? primary + '18' : colors.surface,
                  borderWidth: 1,
                  borderColor: opt.active ? primary + '40' : colors.border,
                }}
                onPress={() => m.appearance.onSelect(opt.value)}
                accessibilityLabel={`${opt.label} theme`}
              >
                <Text
                  style={{
                    color: opt.active ? primary : colors.textSecondary,
                    fontSize: 13,
                    fontWeight: '600',
                  }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* All sections, flat, with inline dividers between sections */}
        {m.sections
          .filter((s) => s.rows.length > 0)
          .map((section) => (
            <View key={section.id}>
              {/* Inline section divider */}
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 12,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  paddingHorizontal: 20,
                  paddingTop: 18,
                  paddingBottom: 6,
                }}
              >
                {section.title ?? section.id}
              </Text>
              {section.rows.map((row, i) => {
                const showBorder = i < section.rows.length - 1;
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
            </View>
          ))}

        {/* Pinned upgrade banner */}
        {m.upgrade.visible && (
          <View style={{ marginHorizontal: 16, marginTop: 20 }}>
            <UpgradeAffordance upgrade={m.upgrade} />
          </View>
        )}

        {/* Version footer */}
        <View style={{ alignItems: 'center', paddingTop: 24 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{m.version}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
    </Entrance>
  );
}

/**
 * GAS Template, Settings Variant: Compact
 *
 * Maximum density: a single column with no card chrome, hairline dividers
 * between every row, tight vertical rhythm and a small inline profile line. The
 * theme toggle is a tiny inline segmented control. The upgrade paywall uses the
 * compact <UpgradeAffordance compact/> (title + single CTA, no feature list).
 *
 * Layout only, pure function of `{ model }`, themed via useThemeColors().
 */

import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/context/ThemeContext';
import { gasConfig } from '../../../gas.config';
import { UpgradeAffordance } from './UpgradeAffordance';
import { Entrance } from '../motion/Entrance';
import type { SettingsVariantProps } from './types';
import type { SettingsRowModel } from '@/hooks/headless/useSettingsModel';

const primary = gasConfig.design.colors.primary;

export function SettingsCompact({ model: m }: SettingsVariantProps) {
  const { colors } = useThemeColors();

  const hairline = {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  } as const;

  const renderRow = (row: SettingsRowModel) => {
    const rowColor = row.destructive ? colors.error : colors.text;
    if (row.kind === 'switch') {
      return (
        <TouchableOpacity
          key={row.id}
          onPress={() => row.onChange?.(!row.value)}
          accessibilityRole="button"
          accessibilityLabel={row.label}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 11,
            paddingHorizontal: 16,
            ...hairline,
          }}
        >
          <Text style={{ color: rowColor, fontSize: 14, flex: 1 }}>{row.label}</Text>
          {/* Dense on/off pill instead of a full Switch */}
          <View
            style={{
              paddingHorizontal: 10,
              paddingVertical: 3,
              borderRadius: 10,
              backgroundColor: row.value ? primary + '20' : colors.surface,
            }}
          >
            <Text
              style={{
                color: row.value ? primary : colors.textSecondary,
                fontSize: 11,
                fontWeight: '700',
              }}
            >
              {row.value ? 'ON' : 'OFF'}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        key={row.id}
        onPress={row.onPress}
        accessibilityRole="button"
        accessibilityLabel={row.label}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 11,
          paddingHorizontal: 16,
          ...hairline,
        }}
      >
        <Text style={{ color: rowColor, fontSize: 14, flex: 1 }}>{row.label}</Text>
        {row.badge && (
          <Text style={{ color: colors.warning, fontSize: 11, fontWeight: '600' }}>{row.badge}</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Entrance style={{ flex: 1 }}>
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Inline profile line */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            ...hairline,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', flex: 1 }}>
            {m.profile.displayName}
          </Text>
          {m.profile.showTierBadge && (
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{m.profile.tierLabel}</Text>
          )}
        </View>

        {/* Tiny inline theme segmented control */}
        {m.appearance.visible && (
          <View
            style={{
              flexDirection: 'row',
              paddingHorizontal: 16,
              paddingVertical: 8,
              gap: 6,
              ...hairline,
            }}
          >
            {m.appearance.options.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => m.appearance.onSelect(opt.value)}
                accessibilityLabel={`${opt.label} theme`}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 6,
                  borderRadius: 8,
                  backgroundColor: opt.active ? primary + '18' : 'transparent',
                  borderWidth: 1,
                  borderColor: opt.active ? primary + '40' : colors.border,
                }}
              >
                <Text
                  style={{
                    color: opt.active ? primary : colors.textSecondary,
                    fontSize: 11,
                    fontWeight: '600',
                  }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Dense sections: a small uppercase caption then hairline rows */}
        {m.sections
          .filter((s) => s.rows.length > 0)
          .map((section) => (
            <View key={section.id}>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 10,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  paddingHorizontal: 16,
                  paddingTop: 12,
                  paddingBottom: 4,
                }}
              >
                {section.title ?? section.id}
              </Text>
              {section.rows.map((row) => renderRow(row))}
            </View>
          ))}

        {/* Compact upgrade */}
        {m.upgrade.visible && (
          <View style={{ marginTop: 12 }}>
            <UpgradeAffordance upgrade={m.upgrade} compact />
          </View>
        )}

        {/* Version footer */}
        <View style={{ alignItems: 'center', paddingTop: 16 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{m.version}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
    </Entrance>
  );
}

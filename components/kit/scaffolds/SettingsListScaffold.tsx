/**
 * SettingsListScaffold ('settings-list')
 *
 * A generic CONTENT settings screen (DISTINCT from components/kit/settings/,
 * which is the auth-flow Settings variant kit): a profile row, grouped
 * rounded-card sections with a group header + rows (KitListRow), and a version
 * footer. This is also the DEFAULT scaffold resolveScaffold() fail-softs to, so
 * it must render safely for ANY data. Structure only, `data` is
 * { groups, profile, version }, every access guarded with defaults.
 */

import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/context/ThemeContext';
import { KitListRow } from '../primitives/KitListRow';
import { Entrance } from '../motion/Entrance';
import { pad, containerRadius } from '../../../lib/design-tokens';
import type { ScaffoldProps, SettingsGroup, SettingsRow } from './types';

interface SettingsData {
  profileName?: string;
  profileDetail?: string;
  groups?: SettingsGroup[];
  version?: string;
}

export function SettingsListScaffold({ header, actions, data, renderItem, testID }: ScaffoldProps<SettingsData>) {
  const { colors } = useThemeColors();
  const d = data ?? {};
  const groups: SettingsGroup[] = d.groups ?? [];

  return (
    <Entrance style={{ flex: 1 }}>
      <SafeAreaView edges={['top']} testID={testID} style={{ flex: 1, backgroundColor: colors.background }}>
        {header}
        <ScrollView contentContainerStyle={{ padding: pad(16), gap: pad(20) }}>
          {/* Profile row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: pad(12) }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: colors.surfaceSecondary,
              }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}>
                {d.profileName ?? 'Your account'}
              </Text>
              {d.profileDetail ? (
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{d.profileDetail}</Text>
              ) : null}
            </View>
          </View>

          {actions ? <View>{actions}</View> : null}

          {/* Grouped sections */}
          {groups.map((g, gi) => (
            <View key={g.id ?? gi} style={{ gap: 6 }}>
              {g.title ? (
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 12,
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    paddingHorizontal: 4,
                  }}
                >
                  {g.title}
                </Text>
              ) : null}
              <View
                style={{
                  borderRadius: containerRadius(),
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  overflow: 'hidden',
                  paddingHorizontal: 14,
                }}
              >
                {(g.rows ?? []).map((row: SettingsRow, ri) =>
                  renderItem ? (
                    <View key={row.id ?? ri}>{renderItem(row, ri)}</View>
                  ) : (
                    <KitListRow
                      key={row.id ?? ri}
                      title={row.label ?? ''}
                      trailing={row.value ?? undefined}
                    />
                  ),
                )}
              </View>
            </View>
          ))}

          {/* Version footer */}
          <View style={{ alignItems: 'center', paddingVertical: pad(12) }}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              {d.version ?? 'Version 1.0.0'}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Entrance>
  );
}

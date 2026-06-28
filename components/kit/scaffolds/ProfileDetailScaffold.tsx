/**
 * ProfileDetailScaffold ('profile-detail')
 *
 * A profile screen: a centered avatar header (avatar + name + handle + bio), a
 * 3-column stats row, an action-buttons row (the `actions` slot), and a content
 * region (the `primary` slot). Structure only, `data` is a ProfileData payload,
 * every access guarded with defaults.
 */

import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/context/ThemeContext';
import { Entrance } from '../motion/Entrance';
import { pad } from '../../../lib/design-tokens';
import type { ScaffoldProps, ProfileData, StatCell } from './types';
import { safeText } from '@/lib/format';

export function ProfileDetailScaffold({
  header,
  actions,
  primary,
  data,
  testID,
}: ScaffoldProps<ProfileData>) {
  const { colors } = useThemeColors();
  const p = data ?? {};
  const stats: StatCell[] = p.stats ?? [];

  return (
    <Entrance style={{ flex: 1 }}>
      <SafeAreaView edges={['top']} testID={testID} style={{ flex: 1, backgroundColor: colors.background }}>
        {header}
        <ScrollView contentContainerStyle={{ padding: pad(16), gap: pad(20) }}>
          {/* Centered avatar header */}
          <View style={{ alignItems: 'center', gap: 8 }}>
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                backgroundColor: colors.surfaceSecondary,
                borderWidth: 2,
                borderColor: colors.primary,
              }}
            />
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700' }}>
              {p.name ?? 'Your name'}
            </Text>
            {p.handle ? (
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{p.handle}</Text>
            ) : null}
            {p.bio ? (
              <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center' }}>
                {p.bio}
              </Text>
            ) : null}
          </View>

          {/* 3-col stats row */}
          {stats.length > 0 ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              {stats.slice(0, 3).map((s, i) => (
                <View key={s.label ?? i} style={{ alignItems: 'center' }}>
                  <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700' }}>
                    {safeText(s.value ?? ', ')}
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{s.label ?? ''}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Action buttons */}
          {actions ? <View style={{ flexDirection: 'row', gap: pad(12) }}>{actions}</View> : null}

          {/* Content region */}
          {primary}
        </ScrollView>
      </SafeAreaView>
    </Entrance>
  );
}

/**
 * DenseDashboardScaffold ('dense-dashboard')
 *
 * A numbers-as-visual dashboard: a hero summary KitSurface (big primary value +
 * change), a 2-column stat grid of KitCards, and a quick-actions row. Structure
 * only, `data` is a DashboardData payload, every access guarded with defaults.
 */

import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/context/ThemeContext';
import { KitSurface } from '../primitives/KitSurface';
import { KitCard } from '../primitives/KitCard';
import { Entrance } from '../motion/Entrance';
import { pad } from '../../../lib/design-tokens';
import type { ScaffoldProps, DashboardData, StatCell } from './types';
import { safeText } from '@/lib/format';

export function DenseDashboardScaffold({
  header,
  primary,
  actions,
  data,
  testID,
}: ScaffoldProps<DashboardData>) {
  const { colors } = useThemeColors();
  const d = data ?? {};
  const stats: StatCell[] = d.stats ?? [];

  return (
    <Entrance style={{ flex: 1 }}>
      <SafeAreaView edges={['top']} testID={testID} style={{ flex: 1, backgroundColor: colors.background }}>
        {header}
        <ScrollView contentContainerStyle={{ padding: pad(16), gap: pad(16) }}>
          {/* Hero summary */}
          <KitSurface padding={20}>
            <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '600' }}>
              {d.primaryLabel ?? 'Total'}
            </Text>
            <Text style={{ color: colors.text, fontSize: 40, fontWeight: '800', marginTop: 4 }}>
              {safeText(d.primaryValue ?? ', ')}
            </Text>
            {d.change ? (
              <Text style={{ color: colors.success, fontSize: 14, fontWeight: '600', marginTop: 2 }}>
                {d.change}
              </Text>
            ) : null}
          </KitSurface>

          {/* 2-col stat grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: pad(12) }}>
            {stats.map((s, i) => (
              <KitCard key={s.label ?? i} style={{ flexBasis: '47%', flexGrow: 1 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600' }}>
                  {s.label ?? ''}
                </Text>
                <Text style={{ color: colors.text, fontSize: 24, fontWeight: '700', marginTop: 4 }}>
                  {safeText(s.value ?? ', ')}
                </Text>
                {s.change ? (
                  <Text
                    style={{
                      color: s.trend === 'down' ? colors.error : colors.success,
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    {s.change}
                  </Text>
                ) : null}
              </KitCard>
            ))}
          </View>

          {primary}

          {/* Quick-actions row */}
          {actions ? <View style={{ flexDirection: 'row', gap: pad(12) }}>{actions}</View> : null}
        </ScrollView>
      </SafeAreaView>
    </Entrance>
  );
}

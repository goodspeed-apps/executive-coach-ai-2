/**
 * MapSplitScaffold ('map-split')
 *
 * A map + results screen: a search header, a map hero area, a horizontal row of
 * pill filters, and a results list of KitCards. Structure only, `data` is a
 * MapResult[] (or { results, filters }), every access guarded with defaults. A
 * `renderItem` override is honored for the result rows.
 */

import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/context/ThemeContext';
import { KitCard } from '../primitives/KitCard';
import { Entrance } from '../motion/Entrance';
import { pad } from '../../../lib/design-tokens';
import type { ScaffoldProps, MapResult } from './types';

type MapData = MapResult[] | { results?: MapResult[]; filters?: string[] };

function resultsOf(data?: MapData): MapResult[] {
  if (Array.isArray(data)) return data;
  return data?.results ?? [];
}
function filtersOf(data?: MapData): string[] {
  if (Array.isArray(data)) return [];
  return data?.filters ?? [];
}

export function MapSplitScaffold({ header, actions, data, renderItem, testID }: ScaffoldProps<MapData>) {
  const { colors } = useThemeColors();
  const results = resultsOf(data);
  const filters = filtersOf(data);

  return (
    <Entrance style={{ flex: 1 }}>
      <SafeAreaView edges={['top']} testID={testID} style={{ flex: 1, backgroundColor: colors.background }}>
        {header}
        {actions ? <View style={{ paddingHorizontal: pad(16) }}>{actions}</View> : null}

        {/* Map hero area */}
        <View
          style={{
            height: 220,
            margin: pad(16),
            borderRadius: 16,
            backgroundColor: colors.surfaceSecondary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Map</Text>
        </View>

        {/* Pill filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: pad(16), gap: pad(8) }}
        >
          {filters.map((f, i) => (
            <View
              key={`${f}-${i}`}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: colors.primaryMuted,
              }}
            >
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>{f}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Results list */}
        <ScrollView contentContainerStyle={{ padding: pad(16), gap: pad(12) }}>
          {results.map((res, i) =>
            renderItem ? (
              <View key={res.id ?? i}>{renderItem(res, i)}</View>
            ) : (
              <KitCard key={res.id ?? i}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>
                      {res.name ?? 'Result'}
                    </Text>
                    {res.detail ? (
                      <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>
                        {res.detail}
                      </Text>
                    ) : null}
                  </View>
                  {res.distance ? (
                    <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{res.distance}</Text>
                  ) : null}
                </View>
              </KitCard>
            ),
          )}
        </ScrollView>
      </SafeAreaView>
    </Entrance>
  );
}

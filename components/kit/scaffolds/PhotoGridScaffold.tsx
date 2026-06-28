/**
 * PhotoGridScaffold ('photo-grid')
 *
 * A gallery: a header, a horizontal stories row, a 3-column image grid, and a
 * footer counter. Structure only, `data` is a PhotoCell[] (or
 * { cells: PhotoCell[] }), every access guarded with defaults. A `renderItem`
 * override is honored for the grid cells.
 */

import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/context/ThemeContext';
import { Entrance } from '../motion/Entrance';
import { pad, radius } from '../../../lib/design-tokens';
import type { ScaffoldProps, PhotoCell } from './types';

type PhotoData = PhotoCell[] | { cells?: PhotoCell[] };

function cellsOf(data?: PhotoData): PhotoCell[] {
  if (Array.isArray(data)) return data;
  return data?.cells ?? [];
}

export function PhotoGridScaffold({ header, actions, data, renderItem, testID }: ScaffoldProps<PhotoData>) {
  const { colors } = useThemeColors();
  const cells = cellsOf(data);
  const r = radius('sm');

  return (
    <Entrance style={{ flex: 1 }}>
      <SafeAreaView edges={['top']} testID={testID} style={{ flex: 1, backgroundColor: colors.background }}>
        {header}
        {actions ? <View style={{ paddingHorizontal: pad(12) }}>{actions}</View> : null}

        {/* Stories row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: pad(12), paddingVertical: pad(8), gap: pad(12) }}
        >
          {cells.slice(0, 8).map((c, i) => (
            <View
              key={c.id ?? `story-${i}`}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                borderWidth: 2,
                borderColor: colors.primary,
                backgroundColor: colors.surfaceSecondary,
              }}
            />
          ))}
        </ScrollView>

        {/* 3-col grid */}
        <ScrollView contentContainerStyle={{ padding: pad(2) }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {cells.map((c, i) =>
              renderItem ? (
                <View key={c.id ?? i} style={{ width: '33.33%', aspectRatio: 1, padding: 2 }}>
                  {renderItem(c, i)}
                </View>
              ) : (
                <View key={c.id ?? i} style={{ width: '33.33%', aspectRatio: 1, padding: 2 }}>
                  <View style={{ flex: 1, borderRadius: r, backgroundColor: colors.surfaceSecondary }} />
                </View>
              ),
            )}
          </View>
        </ScrollView>

        {/* Footer counter */}
        <View style={{ padding: pad(12), alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
            {cells.length} {cells.length === 1 ? 'photo' : 'photos'}
          </Text>
        </View>
      </SafeAreaView>
    </Entrance>
  );
}

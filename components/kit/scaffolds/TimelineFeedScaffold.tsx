/**
 * TimelineFeedScaffold ('timeline-feed')
 *
 * A vertical timeline: a date header, then a column with a connecting rail, a
 * per-entry dot, and the entry content in a KitCard. Structure only, entries
 * come from `data.entries` (or a bare TimelineEntry[]); a `renderItem` override
 * is honored. Every access guarded with defaults.
 */

import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/context/ThemeContext';
import { KitCard } from '../primitives/KitCard';
import { Entrance } from '../motion/Entrance';
import { pad } from '../../../lib/design-tokens';
import type { ScaffoldProps, TimelineEntry } from './types';

type TimelineData = TimelineEntry[] | { entries?: TimelineEntry[] };

function entriesOf(data?: TimelineData): TimelineEntry[] {
  if (Array.isArray(data)) return data;
  return data?.entries ?? [];
}

export function TimelineFeedScaffold({ header, actions, data, renderItem, testID }: ScaffoldProps<TimelineData>) {
  const { colors } = useThemeColors();
  const entries = entriesOf(data);

  return (
    <Entrance style={{ flex: 1 }}>
      <SafeAreaView edges={['top']} testID={testID} style={{ flex: 1, backgroundColor: colors.background }}>
        {header}
        {actions ? <View style={{ paddingHorizontal: pad(16) }}>{actions}</View> : null}
        <ScrollView contentContainerStyle={{ padding: pad(16) }}>
          {entries.map((e, i) => {
            const last = i === entries.length - 1;
            return (
              <View key={e.id ?? i} style={{ flexDirection: 'row', gap: pad(12) }}>
                {/* Rail + dot */}
                <View style={{ alignItems: 'center', width: 16 }}>
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: colors.primary,
                      marginTop: 4,
                    }}
                  />
                  {!last ? (
                    <View style={{ flex: 1, width: 2, backgroundColor: colors.border, marginTop: 2 }} />
                  ) : null}
                </View>

                {/* Content */}
                <View style={{ flex: 1, paddingBottom: pad(16) }}>
                  {e.time ? (
                    <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4 }}>
                      {e.time}
                    </Text>
                  ) : null}
                  {renderItem ? (
                    renderItem(e, i)
                  ) : (
                    <KitCard>
                      <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600' }}>
                        {e.title ?? 'Event'}
                      </Text>
                      {e.body ? (
                        <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 4 }}>
                          {e.body}
                        </Text>
                      ) : null}
                    </KitCard>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </Entrance>
  );
}

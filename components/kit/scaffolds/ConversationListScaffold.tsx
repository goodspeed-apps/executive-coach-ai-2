/**
 * ConversationListScaffold ('conversation-list')
 *
 * A messaging inbox: a search header (the `header` slot), then a list of
 * KitListRow rows (name + preview, with a timestamp + unread badge pinned
 * trailing). Structure only, `data` is a ConversationRow[] (or
 * { rows: ConversationRow[] }), every access guarded with defaults. A
 * `renderItem` override is honored when supplied.
 */

import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/context/ThemeContext';
import { KitListRow } from '../primitives/KitListRow';
import { Entrance } from '../motion/Entrance';
import { pad } from '../../../lib/design-tokens';
import type { ScaffoldProps, ConversationRow } from './types';

type ConversationData = ConversationRow[] | { rows?: ConversationRow[] };

function rowsOf(data?: ConversationData): ConversationRow[] {
  if (Array.isArray(data)) return data;
  return data?.rows ?? [];
}

export function ConversationListScaffold({
  header,
  actions,
  data,
  renderItem,
  testID,
}: ScaffoldProps<ConversationData>) {
  const { colors } = useThemeColors();
  const rows = rowsOf(data);

  return (
    <Entrance style={{ flex: 1 }}>
      <SafeAreaView edges={['top']} testID={testID} style={{ flex: 1, backgroundColor: colors.background }}>
        {header}
        {actions ? <View style={{ paddingHorizontal: pad(16) }}>{actions}</View> : null}
        <ScrollView contentContainerStyle={{ paddingHorizontal: pad(16) }}>
          {rows.map((r, i) =>
            renderItem ? (
              <View key={r.id ?? i}>{renderItem(r, i)}</View>
            ) : (
              <KitListRow
                key={r.id ?? i}
                title={r.name ?? 'Unknown'}
                subtitle={r.preview ?? ''}
                trailing={
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                      {r.timestamp ?? ''}
                    </Text>
                    {r.unread ? (
                      <View
                        style={{
                          minWidth: 20,
                          height: 20,
                          paddingHorizontal: 6,
                          borderRadius: 10,
                          backgroundColor: colors.primary,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ color: colors.textOnPrimary, fontSize: 11, fontWeight: '700' }}>
                          {r.unread}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                }
              />
            ),
          )}
        </ScrollView>
      </SafeAreaView>
    </Entrance>
  );
}

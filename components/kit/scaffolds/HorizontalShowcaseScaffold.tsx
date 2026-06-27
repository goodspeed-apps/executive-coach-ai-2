/**
 * HorizontalShowcaseScaffold ('horizontal-showcase')
 *
 * A storefront / streaming home: a featured banner, multiple titled
 * horizontal-scroll sections of cards, and a chip grid at the bottom. Structure
 * only, `data` carries the featured copy + sections + chips, every access
 * guarded. A `renderItem` override is honored for the section cards.
 */

import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/context/ThemeContext';
import { KitCard } from '../primitives/KitCard';
import { Entrance } from '../motion/Entrance';
import { pad, containerRadius } from '../../../lib/design-tokens';
import type { ScaffoldProps, ShowcaseSection, ShowcaseCard } from './types';

interface ShowcaseData {
  featuredTitle?: string;
  featuredSubtitle?: string;
  sections?: ShowcaseSection[];
  chips?: string[];
}

export function HorizontalShowcaseScaffold({
  header,
  actions,
  data,
  renderItem,
  testID,
}: ScaffoldProps<ShowcaseData>) {
  const { colors } = useThemeColors();
  const d = data ?? {};
  const sections: ShowcaseSection[] = d.sections ?? [];
  const chips: string[] = d.chips ?? [];

  return (
    <Entrance style={{ flex: 1 }}>
      <SafeAreaView edges={['top']} testID={testID} style={{ flex: 1, backgroundColor: colors.background }}>
        {header}
        {actions ? <View style={{ paddingHorizontal: pad(16) }}>{actions}</View> : null}
        <ScrollView contentContainerStyle={{ paddingVertical: pad(16), gap: pad(20) }}>
          {/* Featured banner */}
          <View
            style={{
              height: 180,
              marginHorizontal: pad(16),
              borderRadius: containerRadius(),
              backgroundColor: colors.primaryMuted,
              padding: pad(20),
              justifyContent: 'flex-end',
            }}
          >
            <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>
              {d.featuredTitle ?? 'Featured'}
            </Text>
            {d.featuredSubtitle ? (
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{d.featuredSubtitle}</Text>
            ) : null}
          </View>

          {/* Titled horizontal sections */}
          {sections.map((sec, si) => (
            <View key={sec.id ?? si} style={{ gap: pad(10) }}>
              <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700', paddingHorizontal: pad(16) }}>
                {sec.title ?? 'Section'}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: pad(16), gap: pad(12) }}
              >
                {(sec.cards ?? []).map((c: ShowcaseCard, ci) =>
                  renderItem ? (
                    <View key={c.id ?? ci}>{renderItem(c, ci)}</View>
                  ) : (
                    <KitCard key={c.id ?? ci} style={{ width: 140 }}>
                      <View
                        style={{
                          height: 80,
                          borderRadius: 8,
                          backgroundColor: colors.surfaceSecondary,
                          marginBottom: 8,
                        }}
                      />
                      <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }} numberOfLines={1}>
                        {c.title ?? 'Item'}
                      </Text>
                      {c.subtitle ? (
                        <Text style={{ color: colors.textSecondary, fontSize: 12 }} numberOfLines={1}>
                          {c.subtitle}
                        </Text>
                      ) : null}
                    </KitCard>
                  ),
                )}
              </ScrollView>
            </View>
          ))}

          {/* Chip grid */}
          {chips.length > 0 ? (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: pad(8),
                paddingHorizontal: pad(16),
              }}
            >
              {chips.map((chip, i) => (
                <View
                  key={`${chip}-${i}`}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ color: colors.text, fontSize: 13 }}>{chip}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </Entrance>
  );
}

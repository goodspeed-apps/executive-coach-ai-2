/**
 * MediaPlayerScaffold ('media-player')
 *
 * A now-playing screen: a large album-art area, track title/artist, a progress
 * region (track + elapsed/duration), centered transport controls (the `actions`
 * slot), and a bottom actions row (the `secondary` slot). Structure only, 
 * `data` is a TrackData payload, every access guarded with defaults.
 */

import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/context/ThemeContext';
import { KitSurface } from '../primitives/KitSurface';
import { Entrance } from '../motion/Entrance';
import { pad } from '../../../lib/design-tokens';
import type { ScaffoldProps, TrackData } from './types';

export function MediaPlayerScaffold({
  header,
  actions,
  secondary,
  data,
  testID,
}: ScaffoldProps<TrackData>) {
  const { colors } = useThemeColors();
  const t = data ?? {};
  const progress = Math.max(0, Math.min(1, t.progress ?? 0));

  return (
    <Entrance style={{ flex: 1 }}>
      <SafeAreaView edges={['top']} testID={testID} style={{ flex: 1, backgroundColor: colors.background }}>
        {header}
        <View style={{ flex: 1, padding: pad(24), justifyContent: 'center', gap: pad(24) }}>
          {/* Album-art area */}
          <KitSurface
            style={{
              aspectRatio: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.surfaceSecondary,
            }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
              {t.album ?? 'Now Playing'}
            </Text>
          </KitSurface>

          {/* Title / artist */}
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={{ color: colors.text, fontSize: 22, fontWeight: '700' }}>
              {t.title ?? 'Untitled'}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 15 }}>
              {t.artist ?? 'Unknown artist'}
            </Text>
          </View>

          {/* Progress region */}
          <View style={{ gap: 6 }}>
            <View style={{ height: 4, borderRadius: 2, backgroundColor: colors.border }}>
              <View
                style={{
                  width: `${progress * 100}%`,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: colors.primary,
                }}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{t.elapsed ?? '0:00'}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{t.duration ?? '0:00'}</Text>
            </View>
          </View>

          {/* Centered transport controls */}
          {actions ? (
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: pad(24) }}>
              {actions}
            </View>
          ) : null}
        </View>

        {/* Bottom actions */}
        {secondary ? (
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: pad(16) }}>
            {secondary}
          </View>
        ) : null}
      </SafeAreaView>
    </Entrance>
  );
}

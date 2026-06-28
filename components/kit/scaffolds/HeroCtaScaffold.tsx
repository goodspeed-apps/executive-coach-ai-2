/**
 * HeroCtaScaffold ('hero-cta')
 *
 * A landing / onboarding screen: a big hero area with an overlaid headline, a
 * primary CTA (the `actions` slot), and a social-proof row below. Structure
 * only, `data` carries the headline/subhead/proof copy, every access guarded.
 */

import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/context/ThemeContext';
import { Entrance } from '../motion/Entrance';
import { pad, containerRadius } from '../../../lib/design-tokens';
import type { ScaffoldProps } from './types';

interface HeroData {
  eyebrow?: string;
  headline?: string;
  subhead?: string;
  proof?: string;
}

export function HeroCtaScaffold({ header, actions, primary, data, testID }: ScaffoldProps<HeroData>) {
  const { colors } = useThemeColors();
  const d = data ?? {};

  return (
    <Entrance style={{ flex: 1 }}>
      <SafeAreaView edges={['top']} testID={testID} style={{ flex: 1, backgroundColor: colors.background }}>
        {header}
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {/* Hero area with overlaid headline */}
          <View
            style={{
              minHeight: 320,
              margin: pad(16),
              borderRadius: containerRadius(),
              backgroundColor: colors.primaryMuted,
              padding: pad(28),
              justifyContent: 'flex-end',
              gap: 8,
            }}
          >
            {d.eyebrow ? (
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700', letterSpacing: 1 }}>
                {d.eyebrow.toUpperCase()}
              </Text>
            ) : null}
            <Text style={{ color: colors.text, fontSize: 34, fontWeight: '800' }}>
              {d.headline ?? 'Welcome'}
            </Text>
            {d.subhead ? (
              <Text style={{ color: colors.textSecondary, fontSize: 16 }}>{d.subhead}</Text>
            ) : null}
          </View>

          {primary}

          {/* Primary CTA */}
          {actions ? <View style={{ paddingHorizontal: pad(16), gap: pad(12) }}>{actions}</View> : null}

          {/* Social-proof row */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              padding: pad(20),
              gap: 8,
            }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
              {d.proof ?? 'Trusted by thousands'}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Entrance>
  );
}

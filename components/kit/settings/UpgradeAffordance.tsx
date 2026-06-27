/**
 * GAS Template, UpgradeAffordance
 *
 * The SINGLE source of the contract upgrade button. Every settings variant
 * renders the paywall CTA through this component so the FROZEN
 * SELECTOR_CONTRACT.settings.upgrade pair, accessibilityRole="button" +
 * accessibilityLabel="Upgrade to Pro", can never drift across the 4 variants.
 * (Today's settings.tsx upgrade button carries the LABEL but not the ROLE; this
 * component adds the role.)
 *
 * Returns null when `!upgrade.visible` so a variant can drop it in unconditionally
 * and the gate (must-have) just falls away for paid / IAP-disabled users.
 *
 * Layout only, themed via useThemeColors() + `upgrade.accent`. Pass `compact`
 * for the dense (compact) variant; the contract pair is identical either way.
 */

import { View, Text, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';
import { useThemeColors } from '@/context/ThemeContext';
import type { SettingsModel } from './types';

interface UpgradeAffordanceProps {
  upgrade: SettingsModel['upgrade'];
  /** Dense rendering for the compact variant. The contract pair is unchanged. */
  compact?: boolean;
}

export function UpgradeAffordance({ upgrade, compact }: UpgradeAffordanceProps) {
  const { colors } = useThemeColors();

  if (!upgrade.visible) return null;

  const accent = upgrade.accent;

  if (compact) {
    // Dense: title row + a single full-width CTA, no feature list, hairline frame.
    return (
      <View
        style={{
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: colors.border,
          paddingVertical: 14,
          paddingHorizontal: 16,
          gap: 8,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Star size={16} color={accent} />
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15, flex: 1 }}>
            {upgrade.title}
          </Text>
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: accent,
            borderRadius: 10,
            paddingVertical: 12,
            alignItems: 'center',
            opacity: upgrade.purchasing ? 0.6 : 1,
          }}
          onPress={upgrade.onUpgrade}
          disabled={upgrade.disabled}
          accessibilityRole="button"
          accessibilityLabel="Upgrade to Pro"
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 15 }}>
            {upgrade.purchasing ? 'Processing...' : upgrade.ctaLabel}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={upgrade.onRestore} style={{ alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Restore purchases</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Full card: title + subtitle + feature list + CTA + restore.
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: accent + '30',
      }}
    >
      {/* Accent bar at top */}
      <View style={{ height: 3, backgroundColor: accent }} />
      <View style={{ padding: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Star size={18} color={accent} style={{ marginRight: 8 }} />
          <Text style={{ color: colors.text, fontWeight: '800', fontSize: 18 }}>
            {upgrade.title}
          </Text>
        </View>
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 16 }}>
          {upgrade.subtitle}
        </Text>

        {/* Feature list */}
        {upgrade.features.map((f) => (
          <View key={f} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: colors.success + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 10,
              }}
            >
              <Text style={{ color: colors.success, fontSize: 11, fontWeight: '800' }}>{'✓'}</Text>
            </View>
            <Text style={{ color: colors.text, fontSize: 14 }}>{f}</Text>
          </View>
        ))}

        {/* Purchase button, the frozen contract control */}
        <TouchableOpacity
          style={{
            backgroundColor: accent,
            borderRadius: 14,
            padding: 16,
            alignItems: 'center',
            marginTop: 8,
            opacity: upgrade.purchasing ? 0.6 : 1,
          }}
          onPress={upgrade.onUpgrade}
          disabled={upgrade.disabled}
          accessibilityRole="button"
          accessibilityLabel="Upgrade to Pro"
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>
            {upgrade.purchasing ? 'Processing...' : upgrade.ctaLabel}
          </Text>
        </TouchableOpacity>

        {/* Restore purchases */}
        <TouchableOpacity
          onPress={upgrade.onRestore}
          style={{ alignItems: 'center', paddingTop: 12 }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Restore purchases</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

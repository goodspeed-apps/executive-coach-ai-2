import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Lock, FileText, ChevronRight } from 'lucide-react-native';
import { useThemeColors } from '@/context/ThemeContext';
import { KitPressable, KitCard } from '@/components/kit';

export interface RetroItem {
  id: string;
  week_start_date: string;
  week_end_date: string;
  quality_rating: number | null;
  is_locked: boolean;
  summary_text: string | null;
}

function fmt(d: string): string {
  try {
    return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch { return d; }
}

export function RetroRow({ item, onPress }: { item: RetroItem; onPress: () => void }) {
  const c = useThemeColors();
  const styles = makeStyles(c);
  const quality = (item.quality_rating ?? 0).toFixed(1);

  return (
    <KitPressable
      onPress={onPress}
      accessibilityLabel={`Retrospective ${fmt(item.week_start_date)} to ${fmt(item.week_end_date)}`}
      accessibilityHint={item.is_locked ? 'Locked. Opens upgrade options.' : 'Opens this weekly review'}
    >
      <KitCard>
        <View style={styles.row}>
          <View style={[styles.lead, { backgroundColor: item.is_locked ? c.surfaceElevated : c.primaryMuted }]}>
            {item.is_locked
              ? <Lock size={18} color={c.textFaint} />
              : <FileText size={18} color={c.primary} />}
          </View>
          <View style={styles.body}>
            <Text style={styles.week} numberOfLines={1}>
              {fmt(item.week_start_date)}-{fmt(item.week_end_date)}
            </Text>
            <Text style={styles.sub} numberOfLines={1}>
              {item.is_locked
                ? 'Locked, unlock retrospectives'
                : (item.summary_text ?? 'Tap to read your review')}
            </Text>
          </View>
          {item.is_locked ? (
            <View style={styles.badge}><Text style={styles.badgeText}>Unlock</Text></View>
          ) : (
            <View style={[styles.badge, { backgroundColor: c.secondaryMuted }]}>
              <Text style={[styles.badgeText, { color: c.secondary }]}>{quality}★</Text>
            </View>
          )}
          <ChevronRight size={18} color={c.textFaint} />
        </View>
      </KitCard>
    </KitPressable>
  );
}

function makeStyles(c: ReturnType<typeof useThemeColors>) {
  return StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    lead: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
    body: { flex: 1 },
    week: { fontFamily: 'Outfit_600SemiBold', fontSize: 15, color: c.text },
    sub: { fontFamily: 'Manrope_400Regular', fontSize: 12, color: c.textMuted, marginTop: 2 },
    badge: { backgroundColor: c.primaryMuted, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    badgeText: { fontFamily: 'Outfit_600SemiBold', fontSize: 11, color: c.primary },
  });
}

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { KitCard } from '@/components/kit';
import { CoachSeat } from '@/components/CoachSeat';
import { useThemeColors } from '@/context/ThemeContext';
import { Spacing } from '@/lib/theme';

interface Props {
  greeting: string;
  body?: string;
  pulse?: boolean;
  delay?: number;
  children?: React.ReactNode;
}

export function NoteCard({ greeting, body, pulse, delay = 0, children }: Props) {
  const colors = useThemeColors();
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <KitCard style={{ backgroundColor: colors.accent, borderColor: colors.accent }}>
        <View style={styles.row}>
          <CoachSeat pulse={pulse} size={48} />
          <View style={styles.textCol}>
            <Animated.Text
              entering={FadeInDown.delay(delay + 60)}
              style={[styles.greeting, { color: colors.surfaceDark }]}
            >
              {greeting}
            </Animated.Text>
            {body ? (
              <Animated.Text
                entering={FadeInDown.delay(delay + 120)}
                style={[styles.body, { color: colors.surfaceDark }]}
              >
                {body}
              </Animated.Text>
            ) : null}
          </View>
        </View>
        {children ? <View style={styles.children}>{children}</View> : null}
      </KitCard>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.lg, alignItems: 'flex-start' },
  textCol: { flex: 1, gap: Spacing.sm, paddingTop: Spacing.xs },
  greeting: { fontFamily: 'Outfit_700Bold', fontSize: 20, lineHeight: 26 },
  body: { fontFamily: 'Manrope_400Regular', fontSize: 16, lineHeight: 22 },
  children: { marginTop: Spacing.lg },
});

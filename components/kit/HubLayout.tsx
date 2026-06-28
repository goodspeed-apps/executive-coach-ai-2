/**
 * HubLayout, Hub-and-spoke launcher grid overlay.
 *
 * Rendered as an absolutely-positioned SIBLING of a hidden-bar <Tabs> (NOT a
 * children-wrapper, <Tabs> owns its file-routed screens). The grid shows only
 * at the launcher root (the (tabs) group root = the first tab) and returns null
 * on every spoke screen, so once a spoke is open the underlying Tabs screen is
 * visible with no overlay.
 *
 * Tapping a tile navigates (NOT pushes) to that spoke's file-routed screen.
 */

import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useSegments } from 'expo-router';
import { useThemeColors } from '@/context/ThemeContext';
import { resolveIcon } from '@/components/kit/icon-map';
import { hubSpokesFromTabs, hubSpokeHref } from '@/lib/navigation-pattern';
import { gasConfig } from '../../gas.config';

export function HubLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { colors } = useThemeColors();
  const primary = gasConfig.design.colors.primary;
  const spokes = hubSpokesFromTabs(gasConfig.navigation.tabs);

  // Launcher root = exactly the (tabs) group root (the first tab).
  // useSegments() === ['(tabs)'] (length 1) there; any spoke deepens it.
  const atHubRoot = segments[0] === '(tabs)' && segments.length < 2;
  if (!atHubRoot) return null;

  return (
    <SafeAreaView
      style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]}
      testID="nav-hub-root"
      edges={['top']}
    >
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text
          accessibilityRole="header"
          style={{ fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 16 }}
        >
          {gasConfig.app.name}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {spokes.map((spoke) => {
            const Icon = resolveIcon(spoke.icon);
            return (
              <Pressable
                key={spoke.id}
                testID={`hub-spoke-${spoke.id}`}
                accessibilityRole="button"
                accessibilityLabel={spoke.label}
                onPress={() => router.navigate(hubSpokeHref(spoke) as never)}
                style={{
                  width: '47%',
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  borderRadius: 16,
                  padding: 20,
                  gap: 12,
                }}
              >
                <Icon size={28} color={primary} />
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                  {spoke.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

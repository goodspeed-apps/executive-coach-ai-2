/**
 * NavigatorSwitch, the one place the app's navigator pattern is chosen.
 *
 * Reads gasConfig.navigation.navigationPattern (build-time static) and mounts
 * exactly ONE navigator over the SAME app/(tabs)/*.tsx screen files:
 *   - 'tab-bar' (default): the classic bottom <Tabs> (byte-equivalent to the
 *      original (tabs)/_layout body).
 *   - 'drawer': an expo-router <Drawer> with a hamburger header; hidden screens
 *      are removed from the drawer via drawerItemStyle (NOT href:null).
 *   - 'hub-and-spoke': a <Tabs> with its bar hidden PLUS an absolutely-positioned
 *      sibling <HubLayout/> launcher grid, so the spoke screens still render
 *      under the overlay.
 *
 * The (tabs) route group is never renamed, swapping the navigator INSIDE the
 * group is the only seam that preserves every /(tabs)/... redirect in the app.
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useThemeColors } from '@/context/ThemeContext';
import { resolveIcon, type LucideIcon } from '@/components/kit/icon-map';
import { HubLayout } from '@/components/kit/HubLayout';
import { resolveNavigationPattern } from '@/lib/navigation-pattern';
import { gasConfig } from '../../gas.config';

/**
 * TabIcon, Renders a lucide icon at the standard tab bar size.
 * Used internally by the tab bar for each tab's icon.
 */
const TabIcon = React.memo(function TabIcon({ Icon, color }: { Icon: LucideIcon; color: string }) {
  return <Icon size={24} color={color} />;
});

// --- Config ---
const tabs = gasConfig.navigation.tabs;
const pattern = resolveNavigationPattern(gasConfig.navigation);

/**
 * TabsNavigator, the classic bottom tab bar.
 *
 * Tab bar appearance:
 * - Dark background matching the theme
 * - Primary color for active tab
 * - Muted color for inactive tabs
 * - 1px top border
 *
 * When `hideBar` is true the bar is collapsed (hub-and-spoke uses this so the
 * screens still mount under the HubLayout overlay).
 */
function TabsNavigator({ hideBar = false }: { hideBar?: boolean }) {
  const { colors } = useThemeColors();
  const primary = gasConfig.design.colors.primary;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: hideBar
          ? { display: 'none' }
          : {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              borderTopWidth: 1,
            },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      {/* Render configured tabs */}
      {tabs.map((tab) => {
        const Icon = resolveIcon(tab.icon);
        return (
          <Tabs.Screen
            key={tab.id}
            name={tab.file}
            options={{
              title: tab.label,
              tabBarIcon: ({ color }) => <TabIcon Icon={Icon} color={color} />,
            }}
          />
        );
      })}

      {/* Hide screens listed in hiddenScreens (still navigable, just not in tab bar) */}
      {gasConfig.navigation.hiddenScreens.map((screen) => (
        <Tabs.Screen key={`hidden-${screen}`} name={screen} options={{ href: null }} />
      ))}

      {/* Hide the placeholder screen from the tab bar (it's a reference, not a real tab) */}
      <Tabs.Screen name="placeholder" options={{ href: null }} />
    </Tabs>
  );
}

/**
 * DrawerNavigator, a side drawer over the SAME (tabs) screen files.
 *
 * headerShown:true so the hamburger that opens the drawer is reachable. Hidden
 * screens + the placeholder are removed from the drawer list via
 * drawerItemStyle:{display:'none'} (a Drawer has no href:null affordance).
 */
function DrawerNavigator() {
  const { colors } = useThemeColors();
  const primary = gasConfig.design.colors.primary;

  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: primary,
        drawerInactiveTintColor: colors.textSecondary,
        drawerStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
      }}
    >
      {/* Render configured tabs as drawer items */}
      {tabs.map((tab) => {
        const Icon = resolveIcon(tab.icon);
        return (
          <Drawer.Screen
            key={tab.id}
            name={tab.file}
            options={{
              title: tab.label,
              drawerLabel: tab.label,
              drawerIcon: ({ color }) => <TabIcon Icon={Icon} color={color} />,
            }}
          />
        );
      })}

      {/* Hide screens listed in hiddenScreens from the drawer list (still navigable) */}
      {gasConfig.navigation.hiddenScreens.map((screen) => (
        <Drawer.Screen
          key={`hidden-${screen}`}
          name={screen}
          options={{ drawerItemStyle: { display: 'none' } }}
        />
      ))}

      {/* Hide the placeholder screen from the drawer (it's a reference, not a real screen) */}
      <Drawer.Screen name="placeholder" options={{ drawerItemStyle: { display: 'none' } }} />
    </Drawer>
  );
}

/**
 * HubNavigator, hidden-bar <Tabs> plus the absolutely-positioned HubLayout grid.
 * The grid sits at the launcher root; spoke screens render under it via the Tabs.
 */
function HubNavigator() {
  return (
    <>
      <TabsNavigator hideBar />
      <HubLayout />
    </>
  );
}

/**
 * NavigatorSwitch, pick the navigator from the configured pattern.
 * Wrapped in ErrorBoundary for crash resilience (mirrors the original layout).
 */
export function NavigatorSwitch() {
  return (
    <ErrorBoundary>
      {pattern === 'drawer' ? (
        <DrawerNavigator />
      ) : pattern === 'hub-and-spoke' ? (
        <HubNavigator />
      ) : (
        <TabsNavigator />
      )}
    </ErrorBoundary>
  );
}

export default NavigatorSwitch;

// Re-export so any remaining (tabs)/_layout consumers can reach the shared resolver.
export { resolveIcon };

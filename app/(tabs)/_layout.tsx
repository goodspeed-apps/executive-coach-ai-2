/**
 * GAS Template, (tabs) group layout (delegates to NavigatorSwitch).
 *
 * The actual navigator is chosen by gasConfig.navigation.navigationPattern:
 * Tabs (default), Drawer, or hub-and-spoke. All three mount over the SAME
 * app/(tabs)/*.tsx screen files, this group is the only correct seam to swap
 * the navigator, since /(tabs)/... redirects are hardcoded across the app
 * (cold-load-redirect, _layout in-group redirect, auth/callback, password
 * recovery). See components/kit/NavigatorSwitch.tsx for the switch + the
 * byte-equivalent tab-bar branch, and components/kit/icon-map.ts for the
 * shared lucide icon resolution.
 *
 * Dependencies: NavigatorSwitch (Tabs/Drawer/Hub), gasConfig.navigation.
 */

export { NavigatorSwitch as default } from '@/components/kit/NavigatorSwitch';

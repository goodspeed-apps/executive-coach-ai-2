/**
 * navigation-pattern (app project) — NavigatorSwitch mounts the right navigator.
 *
 * NavigatorSwitch reads gasConfig at MODULE scope, so each case drives the
 * pattern with jest.isolateModules + jest.doMock('../../gas.config', ...) and a
 * fresh require of the component. The app project has no global mapper for
 * expo-router / expo-router/drawer / lucide, so we inline-mock them (mirrors
 * __tests__/app/auth-variant-contract.test.tsx). Tabs and Drawer are identity
 * host components whose <.Screen name> registrations are recorded so we can
 * assert WHICH navigator received the (tabs) screen files.
 */

import React from 'react';
import { render } from '@testing-library/react-native';

// --- Recorders: which navigator registered which screen names ---
const recorder = {
  tabsScreens: [] as string[],
  drawerScreens: [] as string[],
  tabsRendered: 0,
  drawerRendered: 0,
};

// expo-router: Tabs identity host + Tabs.Screen recorder. Also stub the router
// hooks HubLayout consumes (useRouter/useSegments).
jest.mock('expo-router', () => {
  const React = require('react');
  function Tabs({ children }: { children?: React.ReactNode }) {
    recorder.tabsRendered += 1;
    return React.createElement(React.Fragment, null, children);
  }
  Tabs.Screen = function Screen({ name }: { name: string }) {
    recorder.tabsScreens.push(name);
    return null;
  };
  return {
    __esModule: true,
    Tabs,
    useRouter: () => ({ navigate: jest.fn(), push: jest.fn(), replace: jest.fn() }),
    useSegments: () => ['(tabs)'],
  };
});

// expo-router/drawer: Drawer identity host + Drawer.Screen recorder.
jest.mock('expo-router/drawer', () => {
  const React = require('react');
  function Drawer({ children }: { children?: React.ReactNode }) {
    recorder.drawerRendered += 1;
    return React.createElement(React.Fragment, null, children);
  }
  Drawer.Screen = function Screen({ name }: { name: string }) {
    recorder.drawerScreens.push(name);
    return null;
  };
  return { __esModule: true, Drawer };
});

// lucide icons: every name resolves to a host string (icon-map indexes these).
jest.mock('lucide-react-native', () => {
  const handler = { get: () => 'Icon' };
  return new Proxy({ __esModule: true }, handler);
});

// react-native-safe-area-context: HubLayout uses SafeAreaView; stub to a host.
jest.mock('react-native-safe-area-context', () => ({
  __esModule: true,
  SafeAreaView: 'SafeAreaView',
}));

// ErrorBoundary pulls sentry/native internals not needed for this contract.
jest.mock('../../components/ErrorBoundary', () => ({
  __esModule: true,
  ErrorBoundary: ({ children }: { children?: React.ReactNode }) => children ?? null,
}));

const BASE_NAV = {
  tabs: [
    { id: 'home', label: 'Home', icon: 'Home', file: 'index' },
    { id: 'explore', label: 'Explore', icon: 'Compass', file: 'explore' },
    { id: 'settings', label: 'Settings', icon: 'Settings', file: 'settings' },
  ],
  hiddenScreens: ['notifications'],
  modals: ['paywall'],
};

function configWith(navigationPattern: string | null | undefined) {
  return {
    __esModule: true,
    gasConfig: {
      app: { name: 'TestApp' },
      design: { colors: { primary: '#3b82f6' } },
      navigation: { ...BASE_NAV, navigationPattern },
    },
  };
}

/** Drive a pattern through a fresh NavigatorSwitch module + render it. */
async function renderWithPattern(navigationPattern: string | null | undefined) {
  recorder.tabsScreens = [];
  recorder.drawerScreens = [];
  recorder.tabsRendered = 0;
  recorder.drawerRendered = 0;

  // Require the freshly-mocked module synchronously (isolateModules' callback is
  // sync), then await the async render outside it.
  let NavigatorSwitch!: React.ComponentType;
  jest.isolateModules(() => {
    jest.doMock('../../gas.config', () => configWith(navigationPattern));
    NavigatorSwitch = require('../../components/kit/NavigatorSwitch').NavigatorSwitch;
  });
  return render(<NavigatorSwitch />);
}

const TAB_FILES = ['index', 'explore', 'settings'];

describe('NavigatorSwitch pattern selection', () => {
  it("'tab-bar' registers the tab screens on Tabs (not Drawer)", async () => {
    await renderWithPattern('tab-bar');
    expect(recorder.tabsRendered).toBe(1);
    expect(recorder.drawerRendered).toBe(0);
    expect(recorder.drawerScreens).toEqual([]);
    for (const f of TAB_FILES) expect(recorder.tabsScreens).toContain(f);
  });

  it('absent / unknown pattern fails soft to Tabs', async () => {
    await renderWithPattern(undefined);
    expect(recorder.tabsRendered).toBe(1);
    expect(recorder.drawerRendered).toBe(0);
    for (const f of TAB_FILES) expect(recorder.tabsScreens).toContain(f);

    await renderWithPattern('carousel');
    expect(recorder.tabsRendered).toBe(1);
    expect(recorder.drawerRendered).toBe(0);
  });

  it("'drawer' registers the tab screens on Drawer (not Tabs)", async () => {
    await renderWithPattern('drawer');
    expect(recorder.drawerRendered).toBe(1);
    expect(recorder.tabsRendered).toBe(0);
    expect(recorder.tabsScreens).toEqual([]);
    for (const f of TAB_FILES) expect(recorder.drawerScreens).toContain(f);
    // hidden + placeholder are registered on the drawer too (hidden via style)
    expect(recorder.drawerScreens).toContain('notifications');
    expect(recorder.drawerScreens).toContain('placeholder');
  });

  it("'hub-and-spoke' mounts Tabs (bar hidden) + HubLayout", async () => {
    const { getByTestId } = await renderWithPattern('hub-and-spoke');
    expect(recorder.tabsRendered).toBe(1);
    expect(recorder.drawerRendered).toBe(0);
    for (const f of TAB_FILES) expect(recorder.tabsScreens).toContain(f);
    // The HubLayout overlay renders at the launcher root (useSegments=['(tabs)']).
    expect(getByTestId('nav-hub-root')).toBeTruthy();
    // Spokes = non-first tabs.
    expect(getByTestId('hub-spoke-explore')).toBeTruthy();
    expect(getByTestId('hub-spoke-settings')).toBeTruthy();
  });
});

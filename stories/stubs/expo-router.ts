/**
 * Storybook stub for expo-router.
 *
 * expo-router ships JSX in compiled .js files which Rollup/Vite's commonjs
 * plugin cannot parse (it expects JS, not JSX). This stub replaces the entire
 * package with lightweight no-op equivalents so kit stories that import
 * expo-router (Link, router, useRouter, useSegments, Tabs) can render in
 * Storybook without pulling in the native build.
 */
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import type { ReactNode } from 'react';

// ── router object ─────────────────────────────────────────────────────────────

export const router = {
  push: (_href: unknown) => {},
  replace: (_href: unknown) => {},
  back: () => {},
  navigate: (_href: unknown) => {},
  canGoBack: () => false,
  dismissAll: () => {},
  dismiss: () => {},
  setParams: (_params: unknown) => {},
};

// ── hooks ─────────────────────────────────────────────────────────────────────

export function useRouter() {
  return router;
}

export function useSegments(): string[] {
  return [];
}

export function useLocalSearchParams<T extends Record<string, string | string[]> = Record<string, string>>(): T {
  return {} as T;
}

export function useGlobalSearchParams<T extends Record<string, string | string[]> = Record<string, string>>(): T {
  return {} as T;
}

export function usePathname(): string {
  return '/';
}

export function useNavigation() {
  return null;
}

// ── Link ──────────────────────────────────────────────────────────────────────

export interface LinkProps {
  href?: unknown;
  children?: ReactNode;
  asChild?: boolean;
  replace?: boolean;
  push?: boolean;
}

export const Link: React.FC<LinkProps> = ({ children }) => {
  return React.createElement(
    TouchableOpacity,
    { onPress: () => {} },
    typeof children === 'string'
      ? React.createElement(Text, null, children)
      : children,
  );
};

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TabsRoot: React.FC<{ children?: ReactNode; [key: string]: unknown }> = ({ children }) =>
  React.createElement(React.Fragment, null, children);

const TabsScreen: React.FC<{ [key: string]: unknown }> = () => null;

export const Tabs = Object.assign(TabsRoot, { Screen: TabsScreen });

// ── Stack (for completeness) ──────────────────────────────────────────────────

const StackRoot: React.FC<{ children?: ReactNode; [key: string]: unknown }> = ({ children }) =>
  React.createElement(React.Fragment, null, children);

const StackScreen: React.FC<{ [key: string]: unknown }> = () => null;

export const Stack = Object.assign(StackRoot, { Screen: StackScreen });

export default { router, useRouter, useSegments, Link, Tabs, Stack };

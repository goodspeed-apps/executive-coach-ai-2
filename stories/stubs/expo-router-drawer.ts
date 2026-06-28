/**
 * Storybook stub for expo-router/drawer.
 *
 * Provides a no-op Drawer component so NavigatorSwitch stories can import
 * from 'expo-router/drawer' without pulling in the native Drawer implementation.
 */
import React from 'react';
import type { ReactNode } from 'react';

const DrawerRoot: React.FC<{ children?: ReactNode; [key: string]: unknown }> = ({ children }) =>
  React.createElement(React.Fragment, null, children);

const DrawerScreen: React.FC<{ [key: string]: unknown }> = () => null;

export const Drawer = Object.assign(DrawerRoot, { Screen: DrawerScreen });
export default Drawer;

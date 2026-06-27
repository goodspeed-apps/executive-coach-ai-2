/**
 * NavigationGate, exposes the resolved navigation pattern via context.
 *
 * It sits ABOVE the route group (wrapping <Slot/> in app/_layout.tsx) so it
 * CANNOT mount a navigator, the navigator switch lives inside the (tabs) group
 * (components/kit/NavigatorSwitch.tsx). NavigationGate's only job is to read
 * gasConfig.navigation.navigationPattern (build-time static) and publish it on a
 * context, while passing children through unchanged.
 */

import React, { createContext, useContext, type ReactNode } from 'react';
import { resolveNavigationPattern, type NavigationPattern } from '@/lib/navigation-pattern';
import { gasConfig } from '../../gas.config';

const NavPatternContext = createContext<NavigationPattern>('tab-bar');

export function useNavigationPattern(): NavigationPattern {
  return useContext(NavPatternContext);
}

export function NavigationGate({ children }: { children: ReactNode }): React.ReactElement {
  const pattern = resolveNavigationPattern(gasConfig.navigation);
  return <NavPatternContext.Provider value={pattern}>{children}</NavPatternContext.Provider>;
}

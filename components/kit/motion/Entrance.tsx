/**
 * Entrance, a shared, degrade-safe entrance-animation primitive.
 *
 * Wraps a screen's outermost container and plays the per-app entrance animation
 * (resolved from gas.config.design.motion via KitProvider) using reanimated's
 * DECLARATIVE `entering` builders, no worklets, so it is jest-safe and cheap.
 *
 * Degrade-safe: when the user has reduce-motion enabled OR the resolved
 * entrance is 'none', it renders a plain <View> with no `entering` prop
 * (identity, never an Animated.View). It carries its `style` through so
 * wrapping a flex:1 SafeAreaView (with <Entrance style={{ flex: 1 }}>) does not
 * collapse the layout.
 */

import { View, type ViewProps } from 'react-native';
import Animated, { FadeIn, SlideInDown, ZoomIn } from 'react-native-reanimated';
import { useThemeColors } from '@/context/ThemeContext';
import { useKit } from '../KitContext';
import type { EntranceKind, ResolvedMotion } from './resolveMotion';

export interface EntranceProps extends ViewProps {
  /** Override the app-resolved motion (defaults to KitProvider's motion). */
  motion?: ResolvedMotion;
  /** Override the entrance kind (defaults to the resolved motion's entrance). */
  kind?: EntranceKind;
}

function builderFor(kind: EntranceKind, m: ResolvedMotion) {
  switch (kind) {
    case 'fade':
      return FadeIn.duration(m.durationMs);
    case 'slide':
      return SlideInDown.duration(m.durationMs)
        .springify()
        .damping(m.spring.damping)
        .stiffness(m.spring.stiffness);
    case 'scale':
      return ZoomIn.duration(m.durationMs)
        .springify()
        .damping(m.spring.damping)
        .stiffness(m.spring.stiffness);
    default:
      return undefined;
  }
}

export function Entrance({ motion: motionOverride, kind, style, children, ...rest }: EntranceProps) {
  const { reducedMotion } = useThemeColors();
  const { motion } = useKit();
  const resolved = motionOverride ?? motion;
  const entrance = kind ?? resolved.entrance;
  const entering = reducedMotion ? undefined : builderFor(entrance, resolved);

  if (!entering) {
    return (
      <View style={style} {...rest}>
        {children}
      </View>
    );
  }
  return (
    <Animated.View entering={entering} style={style} {...rest}>
      {children}
    </Animated.View>
  );
}

/**
 * Storybook stub for expo-linear-gradient.
 *
 * The real package ships native code that Rollup/Vite cannot parse (the .js
 * build uses `import()` dynamic-require constructs that commonjs--resolver
 * rejects with "Expression expected"). This stub provides the same public API
 * surface so stories that use KitSurface or any kit component wrapping
 * LinearGradient can render in Storybook without hitting the native build.
 */
import React from 'react';
import { View } from 'react-native';
import type { ViewProps } from 'react-native';

export interface LinearGradientProps extends ViewProps {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  locations?: number[];
}

export const LinearGradient: React.FC<LinearGradientProps> = ({
  colors: _colors,
  start: _start,
  end: _end,
  locations: _locations,
  style,
  children,
  ...rest
}) => {
  const [first] = _colors ?? ['transparent'];
  return React.createElement(
    View,
    {
      ...rest,
      style: [{ backgroundColor: first }, style],
    },
    children,
  );
};

export default LinearGradient;

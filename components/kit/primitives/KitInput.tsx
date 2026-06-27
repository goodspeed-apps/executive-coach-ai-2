/**
 * KitInput, themed text field wrapping RN TextInput with 5 genuinely-different
 * variant FAMILIES. Active family from useKit().kit?.input (read unconditionally
 * at the top, fail-soft to 'outline'). Error state always surfaces colors.error.
 *
 * Families differ in BORDER / FILL / LABEL geometry:
 *  - outline         : 1px border box                              (default)
 *  - filled          : surfaceSecondary fill, no border
 *  - underline       : bottom rule only, no box
 *  - floating-label  : label sits inside, floats above on focus / when filled
 *  - inset           : recessed fill + an inner top hairline
 */

import { useState } from 'react';
import { View, Text, TextInput, type ViewStyle, type TextStyle, type KeyboardTypeOptions } from 'react-native';
import { useThemeColors } from '@/context/ThemeContext';
import { useKit } from '../KitContext';
import { radius as radiusToken } from '../../../lib/design-tokens';
import {
  DEFAULT_KIT_INPUT_VARIANT,
  type KitInputVariantId,
  type ResolvedKitTuple,
} from './types';

type KitWithTuple = { readonly kit?: ResolvedKitTuple | null };

export interface KitInputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  error?: string;
  /** Override the active input family. */
  variant?: KitInputVariantId;
  testID?: string;
}

export function KitInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  error,
  variant,
  testID,
}: KitInputProps) {
  // useKit() unconditionally at the top, never inside `??`.
  const kit = (useKit() as unknown as KitWithTuple).kit;
  const { colors } = useThemeColors();
  const family: KitInputVariantId = variant ?? kit?.input ?? DEFAULT_KIT_INPUT_VARIANT;

  const [focused, setFocused] = useState(false);
  const r = radiusToken();
  const hasError = !!error;
  const accent = hasError ? colors.error : focused ? colors.primary : colors.border;

  // Per-family field geometry.
  let fieldStyle: ViewStyle;
  switch (family) {
    case 'filled':
      fieldStyle = {
        backgroundColor: colors.surfaceSecondary,
        borderRadius: r,
        paddingHorizontal: 14,
        paddingVertical: 12,
      };
      break;
    case 'underline':
      fieldStyle = {
        backgroundColor: 'transparent',
        borderRadius: 0,
        borderBottomWidth: 1.5,
        borderBottomColor: accent,
        paddingHorizontal: 2,
        paddingVertical: 10,
      };
      break;
    case 'inset':
      fieldStyle = {
        backgroundColor: colors.surfaceSecondary,
        borderRadius: r,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingHorizontal: 14,
        paddingVertical: 12,
      };
      break;
    case 'floating-label':
      fieldStyle = {
        backgroundColor: colors.surface,
        borderRadius: r,
        borderWidth: 1,
        borderColor: accent,
        paddingHorizontal: 14,
        paddingTop: 18,
        paddingBottom: 8,
      };
      break;
    case 'outline':
    default:
      fieldStyle = {
        backgroundColor: 'transparent',
        borderRadius: r,
        borderWidth: 1,
        borderColor: accent,
        paddingHorizontal: 14,
        paddingVertical: 12,
      };
      break;
  }

  const isFloating = family === 'floating-label';
  const labelFloated = isFloating && (focused || value.length > 0);

  const inputStyle: TextStyle = { color: colors.text, fontSize: 15, padding: 0, margin: 0 };

  return (
    <View testID={testID}>
      {/* Non-floating label sits above the field. */}
      {label && !isFloating ? (
        <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 6 }}>{label}</Text>
      ) : null}

      <View style={fieldStyle}>
        {/* Floating label overlays the field; floats up on focus / when filled. */}
        {label && isFloating ? (
          <Text
            style={{
              position: 'absolute',
              left: 14,
              top: labelFloated ? 6 : 18,
              fontSize: labelFloated ? 11 : 15,
              color: labelFloated ? colors.primary : colors.textSecondary,
            }}
          >
            {label}
          </Text>
        ) : null}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={inputStyle}
          testID={testID ? `${testID}-input` : undefined}
        />
      </View>

      {hasError ? (
        <Text style={{ color: colors.error, fontSize: 12, marginTop: 4 }}>{error}</Text>
      ) : null}
    </View>
  );
}

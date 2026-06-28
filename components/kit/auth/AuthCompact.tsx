/**
 * GAS Template, Auth Variant: Compact
 *
 * Dense and efficient. Small logo + inline title, tight 44px inputs, minimal
 * vertical rhythm, and, the signature move, OAuth rendered as a horizontal
 * ROW of small icon-only square buttons (not full-width labeled buttons). Fits
 * the whole form high on the screen with little scrolling.
 *
 * Layout only, behavior comes from `vm`. Themed via useThemeColors() (no
 * hardcoded hex). The email / password / submit / OAuth controls carry the
 * FROZEN selector-contract accessibilityLabel + role for login & signup; the
 * icon-only OAuth squares still carry the contracted label (icon-only is fine
 * because the label IS the contract).
 */

import { useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { MailCheck } from 'lucide-react-native';
import { useThemeColors } from '@/context/ThemeContext';
import { ProviderIcon } from '@/components/auth/ProviderIcon';
import { PasswordInput } from '@/components/auth/PasswordInput';
import AppLogo from '@/components/AppLogo';
import { Entrance } from '../motion/Entrance';
import type { AuthVariantProps } from './types';

export function AuthCompact({ mode, vm }: AuthVariantProps) {
  const { colors } = useThemeColors();
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const isSignup = mode === 'signup';
  const isLogin = mode === 'login';

  const inputStyle = {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    fontSize: 15,
    color: colors.text,
  };
  const compactPassword = { height: 44, borderRadius: 10, paddingHorizontal: 12, fontSize: 15 };
  const iconSquare = {
    width: 48,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  if ((isSignup && vm.verificationSent) || (mode === 'reset' && vm.sent)) {
    const target = isSignup ? vm.email : vm.email.trim();
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, backgroundColor: colors.background }}>
        <MailCheck size={36} color={colors.primary} strokeWidth={1.5} style={{ marginBottom: 12 }} />
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 6, textAlign: 'center' }}>Check your email</Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
          We sent a link to {target}.
        </Text>
        <TouchableOpacity
          style={{ height: 44, width: '100%', borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}
          onPress={isSignup ? vm.backToLogin : () => router.replace('/(auth)/login')}
          accessibilityRole="button"
          accessibilityLabel={isSignup ? 'Back to login' : 'Back to sign in'}
        >
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textOnPrimary }}>Back to sign in</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const title = isLogin ? 'Sign in' : isSignup ? 'Create account' : mode === 'reset' ? 'Reset password' : 'New password';

  return (
    <Entrance style={{ flex: 1 }}>
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 28 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header row: logo + title inline */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <AppLogo size={32} />
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>{title}</Text>
          </View>

          {vm.error ? (
            <View style={{ backgroundColor: colors.errorMuted, borderRadius: 8, padding: 10, marginBottom: 12 }}>
              <Text style={{ color: colors.error, fontSize: 13 }}>{vm.error}</Text>
            </View>
          ) : null}

          {/* Email */}
          {mode !== 'newPassword' && (
            <View style={{ marginBottom: 10 }}>
              <TextInput
                style={inputStyle}
                placeholder="Email"
                placeholderTextColor={colors.placeholder}
                value={vm.email}
                onChangeText={vm.setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                accessibilityLabel="Email address"
                accessibilityRole="none"
              />
            </View>
          )}

          {/* Password */}
          {mode !== 'reset' && (
            <View style={{ marginBottom: 10 }}>
              <PasswordInput
                ref={passwordRef}
                style={compactPassword}
                placeholder="Password"
                value={vm.password}
                onChangeText={vm.setPassword}
                returnKeyType={isSignup ? 'next' : 'done'}
                onSubmitEditing={isSignup ? () => confirmRef.current?.focus() : vm.submit}
                accessibilityLabel="Password"
              />
            </View>
          )}

          {/* Confirm password */}
          {isSignup && (
            <View style={{ marginBottom: 10 }}>
              <PasswordInput
                ref={confirmRef}
                style={compactPassword}
                placeholder="Confirm password"
                value={vm.confirmPassword}
                onChangeText={vm.setConfirmPassword}
                returnKeyType="done"
                onSubmitEditing={vm.submit}
                accessibilityLabel="Confirm password"
              />
            </View>
          )}

          {/* Forgot password link */}
          {isLogin && (
            <View style={{ alignItems: 'flex-end', marginBottom: 16 }}>
              <Link href="/(auth)/reset" asChild>
                <TouchableOpacity accessibilityRole="link" accessibilityLabel="Forgot password">
                  <Text style={{ fontSize: 13, color: colors.primary }}>Forgot password?</Text>
                </TouchableOpacity>
              </Link>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={{
              height: 44,
              borderRadius: 10,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              opacity: vm.loading ? 0.7 : 1,
            }}
            onPress={vm.submit}
            disabled={vm.loading}
            accessibilityRole="button"
            accessibilityLabel={isLogin ? 'Sign in' : isSignup ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Set new password'}
          >
            {vm.loading ? (
              <ActivityIndicator color={colors.textOnPrimary} />
            ) : (
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textOnPrimary }}>
                {isLogin ? 'Sign in' : isSignup ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Set new password'}
              </Text>
            )}
          </TouchableOpacity>

          {/* OAuth icon row */}
          {(isLogin || isSignup) && vm.oauthProviders && vm.oauthProviders.length > 0 && (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                <Text style={{ fontSize: 12, color: colors.textMuted }}>or</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
              </View>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                {vm.oauthProviders.map((provider) => (
                  <TouchableOpacity
                    key={provider}
                    style={iconSquare}
                    onPress={() => vm.oauthSignIn(provider)}
                    accessibilityRole="button"
                    accessibilityLabel={`Sign in with ${provider}`}
                  >
                    <ProviderIcon provider={provider} size={20} color={colors.text} />
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Footer nav */}
          <View style={{ marginTop: 24, alignItems: 'center' }}>
            {isLogin && (
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity accessibilityRole="link" accessibilityLabel="Create an account">
                  <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                    No account? <Text style={{ color: colors.primary, fontWeight: '600' }}>Sign up</Text>
                  </Text>
                </TouchableOpacity>
              </Link>
            )}
            {isSignup && (
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity accessibilityRole="link" accessibilityLabel="Sign in to existing account">
                  <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                    Have an account? <Text style={{ color: colors.primary, fontWeight: '600' }}>Sign in</Text>
                  </Text>
                </TouchableOpacity>
              </Link>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </Entrance>
  );
}

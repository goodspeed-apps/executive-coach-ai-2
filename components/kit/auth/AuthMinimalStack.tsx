/**
 * GAS Template, Auth Variant: Minimal Stack
 *
 * Editorial, airy, borderless. A left-aligned title, generous whitespace, and
 * inputs that are hairline-underlined (no box, no fill). Submit is a flat
 * full-width bar; OAuth is rendered as understated TEXT LINKS in a row rather
 * than bordered buttons. Visually the opposite of the boxed centered-card.
 *
 * Layout only, behavior comes from `vm`. Themed via useThemeColors() (no
 * hardcoded hex). The email / password / submit / OAuth controls carry the
 * FROZEN selector-contract accessibilityLabel + role for login & signup.
 */

import { useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { MailCheck } from 'lucide-react-native';
import { useThemeColors } from '@/context/ThemeContext';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Entrance } from '../motion/Entrance';
import type { AuthVariantProps } from './types';

export function AuthMinimalStack({ mode, vm }: AuthVariantProps) {
  const { colors } = useThemeColors();
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const isSignup = mode === 'signup';
  const isLogin = mode === 'login';

  // Hairline underline only, no box, no fill.
  const lineInput = {
    height: 48,
    borderWidth: 0,
    borderBottomWidth: 1,
    borderRadius: 0,
    borderColor: colors.border,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    fontSize: 18,
    color: colors.text,
  };
  // PasswordInput's base style is a box; override it down to the same underline.
  const linePassword = {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderRadius: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingRight: 44,
    fontSize: 18,
  };

  if ((isSignup && vm.verificationSent) || (mode === 'reset' && vm.sent)) {
    const target = isSignup ? vm.email : vm.email.trim();
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 32, backgroundColor: colors.background }}>
        <MailCheck size={40} color={colors.primary} strokeWidth={1.5} style={{ marginBottom: 24 }} />
        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 12, letterSpacing: -0.5 }}>Check your email</Text>
        <Text style={{ fontSize: 16, color: colors.textSecondary, marginBottom: 40, lineHeight: 24 }}>
          We sent a link to {target}.
        </Text>
        <TouchableOpacity
          onPress={isSignup ? vm.backToLogin : () => router.replace('/(auth)/login')}
          accessibilityRole="button"
          accessibilityLabel={isSignup ? 'Back to login' : 'Back to sign in'}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.primary }}>Back to sign in</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const title = isLogin ? 'Sign in' : isSignup ? 'Create account' : mode === 'reset' ? 'Reset password' : 'New password';
  const subtitle = isLogin
    ? `Welcome back to ${vm.appName}.`
    : isSignup
      ? `Start using ${vm.appName}.`
      : mode === 'reset'
        ? "Enter your email and we'll send a reset link."
        : 'Enter a new password for your account.';

  return (
    <Entrance style={{ flex: 1 }}>
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 48 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={{ fontSize: 34, fontWeight: '700', color: colors.text, marginBottom: 6, letterSpacing: -0.5 }}>{title}</Text>
          <Text style={{ fontSize: 16, color: colors.textSecondary, marginBottom: 40, lineHeight: 24 }}>{subtitle}</Text>

          {vm.error ? (
            <View style={{ backgroundColor: colors.errorMuted, borderRadius: 8, padding: 12, marginBottom: 20 }}>
              <Text style={{ color: colors.error, fontSize: 14 }}>{vm.error}</Text>
            </View>
          ) : null}

          {/* Email */}
          {mode !== 'newPassword' && (
            <View style={{ marginBottom: 20 }}>
              <TextInput
                style={lineInput}
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
            <View style={{ marginBottom: 20 }}>
              <PasswordInput
                ref={passwordRef}
                style={linePassword}
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
            <View style={{ marginBottom: 20 }}>
              <PasswordInput
                ref={confirmRef}
                style={linePassword}
                placeholder="Confirm password"
                value={vm.confirmPassword}
                onChangeText={vm.setConfirmPassword}
                returnKeyType="done"
                onSubmitEditing={vm.submit}
                accessibilityLabel="Confirm password"
              />
            </View>
          )}

          {/* Forgot password */}
          {isLogin && (
            <View style={{ marginBottom: 32 }}>
              <Link href="/(auth)/reset" asChild>
                <TouchableOpacity accessibilityRole="link" accessibilityLabel="Forgot password">
                  <Text style={{ fontSize: 14, color: colors.textSecondary }}>Forgot password?</Text>
                </TouchableOpacity>
              </Link>
            </View>
          )}

          {/* Submit */}
          <TouchableOpacity
            style={{
              height: 52,
              borderRadius: 4,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 32,
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
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textOnPrimary }}>
                {isLogin ? 'Sign in' : isSignup ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Set new password'}
              </Text>
            )}
          </TouchableOpacity>

          {/* OAuth text links */}
          {(isLogin || isSignup) && vm.oauthProviders && vm.oauthProviders.length > 0 && (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 8 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                <Text style={{ fontSize: 12, color: colors.textMuted }}>or continue with</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                {vm.oauthProviders.map((provider) => (
                  <TouchableOpacity
                    key={provider}
                    onPress={() => vm.oauthSignIn(provider)}
                    accessibilityRole="button"
                    accessibilityLabel={`Sign in with ${provider}`}
                  >
                    <Text style={{ fontSize: 15, color: colors.primary, fontWeight: '600', textTransform: 'capitalize' }}>{provider}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Footer nav */}
          <View style={{ marginTop: 40 }}>
            {isLogin && (
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity accessibilityRole="link" accessibilityLabel="Create an account">
                  <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                    No account? <Text style={{ color: colors.primary, fontWeight: '700' }}>Sign up</Text>
                  </Text>
                </TouchableOpacity>
              </Link>
            )}
            {isSignup && (
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity accessibilityRole="link" accessibilityLabel="Sign in to existing account">
                  <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                    Have an account? <Text style={{ color: colors.primary, fontWeight: '700' }}>Sign in</Text>
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

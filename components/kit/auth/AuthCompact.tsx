/**
 * GAS Template — Auth Variant: Compact
 *
 * Dense and efficient. Small logo + inline title, tight 44px inputs, minimal
 * vertical rhythm, and — the signature move — OAuth rendered as a horizontal
 * ROW of small icon-only square buttons (not full-width labeled buttons). Fits
 * the whole form high on the screen with little scrolling.
 *
 * Layout only — behavior comes from `vm`. Themed via useThemeColors() (no
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
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>Back to sign in</Text>
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
          {/* Small logo + inline title */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <AppLogo size={36} />
            <View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text, letterSpacing: -0.3 }}>{title}</Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>{vm.appName}</Text>
            </View>
          </View>

          {mode === 'update' ? (
            <View style={{ gap: 8 }}>
              <PasswordInput
                placeholder={`New password (min ${vm.minPasswordLength})`}
                value={vm.password}
                onChangeText={vm.onPasswordChange}
                textContentType="newPassword"
                autoComplete="new-password"
                accessibilityLabel="New password"
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
                blurOnSubmit={false}
                style={compactPassword}
              />
              <PasswordInput
                ref={confirmRef}
                placeholder="Confirm new password"
                value={vm.confirmPassword}
                onChangeText={vm.onConfirmPasswordChange}
                textContentType="newPassword"
                autoComplete="new-password"
                accessibilityLabel="Confirm new password"
                returnKeyType="done"
                onSubmitEditing={vm.handleUpdatePassword}
                style={[compactPassword, vm.passwordError ? { borderColor: colors.error } : null]}
              />
              {vm.passwordError ? <Text style={{ color: colors.error, fontSize: 12, marginLeft: 2 }}>{vm.passwordError}</Text> : null}
              <TouchableOpacity
                style={{ height: 44, borderRadius: 10, backgroundColor: vm.canSubmit ? colors.primary : colors.primary + '66', alignItems: 'center', justifyContent: 'center', marginTop: 4 }}
                onPress={vm.handleUpdatePassword}
                disabled={vm.loading || !vm.canSubmit}
                accessibilityRole="button"
                accessibilityLabel="Update password"
                accessibilityState={{ disabled: vm.loading || !vm.canSubmit, busy: vm.loading }}
              >
                {vm.loading ? <ActivityIndicator accessibilityLabel="Loading" color="#fff" /> : <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>Update password</Text>}
              </TouchableOpacity>
            </View>
          ) : mode === 'reset' ? (
            <View style={{ gap: 8 }}>
              <TextInput
                style={inputStyle}
                placeholder="Email"
                placeholderTextColor={colors.textSecondary}
                value={vm.email}
                onChangeText={vm.setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                accessibilityLabel="Email address"
                returnKeyType="send"
                onSubmitEditing={vm.handleSendResetLink}
              />
              <TouchableOpacity
                style={{ height: 44, borderRadius: 10, backgroundColor: vm.email.trim() ? colors.primary : colors.primary + '66', alignItems: 'center', justifyContent: 'center' }}
                onPress={vm.handleSendResetLink}
                disabled={vm.loading}
                accessibilityRole="button"
                accessibilityLabel="Send reset link"
                accessibilityState={{ disabled: vm.loading, busy: vm.loading }}
              >
                {vm.loading ? <ActivityIndicator accessibilityLabel="Loading" color="#fff" /> : <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>Send reset link</Text>}
              </TouchableOpacity>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back to sign in" style={{ alignItems: 'center', marginTop: 2 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primary }}>Back to sign in</Text>
                </TouchableOpacity>
              </Link>
            </View>
          ) : (
            <View style={{ gap: 8 }}>
              <TextInput
                style={inputStyle}
                placeholder="Email"
                placeholderTextColor={colors.textSecondary}
                value={vm.email}
                onChangeText={vm.setEmail}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                accessibilityLabel="Email address"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
              />
              <PasswordInput
                ref={passwordRef}
                placeholder={isSignup ? 'Password (min 8)' : 'Password'}
                value={vm.password}
                onChangeText={isSignup ? vm.onPasswordChange : vm.setPassword}
                textContentType={isSignup ? 'newPassword' : 'password'}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                accessibilityLabel="Password"
                returnKeyType={isSignup ? 'next' : 'go'}
                onSubmitEditing={isSignup ? () => confirmRef.current?.focus() : vm.handleEmailLogin}
                blurOnSubmit={isSignup ? false : undefined}
                style={compactPassword}
              />
              {isSignup && (
                <>
                  <PasswordInput
                    ref={confirmRef}
                    placeholder="Confirm password"
                    value={vm.confirmPassword}
                    onChangeText={vm.onConfirmPasswordChange}
                    textContentType="newPassword"
                    autoComplete="new-password"
                    accessibilityLabel="Confirm password"
                    returnKeyType="done"
                    onSubmitEditing={vm.handleEmailSignup}
                    style={[compactPassword, vm.passwordError ? { borderColor: colors.error } : null]}
                  />
                  {vm.passwordError ? <Text style={{ color: colors.error, fontSize: 12, marginLeft: 2 }}>{vm.passwordError}</Text> : null}
                </>
              )}

              {isLogin && (
                <View style={{ alignItems: 'flex-end' }}>
                  <Link href="/(auth)/reset-password" asChild>
                    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Forgot password" hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.primary }}>Forgot password?</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              )}

              <TouchableOpacity
                style={{ height: 44, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 2 }}
                onPress={isSignup ? vm.handleEmailSignup : vm.handleEmailLogin}
                disabled={!vm.canSubmit}
                accessibilityRole="button"
                accessibilityLabel={isSignup ? 'Create account' : 'Sign in'}
                accessibilityState={{ disabled: !vm.canSubmit, busy: vm.loading }}
              >
                {vm.loading ? <ActivityIndicator accessibilityLabel="Loading" color="#fff" /> : <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>{isSignup ? 'Create account' : 'Sign in'}</Text>}
              </TouchableOpacity>

              {/* Compact icon-button OAuth ROW (icon-only squares). */}
              {vm.hasOAuth && (
                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 8 }}>
                  {vm.showGoogle && (
                    <TouchableOpacity
                      style={iconSquare}
                      onPress={() => (isSignup ? vm.handleOAuthSignup('google') : vm.handleOAuthLogin('google'))}
                      disabled={vm.loading}
                      accessibilityRole="button"
                      accessibilityLabel={isSignup ? 'Continue with Google' : 'Sign in with Google'}
                      accessibilityState={{ disabled: vm.loading, busy: vm.oauthProvider === 'google' }}
                    >
                      <ProviderIcon provider="google" size={20} />
                    </TouchableOpacity>
                  )}
                  {vm.showApple && (
                    <TouchableOpacity
                      style={iconSquare}
                      onPress={isSignup ? vm.handleAppleSignup : vm.handleAppleLogin}
                      disabled={vm.loading}
                      accessibilityRole="button"
                      accessibilityLabel={isSignup ? 'Continue with Apple' : 'Sign in with Apple'}
                      accessibilityState={{ disabled: vm.loading, busy: vm.oauthProvider === 'apple' }}
                    >
                      <ProviderIcon provider="apple" size={20} color={colors.text} />
                    </TouchableOpacity>
                  )}
                  {vm.showTwitter && (
                    <TouchableOpacity
                      style={iconSquare}
                      onPress={() => (isSignup ? vm.handleOAuthSignup('twitter') : vm.handleOAuthLogin('twitter'))}
                      disabled={vm.loading}
                      accessibilityRole="button"
                      accessibilityLabel={isSignup ? 'Continue with X' : 'Sign in with Twitter'}
                      accessibilityState={{ disabled: vm.loading, busy: vm.oauthProvider === 'twitter' }}
                    >
                      <ProviderIcon provider="x" size={18} color={colors.text} />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 10 }}>
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>{isSignup ? 'Have an account?' : 'No account?'}</Text>
                <Link href={isSignup ? '/(auth)/login' : '/(auth)/signup'} asChild>
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel={isSignup ? 'Go to login' : 'Go to sign up'}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: colors.primary }}>{isSignup ? 'Sign in' : 'Sign up'}</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </Entrance>
  );
}

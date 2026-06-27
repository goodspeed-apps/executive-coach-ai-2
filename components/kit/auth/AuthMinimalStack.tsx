/**
 * GAS Template — Auth Variant: Minimal Stack
 *
 * Editorial, airy, borderless. A left-aligned title, generous whitespace, and
 * inputs that are hairline-underlined (no box, no fill). Submit is a flat
 * full-width bar; OAuth is rendered as understated TEXT LINKS in a row rather
 * than bordered buttons. Visually the opposite of the boxed centered-card.
 *
 * Layout only — behavior comes from `vm`. Themed via useThemeColors() (no
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

  // Hairline underline only — no box, no fill.
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
          <Text style={{ fontSize: 34, fontWeight: '700', color: colors.text, letterSpacing: -1, marginBottom: 8 }}>{title}</Text>
          <Text style={{ fontSize: 16, color: colors.textSecondary, marginBottom: 40, lineHeight: 23 }}>{subtitle}</Text>

          {mode === 'update' ? (
            <View style={{ gap: 28 }}>
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
                style={linePassword}
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
                style={[linePassword, vm.passwordError ? { borderColor: colors.error } : null]}
              />
              {vm.passwordError ? <Text style={{ color: colors.error, fontSize: 13 }}>{vm.passwordError}</Text> : null}
              <TouchableOpacity
                style={{ height: 52, alignItems: 'center', justifyContent: 'center', backgroundColor: vm.canSubmit ? colors.primary : colors.primary + '66', borderRadius: 8, marginTop: 8 }}
                onPress={vm.handleUpdatePassword}
                disabled={vm.loading || !vm.canSubmit}
                accessibilityRole="button"
                accessibilityLabel="Update password"
                accessibilityState={{ disabled: vm.loading || !vm.canSubmit, busy: vm.loading }}
              >
                {vm.loading ? <ActivityIndicator accessibilityLabel="Loading" color="#fff" /> : <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>Update password</Text>}
              </TouchableOpacity>
            </View>
          ) : mode === 'reset' ? (
            <View style={{ gap: 28 }}>
              <TextInput
                style={lineInput}
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
                style={{ height: 52, alignItems: 'center', justifyContent: 'center', backgroundColor: vm.email.trim() ? colors.primary : colors.primary + '66', borderRadius: 8 }}
                onPress={vm.handleSendResetLink}
                disabled={vm.loading}
                accessibilityRole="button"
                accessibilityLabel="Send reset link"
                accessibilityState={{ disabled: vm.loading, busy: vm.loading }}
              >
                {vm.loading ? <ActivityIndicator accessibilityLabel="Loading" color="#fff" /> : <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>Send reset link</Text>}
              </TouchableOpacity>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back to sign in">
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.primary }}>Back to sign in</Text>
                </TouchableOpacity>
              </Link>
            </View>
          ) : (
            <View style={{ gap: 28 }}>
              <TextInput
                style={lineInput}
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
                style={linePassword}
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
                    style={[linePassword, vm.passwordError ? { borderColor: colors.error } : null]}
                  />
                  {vm.passwordError ? <Text style={{ color: colors.error, fontSize: 13 }}>{vm.passwordError}</Text> : null}
                </>
              )}

              {isLogin && (
                <Link href="/(auth)/reset-password" asChild>
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel="Forgot password" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>Forgot password?</Text>
                  </TouchableOpacity>
                </Link>
              )}

              <TouchableOpacity
                style={{ height: 52, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderRadius: 8, marginTop: 4 }}
                onPress={isSignup ? vm.handleEmailSignup : vm.handleEmailLogin}
                disabled={!vm.canSubmit}
                accessibilityRole="button"
                accessibilityLabel={isSignup ? 'Create account' : 'Sign in'}
                accessibilityState={{ disabled: !vm.canSubmit, busy: vm.loading }}
              >
                {vm.loading ? <ActivityIndicator accessibilityLabel="Loading" color="#fff" /> : <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>{isSignup ? 'Create account' : 'Sign in'}</Text>}
              </TouchableOpacity>

              {/* OAuth rendered as understated TEXT LINKS, not bordered buttons. */}
              {vm.hasOAuth && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 }}>
                  <Text style={{ fontSize: 14, color: colors.textSecondary }}>or continue with</Text>
                  {vm.showGoogle && (
                    <TouchableOpacity
                      onPress={() => (isSignup ? vm.handleOAuthSignup('google') : vm.handleOAuthLogin('google'))}
                      disabled={vm.loading}
                      accessibilityRole="button"
                      accessibilityLabel={isSignup ? 'Continue with Google' : 'Sign in with Google'}
                      accessibilityState={{ disabled: vm.loading, busy: vm.oauthProvider === 'google' }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary }}>Google</Text>
                    </TouchableOpacity>
                  )}
                  {vm.showApple && (
                    <TouchableOpacity
                      onPress={isSignup ? vm.handleAppleSignup : vm.handleAppleLogin}
                      disabled={vm.loading}
                      accessibilityRole="button"
                      accessibilityLabel={isSignup ? 'Continue with Apple' : 'Sign in with Apple'}
                      accessibilityState={{ disabled: vm.loading, busy: vm.oauthProvider === 'apple' }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary }}>Apple</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 8 }}>
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>{isSignup ? 'Have an account?' : 'New here?'}</Text>
                <Link href={isSignup ? '/(auth)/login' : '/(auth)/signup'} asChild>
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel={isSignup ? 'Go to login' : 'Go to sign up'}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary }}>{isSignup ? 'Sign in' : 'Create account'}</Text>
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

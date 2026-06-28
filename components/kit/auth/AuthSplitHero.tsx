/**
 * GAS Template, Auth Variant: Split Hero
 *
 * A bold colored hero band fills the top third (brand mark + headline reversed
 * on the primary color); the form sits in a raised, rounded card that overlaps
 * the band's lower edge. Distinct from the centered-card default: there is no
 * centered logo column, the identity lives in the hero, and the form is a
 * surface card with elevation.
 *
 * Layout only, behavior comes from `vm`. Themed via useThemeColors() (no
 * hardcoded hex). The email / password / submit / OAuth controls carry the
 * FROZEN selector-contract accessibilityLabel + role for login & signup, even
 * though the visible copy differs by mode.
 */

import { useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { MailCheck } from 'lucide-react-native';
import { useThemeColors } from '@/context/ThemeContext';
import { ProviderIcon } from '@/components/auth/ProviderIcon';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Entrance } from '../motion/Entrance';
import type { AuthVariantProps } from './types';

export function AuthSplitHero({ mode, vm }: AuthVariantProps) {
  const { colors } = useThemeColors();
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const onPrimary = '#FFFFFF';
  const isSignup = mode === 'signup';
  const isLogin = mode === 'login';

  const inputStyle = {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
  };

  const oauthBtnStyle = {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 10,
  };

  // ── "Check your email" sub-screens (signup verification / reset sent) ──
  if ((isSignup && vm.verificationSent) || (mode === 'reset' && vm.sent)) {
    const target = isSignup ? vm.email : vm.email.trim();
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, backgroundColor: colors.background }}>
        <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <MailCheck size={40} color={onPrimary} strokeWidth={1.75} />
        </View>
        <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 8, textAlign: 'center' }}>Check your email</Text>
        <Text style={{ fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginBottom: 32, lineHeight: 22 }}>
          We sent a link to <Text style={{ color: colors.primary, fontWeight: '700' }}>{target}</Text>.
        </Text>
        <TouchableOpacity
          style={{ height: 50, width: '100%', borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}
          onPress={isSignup ? vm.backToLogin : () => router.replace('/(auth)/login')}
          accessibilityRole="button"
          accessibilityLabel={isSignup ? 'Back to login' : 'Back to sign in'}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: onPrimary }}>Back to sign in</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const heroTitle = isLogin ? 'Welcome back' : isSignup ? 'Get started' : mode === 'reset' ? 'Reset password' : 'New password';
  const heroSubtitle = isLogin
    ? `Sign in to ${vm.appName}`
    : isSignup
      ? `Create your ${vm.appName} account`
      : mode === 'reset'
        ? 'We will email you a reset link'
        : 'Choose a new password for your account';

  return (
    <Entrance style={{ flex: 1 }}>
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.primary }} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Colored hero band */}
        <View style={{ backgroundColor: colors.primary, paddingHorizontal: 28, paddingTop: 28, paddingBottom: 44 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: onPrimary, opacity: 0.85, letterSpacing: 1, textTransform: 'uppercase' }}>
            {vm.appName}
          </Text>
          <Text style={{ fontSize: 32, fontWeight: '800', color: onPrimary, marginTop: 10, letterSpacing: -0.5 }}>{heroTitle}</Text>
          <Text style={{ fontSize: 15, color: onPrimary, opacity: 0.9, marginTop: 6 }}>{heroSubtitle}</Text>
        </View>

        {/* Raised form card overlapping the band */}
        <ScrollView
          style={{ flex: 1, backgroundColor: colors.surface, marginTop: -24, borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
          contentContainerStyle={{ paddingHorizontal: 28, paddingTop: 32, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {mode === 'update' ? (
            <View style={{ gap: 14 }}>
              <PasswordInput
                placeholder={`New password (min ${vm.minPasswordLength} characters)`}
                value={vm.password}
                onChangeText={vm.onPasswordChange}
                textContentType="newPassword"
                autoComplete="new-password"
                accessibilityLabel="New password"
                returnKeyType="next"
                onSubmitEditing={() => confirmRef.current?.focus()}
                blurOnSubmit={false}
                style={{ height: 50, borderRadius: 14 }}
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
                style={[{ height: 50, borderRadius: 14 }, vm.passwordError ? { borderColor: colors.error } : null]}
              />
              {vm.passwordError ? <Text style={{ color: colors.error, fontSize: 12, marginLeft: 4 }}>{vm.passwordError}</Text> : null}
              <TouchableOpacity
                style={{ height: 50, borderRadius: 14, backgroundColor: vm.canSubmit ? colors.primary : colors.primary + '66', alignItems: 'center', justifyContent: 'center' }}
                onPress={vm.handleUpdatePassword}
                disabled={vm.loading || !vm.canSubmit}
                accessibilityRole="button"
                accessibilityLabel="Update password"
                accessibilityState={{ disabled: vm.loading || !vm.canSubmit, busy: vm.loading }}
              >
                {vm.loading ? <ActivityIndicator accessibilityLabel="Loading" color={onPrimary} /> : <Text style={{ fontSize: 16, fontWeight: '700', color: onPrimary }}>Update password</Text>}
              </TouchableOpacity>
            </View>
          ) : mode === 'reset' ? (
            <View style={{ gap: 14 }}>
              <TextInput
                style={inputStyle}
                placeholder="you@example.com"
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
                style={{ height: 50, borderRadius: 14, backgroundColor: vm.email.trim() ? colors.primary : colors.primary + '66', alignItems: 'center', justifyContent: 'center' }}
                onPress={vm.handleSendResetLink}
                disabled={vm.loading}
                accessibilityRole="button"
                accessibilityLabel="Send reset link"
                accessibilityState={{ disabled: vm.loading, busy: vm.loading }}
              >
                {vm.loading ? <ActivityIndicator accessibilityLabel="Loading" color={onPrimary} /> : <Text style={{ fontSize: 16, fontWeight: '700', color: onPrimary }}>Send reset link</Text>}
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 4 }}>
                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back to sign in">
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary }}>Back to sign in</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          ) : (
            <View style={{ gap: 14 }}>
              <TextInput
                style={inputStyle}
                placeholder="you@example.com"
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
                placeholder={isSignup ? 'Password (min 8 characters)' : 'Password'}
                value={vm.password}
                onChangeText={isSignup ? vm.onPasswordChange : vm.setPassword}
                textContentType={isSignup ? 'newPassword' : 'password'}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                accessibilityLabel="Password"
                returnKeyType={isSignup ? 'next' : 'go'}
                onSubmitEditing={isSignup ? () => confirmRef.current?.focus() : vm.handleEmailLogin}
                blurOnSubmit={!isSignup ? undefined : false}
                style={{ height: 50, borderRadius: 14 }}
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
                    style={[{ height: 50, borderRadius: 14 }, vm.passwordError ? { borderColor: colors.error } : null]}
                  />
                  {vm.passwordError ? <Text style={{ color: colors.error, fontSize: 12, marginLeft: 4 }}>{vm.passwordError}</Text> : null}
                </>
              )}

              {isLogin && (
                <View style={{ alignItems: 'flex-end' }}>
                  <Link href="/(auth)/reset-password" asChild>
                    <TouchableOpacity accessibilityRole="button" accessibilityLabel="Forgot password" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primary }}>Forgot password?</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              )}

              <TouchableOpacity
                style={{ height: 50, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}
                onPress={isSignup ? vm.handleEmailSignup : vm.handleEmailLogin}
                disabled={isSignup ? !vm.canSubmit : !vm.canSubmit}
                accessibilityRole="button"
                accessibilityLabel={isSignup ? 'Create account' : 'Sign in'}
                accessibilityState={{ disabled: !vm.canSubmit, busy: vm.loading }}
              >
                {vm.loading ? <ActivityIndicator accessibilityLabel="Loading" color={onPrimary} /> : <Text style={{ fontSize: 16, fontWeight: '700', color: onPrimary }}>{isSignup ? 'Create account' : 'Sign in'}</Text>}
              </TouchableOpacity>

              {vm.hasOAuth && (
                <>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4 }}>
                    <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>or</Text>
                    <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                  </View>
                  {vm.showGoogle && (
                    <TouchableOpacity
                      style={oauthBtnStyle}
                      onPress={() => (isSignup ? vm.handleOAuthSignup('google') : vm.handleOAuthLogin('google'))}
                      disabled={vm.loading}
                      accessibilityRole="button"
                      accessibilityLabel={isSignup ? 'Continue with Google' : 'Sign in with Google'}
                      accessibilityState={{ disabled: vm.loading, busy: vm.oauthProvider === 'google' }}
                    >
                      <ProviderIcon provider="google" size={18} />
                      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>Google</Text>
                    </TouchableOpacity>
                  )}
                  {vm.showApple && (
                    <TouchableOpacity
                      style={oauthBtnStyle}
                      onPress={isSignup ? vm.handleAppleSignup : vm.handleAppleLogin}
                      disabled={vm.loading}
                      accessibilityRole="button"
                      accessibilityLabel={isSignup ? 'Continue with Apple' : 'Sign in with Apple'}
                      accessibilityState={{ disabled: vm.loading, busy: vm.oauthProvider === 'apple' }}
                    >
                      <ProviderIcon provider="apple" size={18} color={colors.text} />
                      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>Apple</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 8 }}>
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>{isSignup ? 'Already have an account?' : "Don't have an account?"}</Text>
                <Link href={isSignup ? '/(auth)/login' : '/(auth)/signup'} asChild>
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel={isSignup ? 'Go to login' : 'Go to sign up'}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: colors.primary }}>{isSignup ? 'Sign in' : 'Sign up'}</Text>
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

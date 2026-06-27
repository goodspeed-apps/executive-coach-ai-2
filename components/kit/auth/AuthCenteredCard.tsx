/**
 * GAS Template, Auth Variant: Centered Card (DEFAULT)
 *
 * The DEFAULT auth layout. Reproduces today's exact auth screens byte-for-byte:
 * centered logo header, a scrollable centered column, 48px rounded inputs, a
 * filled primary submit, and the OAuth provider stack under a divider. The four
 * route files used to own this JSX inline; it now lives here, switched on `mode`,
 * so every other variant is a sibling swap.
 *
 * Layout only, all behavior comes from `vm` (the controller view-model). All
 * colors come from useThemeColors(), never hardcoded. accessibilityLabel +
 * accessibilityRole on the email / password / submit / OAuth controls are the
 * FROZEN selector contract and are kept identical to the originals.
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
import { safeText } from '@/lib/format';

export function AuthCenteredCard({ mode, vm }: AuthVariantProps) {
  const { colors } = useThemeColors();

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const inputStyle = {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
  };

  const oauthBtnStyle = {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 10,
  };

  // ─── login ──────────────────────────────────────────────────────────────
  if (mode === 'login') {
    return (
      <Entrance style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo header */}
            <View style={{ alignItems: 'center', paddingTop: 48, paddingBottom: 40, gap: 16 }}>
              <AppLogo size={72} />
              <View style={{ alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.5 }}>
                  {vm.appName}
                </Text>
                <Text style={{ fontSize: 15, color: colors.textSecondary }}>Welcome back</Text>
              </View>
            </View>

            {/* Email form */}
            <View style={{ gap: 12, marginBottom: 24 }}>
              <TextInput
                ref={emailRef}
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
                placeholder="Password"
                value={vm.password}
                onChangeText={vm.setPassword}
                textContentType="password"
                autoComplete="current-password"
                accessibilityLabel="Password"
                returnKeyType="go"
                onSubmitEditing={vm.handleEmailLogin}
              />

              {/* Forgot password */}
              <View style={{ alignItems: 'flex-end' }}>
                <Link href="/(auth)/reset-password" asChild>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Forgot password"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primary }}>
                      Forgot password?
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>

              {/* Resend verification, only after an "email not confirmed" failure */}
              {vm.emailUnconfirmed && (
                <TouchableOpacity
                  onPress={vm.handleResendVerification}
                  disabled={vm.resending}
                  accessibilityRole="button"
                  accessibilityLabel="Resend verification email"
                  accessibilityState={{ disabled: vm.resending, busy: vm.resending }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={{ alignItems: 'center' }}
                >
                  {vm.resending ? (
                    <ActivityIndicator accessibilityLabel="Loading" color={colors.primary} />
                  ) : (
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>
                      Resend verification email
                    </Text>
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={{
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: vm.email && vm.password ? colors.primary : colors.primary + '66',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={vm.handleEmailLogin}
                disabled={!vm.canSubmit}
                accessibilityRole="button"
                accessibilityLabel="Sign in"
                accessibilityState={{ disabled: !vm.canSubmit, busy: vm.loading }}
              >
                {vm.loading ? (
                  <ActivityIndicator accessibilityLabel="Loading" color="white" />
                ) : (
                  <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>Sign In</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* OAuth divider, only shown if OAuth buttons are present */}
            {vm.hasOAuth && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>or continue with</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
              </View>
            )}

            {/* OAuth buttons, conditional on config */}
            {vm.hasOAuth && (
              <View style={{ gap: 12, marginBottom: 32 }}>
                {vm.showGoogle && (
                  <TouchableOpacity
                    style={oauthBtnStyle}
                    onPress={() => vm.handleOAuthLogin('google')}
                    disabled={vm.loading}
                    accessibilityRole="button"
                    accessibilityLabel="Sign in with Google"
                    accessibilityState={{ disabled: vm.loading, busy: vm.oauthProvider === 'google' }}
                  >
                    {vm.oauthProvider === 'google' ? (
                      <ActivityIndicator accessibilityLabel="Loading" size="small" color={colors.text} />
                    ) : (
                      <ProviderIcon provider="google" size={18} />
                    )}
                    <Text style={{ fontSize: 15, fontWeight: '500', color: colors.text }}>Continue with Google</Text>
                  </TouchableOpacity>
                )}

                {vm.showTwitter && (
                  <TouchableOpacity
                    style={oauthBtnStyle}
                    onPress={() => vm.handleOAuthLogin('twitter')}
                    disabled={vm.loading}
                    accessibilityRole="button"
                    accessibilityLabel="Sign in with Twitter"
                    accessibilityState={{ disabled: vm.loading, busy: vm.oauthProvider === 'twitter' }}
                  >
                    {vm.oauthProvider === 'twitter' ? (
                      <ActivityIndicator accessibilityLabel="Loading" size="small" color={colors.text} />
                    ) : (
                      <ProviderIcon provider="x" size={16} color={colors.text} />
                    )}
                    <Text style={{ fontSize: 15, fontWeight: '500', color: colors.text }}>Continue with X</Text>
                  </TouchableOpacity>
                )}

                {vm.showLinkedIn && (
                  <TouchableOpacity
                    style={oauthBtnStyle}
                    onPress={() => vm.handleOAuthLogin('linkedin_oidc')}
                    disabled={vm.loading}
                    accessibilityRole="button"
                    accessibilityLabel="Sign in with LinkedIn"
                    accessibilityState={{ disabled: vm.loading, busy: vm.oauthProvider === 'linkedin_oidc' }}
                  >
                    {vm.oauthProvider === 'linkedin_oidc' ? (
                      <ActivityIndicator accessibilityLabel="Loading" size="small" color={colors.text} />
                    ) : (
                      <ProviderIcon provider="linkedin" size={18} />
                    )}
                    <Text style={{ fontSize: 15, fontWeight: '500', color: colors.text }}>Continue with LinkedIn</Text>
                  </TouchableOpacity>
                )}

                {vm.showMicrosoft && (
                  <TouchableOpacity
                    style={oauthBtnStyle}
                    onPress={() => vm.handleOAuthLogin('azure')}
                    disabled={vm.loading}
                    accessibilityRole="button"
                    accessibilityLabel="Sign in with Microsoft"
                    accessibilityState={{ disabled: vm.loading, busy: vm.oauthProvider === 'azure' }}
                  >
                    {vm.oauthProvider === 'azure' ? (
                      <ActivityIndicator accessibilityLabel="Loading" size="small" color={colors.text} />
                    ) : (
                      <ProviderIcon provider="microsoft" size={18} />
                    )}
                    <Text style={{ fontSize: 15, fontWeight: '500', color: colors.text }}>Continue with Microsoft</Text>
                  </TouchableOpacity>
                )}

                {vm.showApple && (
                  <TouchableOpacity
                    style={oauthBtnStyle}
                    onPress={vm.handleAppleLogin}
                    disabled={vm.loading}
                    accessibilityRole="button"
                    accessibilityLabel="Sign in with Apple"
                    accessibilityState={{ disabled: vm.loading, busy: vm.oauthProvider === 'apple' }}
                  >
                    {vm.oauthProvider === 'apple' ? (
                      <ActivityIndicator accessibilityLabel="Loading" size="small" color={colors.text} />
                    ) : (
                      <ProviderIcon provider="apple" size={18} color={colors.text} />
                    )}
                    <Text style={{ fontSize: 15, fontWeight: '500', color: colors.text }}>Continue with Apple</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Switch to signup */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>Don't have an account?</Text>
              <Link href="/(auth)/signup" asChild>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go to sign up">
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>Sign up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      </Entrance>
    );
  }

  // ─── signup ─────────────────────────────────────────────────────────────
  if (mode === 'signup') {
    // Verification-sent sub-screen (vm flag branch).
    if (vm.verificationSent) {
      return (
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, backgroundColor: colors.background }}>
          <MailCheck size={48} color={colors.primary} strokeWidth={1.5} style={{ marginBottom: 16 }} />
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 8, textAlign: 'center' }}>
            Check your email
          </Text>
          <Text style={{ fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginBottom: 8, lineHeight: 22 }}>
            We sent a verification link to{' '}
            <Text style={{ color: colors.primary, fontWeight: '600' }}>{vm.email}</Text>.
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 32, lineHeight: 20 }}>
            Tap the link in the email to activate your account. Check your spam folder if you don't see it within a few minutes.
          </Text>
          <TouchableOpacity
            style={{
              height: 48, width: '100%', borderRadius: 12,
              backgroundColor: colors.primary,
              alignItems: 'center', justifyContent: 'center', marginBottom: 12,
            }}
            onPress={vm.backToLogin}
            accessibilityRole="button"
            accessibilityLabel="Back to login"
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>Back to Login</Text>
          </TouchableOpacity>

          {vm.resentConfirmation && vm.resendCooldown > 0 ? (
            <Text style={{ fontSize: 14, color: colors.success, fontWeight: '500', marginBottom: 4 }}>
              Verification email sent
            </Text>
          ) : null}

          <TouchableOpacity
            onPress={vm.handleResendVerification}
            disabled={vm.resending || vm.resendCooldown > 0}
            accessibilityRole="button"
            accessibilityLabel="Resend verification email"
            accessibilityState={{ disabled: vm.resending || vm.resendCooldown > 0, busy: vm.resending }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {vm.resending ? (
              <ActivityIndicator accessibilityLabel="Loading" color={colors.primary} />
            ) : (
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: vm.resendCooldown > 0 ? colors.textSecondary : colors.primary,
                }}
              >
                {vm.resendCooldown > 0 ? `Resend email in ${safeText(vm.resendCooldown)}s` : 'Resend email'}
              </Text>
            )}
          </TouchableOpacity>
        </SafeAreaView>
      );
    }

    return (
      <Entrance style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo */}
            <View style={{ alignItems: 'center', paddingTop: 40, paddingBottom: 32, gap: 12 }}>
              <AppLogo size={72} />
              <View style={{ alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.5 }}>
                  {vm.appName}
                </Text>
                <Text style={{ fontSize: 15, color: colors.textSecondary }}>Create your account</Text>
              </View>
            </View>

            {/* OAuth buttons ABOVE email form, scroll out of view when keyboard opens */}
            {vm.hasOAuth && (
              <View style={{ gap: 10, marginBottom: 20 }}>
                {vm.showGoogle && (
                  <TouchableOpacity
                    style={oauthBtnStyle}
                    onPress={() => vm.handleOAuthSignup('google')}
                    disabled={vm.loading}
                    accessibilityRole="button"
                    accessibilityLabel="Continue with Google"
                    accessibilityState={{ disabled: vm.loading, busy: vm.oauthProvider === 'google' }}
                  >
                    {vm.oauthProvider === 'google' ? (
                      <ActivityIndicator accessibilityLabel="Loading" size="small" color={colors.text} />
                    ) : (
                      <ProviderIcon provider="google" size={18} />
                    )}
                    <Text style={{ fontSize: 15, fontWeight: '500', color: colors.text }}>Continue with Google</Text>
                  </TouchableOpacity>
                )}

                {vm.showTwitter && (
                  <TouchableOpacity
                    style={oauthBtnStyle}
                    onPress={() => vm.handleOAuthSignup('twitter')}
                    disabled={vm.loading}
                    accessibilityRole="button"
                    accessibilityLabel="Continue with X"
                    accessibilityState={{ disabled: vm.loading, busy: vm.oauthProvider === 'twitter' }}
                  >
                    {vm.oauthProvider === 'twitter' ? (
                      <ActivityIndicator accessibilityLabel="Loading" size="small" color={colors.text} />
                    ) : (
                      <ProviderIcon provider="x" size={16} color={colors.text} />
                    )}
                    <Text style={{ fontSize: 15, fontWeight: '500', color: colors.text }}>Continue with X</Text>
                  </TouchableOpacity>
                )}

                {vm.showLinkedIn && (
                  <TouchableOpacity
                    style={oauthBtnStyle}
                    onPress={() => vm.handleOAuthSignup('linkedin_oidc')}
                    disabled={vm.loading}
                    accessibilityRole="button"
                    accessibilityLabel="Continue with LinkedIn"
                    accessibilityState={{ disabled: vm.loading, busy: vm.oauthProvider === 'linkedin_oidc' }}
                  >
                    {vm.oauthProvider === 'linkedin_oidc' ? (
                      <ActivityIndicator accessibilityLabel="Loading" size="small" color={colors.text} />
                    ) : (
                      <ProviderIcon provider="linkedin" size={18} />
                    )}
                    <Text style={{ fontSize: 15, fontWeight: '500', color: colors.text }}>Continue with LinkedIn</Text>
                  </TouchableOpacity>
                )}

                {vm.showMicrosoft && (
                  <TouchableOpacity
                    style={oauthBtnStyle}
                    onPress={() => vm.handleOAuthSignup('azure')}
                    disabled={vm.loading}
                    accessibilityRole="button"
                    accessibilityLabel="Continue with Microsoft"
                    accessibilityState={{ disabled: vm.loading, busy: vm.oauthProvider === 'azure' }}
                  >
                    {vm.oauthProvider === 'azure' ? (
                      <ActivityIndicator accessibilityLabel="Loading" size="small" color={colors.text} />
                    ) : (
                      <ProviderIcon provider="microsoft" size={18} />
                    )}
                    <Text style={{ fontSize: 15, fontWeight: '500', color: colors.text }}>Continue with Microsoft</Text>
                  </TouchableOpacity>
                )}

                {vm.showApple && (
                  <TouchableOpacity
                    style={oauthBtnStyle}
                    onPress={vm.handleAppleSignup}
                    disabled={vm.loading}
                    accessibilityRole="button"
                    accessibilityLabel="Continue with Apple"
                    accessibilityState={{ disabled: vm.loading, busy: vm.oauthProvider === 'apple' }}
                  >
                    {vm.oauthProvider === 'apple' ? (
                      <ActivityIndicator accessibilityLabel="Loading" size="small" color={colors.text} />
                    ) : (
                      <ProviderIcon provider="apple" size={18} color={colors.text} />
                    )}
                    <Text style={{ fontSize: 15, fontWeight: '500', color: colors.text }}>Continue with Apple</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Divider */}
            {vm.hasOAuth && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>or sign up with email</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
              </View>
            )}

            {/* Email form */}
            <View style={{ gap: 12, marginBottom: 20 }}>
              <TextInput
                ref={emailRef}
                style={inputStyle}
                placeholder="Email address"
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
                placeholder="Password (min 8 characters)"
                value={vm.password}
                onChangeText={vm.onPasswordChange}
                textContentType="newPassword"
                autoComplete="new-password"
                accessibilityLabel="Password"
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                blurOnSubmit={false}
              />
              <View>
                <PasswordInput
                  ref={confirmPasswordRef}
                  style={vm.passwordError ? { borderColor: colors.error } : undefined}
                  placeholder="Confirm password"
                  value={vm.confirmPassword}
                  onChangeText={vm.onConfirmPasswordChange}
                  textContentType="newPassword"
                  autoComplete="new-password"
                  accessibilityLabel="Confirm password"
                  returnKeyType="done"
                  onSubmitEditing={vm.handleEmailSignup}
                />
                {vm.passwordError ? (
                  <Text style={{ color: colors.error, fontSize: 12, marginTop: 4, marginLeft: 4 }}>
                    {vm.passwordError}
                  </Text>
                ) : null}
              </View>

              <TouchableOpacity
                style={{
                  height: 48,
                  borderRadius: 12,
                  // Fade tracks the SAME state as `disabled` below (vm.canSubmit), so the button is
                  // never shown faded-but-enabled, a faded+disabled control is exempt from the WCAG
                  // contrast check, while an enabled button shows solid primary (passes contrast).
                  backgroundColor: vm.canSubmit ? colors.primary : colors.primary + '66',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={vm.handleEmailSignup}
                disabled={!vm.canSubmit}
                accessibilityRole="button"
                accessibilityLabel="Create account"
                accessibilityState={{ disabled: !vm.canSubmit, busy: vm.loading }}
              >
                {vm.loading ? (
                  <ActivityIndicator accessibilityLabel="Loading" color="white" />
                ) : (
                  <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>Create Account</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Legal */}
            <Text style={{ fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginBottom: 20, lineHeight: 18 }}>
              By creating an account you agree to our Terms of Service and Privacy Policy.
            </Text>

            {/* Switch to login */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>Already have an account?</Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go to login">
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>Sign in</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      </Entrance>
    );
  }

  // ─── reset (request a reset link) ──────────────────────────────────────────
  if (mode === 'reset') {
    if (vm.sent) {
      return (
        <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, backgroundColor: colors.background }}>
          <MailCheck size={48} color={colors.primary} strokeWidth={1.5} style={{ marginBottom: 16 }} />
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 8, textAlign: 'center' }}>
            Check your email
          </Text>
          <Text style={{ fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginBottom: 8, lineHeight: 22 }}>
            If an account exists for{' '}
            <Text style={{ color: colors.primary, fontWeight: '600' }}>{vm.email.trim()}</Text>, we sent a link to reset your password.
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 32, lineHeight: 20 }}>
            Tap the link in the email to choose a new password. Check your spam folder if you don't see it within a few minutes.
          </Text>
          <TouchableOpacity
            style={{
              height: 48, width: '100%', borderRadius: 12,
              backgroundColor: colors.primary,
              alignItems: 'center', justifyContent: 'center', marginBottom: 12,
            }}
            onPress={() => router.replace('/(auth)/login')}
            accessibilityRole="button"
            accessibilityLabel="Back to sign in"
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>Back to sign in</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={vm.handleSendResetLink}
            disabled={vm.loading}
            accessibilityRole="button"
            accessibilityLabel="Resend reset link"
            accessibilityState={{ disabled: vm.loading, busy: vm.loading }}
          >
            <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '500' }}>Resend email</Text>
          </TouchableOpacity>
        </SafeAreaView>
      );
    }

    return (
      <Entrance style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo header */}
            <View style={{ alignItems: 'center', paddingTop: 48, paddingBottom: 32, gap: 16 }}>
              <View style={{
                width: 72, height: 72, borderRadius: 20,
                backgroundColor: colors.primary,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 32, fontWeight: '800', color: '#FFFFFF' }}>
                  {vm.appName.charAt(0)}
                </Text>
              </View>
              <View style={{ alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.5 }}>
                  Reset password
                </Text>
                <Text style={{ fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 21 }}>
                  Enter your email and we'll send you a link to choose a new password.
                </Text>
              </View>
            </View>

            {/* Email form */}
            <View style={{ gap: 12, marginBottom: 24 }}>
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
                style={{
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: vm.email.trim() ? colors.primary : colors.primary + '66',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={vm.handleSendResetLink}
                // Disabled (and faded, per backgroundColor above) until an email is entered, keeps the
                // faded state semantically disabled so white-on-faded is exempt from the WCAG contrast check.
                disabled={vm.loading || !vm.email.trim()}
                accessibilityRole="button"
                accessibilityLabel="Send reset link"
                accessibilityState={{ disabled: vm.loading || !vm.email.trim(), busy: vm.loading }}
              >
                {vm.loading ? (
                  <ActivityIndicator accessibilityLabel="Loading" color="white" />
                ) : (
                  <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>Send reset link</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Back to sign in */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>Remember your password?</Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back to sign in">
                  <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>Back to sign in</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      </Entrance>
    );
  }

  // ─── update (choose a new password) ────────────────────────────────────────
  return (
    <Entrance style={{ flex: 1 }}>
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo header */}
          <View style={{ alignItems: 'center', paddingTop: 48, paddingBottom: 32, gap: 16 }}>
            <View style={{
              width: 72, height: 72, borderRadius: 20,
              backgroundColor: colors.primary,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 32, fontWeight: '800', color: '#FFFFFF' }}>
                {vm.appName.charAt(0)}
              </Text>
            </View>
            <View style={{ alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.5 }}>
                Choose a new password
              </Text>
              <Text style={{ fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 21 }}>
                Enter a new password for your account.
              </Text>
            </View>
          </View>

          {/* Password form */}
          <View style={{ gap: 12, marginBottom: 24 }}>
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
            />
            <View>
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
                style={vm.passwordError ? { borderColor: colors.error } : undefined}
              />
              {vm.passwordError ? (
                <Text style={{ color: colors.error, fontSize: 12, marginTop: 4, marginLeft: 4 }}>
                  {vm.passwordError}
                </Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={{
                height: 48,
                borderRadius: 12,
                backgroundColor: vm.canSubmit ? colors.primary : colors.primary + '66',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={vm.handleUpdatePassword}
              disabled={vm.loading || !vm.canSubmit}
              accessibilityRole="button"
              accessibilityLabel="Update password"
              accessibilityState={{ disabled: vm.loading || !vm.canSubmit, busy: vm.loading }}
            >
              {vm.loading ? (
                <ActivityIndicator accessibilityLabel="Loading" color="white" />
              ) : (
                <Text style={{ fontSize: 16, fontWeight: '600', color: 'white' }}>Update password</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </Entrance>
  );
}

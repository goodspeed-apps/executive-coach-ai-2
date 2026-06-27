/**
 * GAS Template, Auth Variant: Bold Header
 *
 * Loud and expressive. An oversized two-line display headline anchors the top,
 * inputs are FILLED pills (no visible border, surface fill, fully rounded), the
 * submit is a fully-rounded pill, and OAuth buttons are filled pills too. The
 * scale of the header and the pill geometry make it read very differently from
 * the boxed centered-card and the underlined minimal-stack.
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
import { ProviderIcon } from '@/components/auth/ProviderIcon';
import { PasswordInput } from '@/components/auth/PasswordInput';
import { Entrance } from '../motion/Entrance';
import type { AuthVariantProps } from './types';

export function AuthBoldHeader({ mode, vm }: AuthVariantProps) {
  const { colors } = useThemeColors();
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const isSignup = mode === 'signup';
  const isLogin = mode === 'login';

  // Filled pill: no visible border, surface fill, fully rounded.
  const pillInput = {
    height: 56,
    borderRadius: 28,
    borderWidth: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    fontSize: 16,
    color: colors.text,
  };
  const pillPassword = {
    height: 56,
    borderRadius: 28,
    borderWidth: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    paddingRight: 52,
  };
  const pillOauth = {
    height: 56,
    borderRadius: 28,
    borderWidth: 0,
    backgroundColor: colors.surface,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 10,
  };

  if ((isSignup && vm.verificationSent) || (mode === 'reset' && vm.sent)) {
    const target = isSignup ? vm.email : vm.email.trim();
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 28, backgroundColor: colors.background }}>
        <MailCheck size={56} color={colors.primary} strokeWidth={1.5} style={{ marginBottom: 20 }} />
        <Text style={{ fontSize: 40, fontWeight: '900', color: colors.text, letterSpacing: -1.5, lineHeight: 44, marginBottom: 16 }}>
          Check{'\n'}your email
        </Text>
        <Text style={{ fontSize: 16, color: colors.textSecondary, marginBottom: 36, lineHeight: 23 }}>
          We sent a link to {target}.
        </Text>
        <TouchableOpacity
          style={{ height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}
          onPress={isSignup ? vm.backToLogin : () => router.replace('/(auth)/login')}
          accessibilityRole="button"
          accessibilityLabel={isSignup ? 'Back to login' : 'Back to sign in'}
        >
          <Text style={{ fontSize: 17, fontWeight: '800', color: colors.textOnPrimary }}>Back to sign in</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const headline = isLogin
    ? ['Welcome', 'back.']
    : isSignup
      ? ["Let's", 'get started.']
      : mode === 'reset'
        ? ['Reset', 'password.']
        : ['Set a new', 'password.'];

  return (
    <Entrance style={{ flex: 1 }}>
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 28, paddingTop: 24, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Headline */}
          <View style={{ marginBottom: 36 }}>
            {headline.map((line, i) => (
              <Text key={i} style={{ fontSize: 48, fontWeight: '900', color: colors.text, letterSpacing: -2, lineHeight: 52 }}>
                {line}
              </Text>
            ))}
          </View>

          {/* Email */}
          <TextInput
            style={[pillInput, { marginBottom: 12 }]}
            placeholder="Email"
            placeholderTextColor={colors.placeholder}
            value={vm.email}
            onChangeText={vm.setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType={isLogin || mode === 'reset' ? 'done' : 'next'}
            onSubmitEditing={() => passwordRef.current?.focus()}
            accessibilityLabel="Email"
          />

          {/* Password */}
          {mode !== 'reset' && (
            <PasswordInput
              ref={passwordRef}
              style={pillPassword}
              placeholder="Password"
              value={vm.password}
              onChangeText={vm.setPassword}
              returnKeyType={isSignup ? 'next' : 'done'}
              onSubmitEditing={() => isSignup ? confirmRef.current?.focus() : vm.handleSubmit()}
              accessibilityLabel="Password"
            />
          )}

          {/* Confirm password */}
          {isSignup && (
            <PasswordInput
              ref={confirmRef}
              style={[pillPassword, { marginTop: 12 }]}
              placeholder="Confirm password"
              value={vm.confirmPassword}
              onChangeText={vm.setConfirmPassword}
              returnKeyType="done"
              onSubmitEditing={vm.handleSubmit}
              accessibilityLabel="Confirm password"
            />
          )}

          {/* Error */}
          {vm.error ? (
            <Text style={{ color: colors.error, fontSize: 14, marginTop: 8, marginBottom: 4 }}>{vm.error}</Text>
          ) : null}

          {/* Forgot password */}
          {isLogin && (
            <Link href="/(auth)/reset" asChild>
              <TouchableOpacity style={{ alignSelf: 'flex-end', marginTop: 8, marginBottom: 4 }}>
                <Text style={{ color: colors.primary, fontSize: 14 }}>Forgot password?</Text>
              </TouchableOpacity>
            </Link>
          )}

          {/* Submit */}
          <TouchableOpacity
            onPress={vm.handleSubmit}
            disabled={vm.loading}
            style={{
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 20,
              opacity: vm.loading ? 0.7 : 1,
            }}
            accessibilityRole="button"
            accessibilityLabel={isLogin ? 'Sign in' : isSignup ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Set new password'}
          >
            {vm.loading ? (
              <ActivityIndicator color={colors.textOnPrimary} />
            ) : (
              <Text style={{ fontSize: 17, fontWeight: '800', color: colors.textOnPrimary }}>
                {isLogin ? 'Sign in' : isSignup ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Set new password'}
              </Text>
            )}
          </TouchableOpacity>

          {/* OAuth */}
          {vm.oauthProviders && vm.oauthProviders.length > 0 && (
            <View style={{ marginTop: 28 }}>
              <Text style={{ color: colors.textSecondary, textAlign: 'center', fontSize: 13, marginBottom: 16 }}>or continue with</Text>
              {vm.oauthProviders.map((provider) => (
                <TouchableOpacity
                  key={provider}
                  style={[pillOauth, { marginBottom: 12 }]}
                  onPress={() => vm.handleOAuth(provider)}
                  accessibilityRole="button"
                  accessibilityLabel={`Continue with ${provider}`}
                >
                  <ProviderIcon provider={provider} size={20} color={colors.text} />
                  <Text style={{ color: colors.text, fontSize: 15, fontWeight: '600', textTransform: 'capitalize' }}>{provider}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Switch mode */}
          {(isLogin || isSignup) && (
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
              </Text>
              <Link href={isLogin ? '/(auth)/signup' : '/(auth)/login'} asChild>
                <TouchableOpacity>
                  <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '600' }}>
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </Entrance>
  );
}

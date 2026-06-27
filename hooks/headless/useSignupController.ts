/**
 * GAS Template, Signup Controller (headless)
 *
 * Zero-JSX view-model for the signup screen. Owns email/password/confirm state,
 * password-match validation, the verification-sent + 30s-cooldown resend flow,
 * the OAuth state-CSRF dance (with the richer sessionError/else-failure branch),
 * and Apple sign-up. Imports are RELATIVE (the `hooks` jest project has no @/
 * mapper). NB: this screen imports expo-apple-authentication UNCONDITIONALLY at
 * module top and showApple does NOT gate on Platform, kept verbatim.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '../../lib/supabase';
import { useAnalytics } from '../useAnalytics';
import { addBreadcrumb } from '../../lib/sentry';
import { trackScreenLoad } from '../../lib/performance';
import { signInWithApple } from '../../services/apple-auth';
import { friendlyAuthError } from '../../lib/auth-errors';
import {
  generateAndStoreOAuthState,
  verifyAndClearOAuthState,
  clearOAuthState,
} from '../../lib/crypto';
import { gasConfig } from '../../gas.config';

// Complete any pending auth sessions in the browser.
WebBrowser.maybeCompleteAuthSession();

// --- Config-driven auth flags ---
const AUTH = gasConfig.features.auth;
const SCHEME = gasConfig.app.scheme;
const APP_NAME = gasConfig.app.name;

/**
 * Pull the `state` query parameter out of a callback URL string. Returns null
 * if the URL is malformed or the parameter is missing.
 */
function extractStateFromCallbackUrl(callbackUrl: string): string | null {
  try {
    const url = new URL(callbackUrl);
    return url.searchParams.get('state');
  } catch {
    return null;
  }
}

type OAuthProvider = 'google' | 'twitter' | 'linkedin_oidc' | 'azure';

export interface SignupController {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  onPasswordChange: (value: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (value: string) => void;
  passwordError: string;
  loading: boolean;
  verificationSent: boolean;
  appleAvailable: boolean;
  oauthProvider: OAuthProvider | 'apple' | null;
  resending: boolean;
  resendCooldown: number;
  resentConfirmation: boolean;
  canSubmit: boolean;
  appName: string;
  showGoogle: boolean;
  showApple: boolean;
  showTwitter: boolean;
  showLinkedIn: boolean;
  showMicrosoft: boolean;
  hasOAuth: boolean;
  handleEmailSignup: () => Promise<void>;
  handleResendVerification: () => Promise<void>;
  handleOAuthSignup: (provider: OAuthProvider) => Promise<void>;
  handleAppleSignup: () => Promise<void>;
  backToLogin: () => void;
}

export function useSignupController(): SignupController {
  const { track } = useAnalytics();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);
  // Which OAuth/Apple provider is mid-flight, so we can show a spinner on
  // exactly that button instead of every social button at once.
  const [oauthProvider, setOAuthProvider] = useState<OAuthProvider | 'apple' | null>(null);
  // Resend-verification state for the "check your email" screen.
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resentConfirmation, setResentConfirmation] = useState(false);

  // Capture mount-time once so re-renders don't reset the screen-load baseline.
  const screenStartRef = useRef(Date.now());
  useEffect(() => {
    track('signup_screen_viewed');
    trackScreenLoad('signup', screenStartRef.current);
    if (AUTH.apple) {
      AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  // Tick the resend cooldown down to zero once per second while it's active.
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // --- Password validation ---
  const onConfirmPasswordChange = useCallback((val: string) => {
    setConfirmPassword(val);
    if (password && val && val !== password) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError('');
    }
  }, [password]);

  const onPasswordChange = useCallback((val: string) => {
    setPassword(val);
    if (confirmPassword && val !== confirmPassword) {
      setPasswordError('Passwords do not match');
    } else {
      setPasswordError('');
    }
  }, [confirmPassword]);

  // --- Email/password signup ---
  const handleEmailSignup = useCallback(async () => {
    if (!email.trim()) { Alert.alert('Missing Email', 'Please enter your email address.'); return; }
    if (!password) { Alert.alert('Missing Password', 'Please enter a password.'); return; }
    if (password.length < 8) { Alert.alert('Weak Password', 'Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setPasswordError('Passwords do not match'); return; }

    setLoading(true);
    const emailRedirectTo = makeRedirectUri({
      scheme: SCHEME,
      path: 'auth/callback',
    });
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo },
    });
    setLoading(false);
    if (error) {
      track('signup_failed', { provider: 'email', error: error.message });
      addBreadcrumb('auth', 'Signup failed', { provider: 'email' });
      if (error.message.includes('already registered')) {
        Alert.alert('Account Exists', 'An account with this email already exists. Try signing in instead.');
      } else {
        Alert.alert('Signup Failed', friendlyAuthError(error));
      }
    } else {
      setVerificationSent(true);
      track('signup_attempted', { provider: 'email' });
    }
  }, [email, password, confirmPassword, track]);

  // --- Resend the verification email (verification-sent screen) ---
  // Re-sends just the verification link instead of re-running the full signup,
  // with a 30s cooldown so the button can't be hammered.
  const handleResendVerification = useCallback(async () => {
    if (resending || resendCooldown > 0 || !email.trim()) return;
    setResending(true);
    setResentConfirmation(false);
    const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim() });
    setResending(false);
    if (error) {
      Alert.alert('Could Not Resend', friendlyAuthError(error));
    } else {
      setResentConfirmation(true);
      setResendCooldown(30);
    }
  }, [resending, resendCooldown, email]);

  // --- OAuth signup (Google, Twitter, LinkedIn, Microsoft) ---
  const handleOAuthSignup = useCallback(async (provider: OAuthProvider) => {
    const names: Record<string, string> = { google: 'Google', twitter: 'X (Twitter)', linkedin_oidc: 'LinkedIn', azure: 'Microsoft' };
    const name = names[provider] ?? provider;
    setLoading(true);
    setOAuthProvider(provider);
    const redirectTo = makeRedirectUri({ scheme: SCHEME, path: 'auth/callback' });

    // Generate a cryptographically random state, persist it to secure store,
    // and forward it to the provider. Verifying this value on the callback
    // prevents deep-link spoofing and code replay (P7-6 / H-6).
    const state = await generateAndStoreOAuthState();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        skipBrowserRedirect: true,
        queryParams: { state },
      },
    });
    if (error || !data?.url) {
      await clearOAuthState();
      setLoading(false);
      setOAuthProvider(null);
      Alert.alert(
        `${name} Not Available`,
        `${name} sign-in is not yet enabled. Please sign up with email${appleAvailable ? ' or Apple' : ''}.`
      );
      return;
    }
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type === 'success' && result.url) {
      // Validate the state echoed back by the provider before exchanging the
      // code. `verifyAndClearOAuthState` clears the stored value on every call,
      // so a leaked code can never be replayed against a stale state.
      const returnedState = extractStateFromCallbackUrl(result.url);
      const stateOk = await verifyAndClearOAuthState(returnedState);
      if (!stateOk) {
        addBreadcrumb('auth', 'OAuth state mismatch', { provider });
        track('signup_failed', { provider, error: 'state_mismatch' });
        Alert.alert('Sign In Failed', 'Security check failed. Please try again.');
        setLoading(false);
        setOAuthProvider(null);
        return;
      }
      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(result.url);
      if (sessionError) {
        Alert.alert('Sign In Failed', friendlyAuthError(sessionError));
      } else {
        track('signup_oauth_success', { provider });
      }
    } else if (result.type !== 'cancel' && result.type !== 'dismiss') {
      await clearOAuthState();
      Alert.alert(`${name} Sign In Failed`, 'Authentication was not completed. Please try again.');
    } else {
      // User cancelled or dismissed the in-app browser, drop the stored
      // state so a stale value can't be reused.
      await clearOAuthState();
    }
    setLoading(false);
    setOAuthProvider(null);
  }, [track, appleAvailable]);

  const handleAppleSignup = useCallback(async () => {
    try {
      setLoading(true);
      setOAuthProvider('apple');
      await signInWithApple();
      track('signup_apple_success');
    } catch (e: unknown) {
      // Expo AppleAuthentication throws a CodedError whose `code` is
      // 'ERR_REQUEST_CANCELED' when the user taps Cancel in the native Apple
      // dialog (underlying iOS ASAuthorizationError.canceled, code 1001).
      // Cancelling is normal, return silently, never show an error alert.
      // NB: the cancel sentinel lives on `.code`, NOT `.message` (message is
      // the human-readable "The user canceled the authorization attempt.").
      const code = (e as { code?: string })?.code;
      if (code === 'ERR_REQUEST_CANCELED') return;
      Alert.alert('Error', friendlyAuthError(e));
    } finally {
      setLoading(false);
      setOAuthProvider(null);
    }
  }, [track]);

  const backToLogin = useCallback(() => {
    router.replace('/(auth)/login');
  }, []);

  // Determine if any OAuth buttons will be shown.
  const showGoogle = AUTH.google;
  const showApple = AUTH.apple && appleAvailable;
  const showTwitter = AUTH.twitter;
  const showLinkedIn = AUTH.linkedin === true;
  const showMicrosoft = AUTH.microsoft === true;
  const hasOAuth = showGoogle || showApple || showTwitter || showLinkedIn || showMicrosoft;

  // The submit button is disabled on `loading || !!passwordError`; its filled
  // style additionally requires all three fields present. canSubmit captures
  // the enabled condition (the screen keeps its own color expression).
  const canSubmit = !loading && !passwordError;

  return {
    email,
    setEmail,
    password,
    onPasswordChange,
    confirmPassword,
    onConfirmPasswordChange,
    passwordError,
    loading,
    verificationSent,
    appleAvailable,
    oauthProvider,
    resending,
    resendCooldown,
    resentConfirmation,
    canSubmit,
    appName: APP_NAME,
    showGoogle,
    showApple,
    showTwitter,
    showLinkedIn,
    showMicrosoft,
    hasOAuth,
    handleEmailSignup,
    handleResendVerification,
    handleOAuthSignup,
    handleAppleSignup,
    backToLogin,
  };
}

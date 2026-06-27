/**
 * GAS Template, Login Controller (headless)
 *
 * Zero-JSX view-model for the login screen. Owns email/password state, the
 * OAuth state-CSRF dance, Apple sign-in, and the resend-verification flow.
 * The screen consumes this hook and renders the view; no behavior lives in the
 * screen. Imports are RELATIVE (the `hooks` jest project has no @/ mapper).
 */

import { useState, useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '../../lib/supabase';
import { useAnalytics } from '../useAnalytics';
import { addBreadcrumb } from '../../lib/sentry';
import { trackScreenLoad } from '../../lib/performance';
import { isWeb } from '../../lib/platform';
import { signInWithApple } from '../../services/apple-auth';
import { friendlyAuthError, isEmailNotConfirmed } from '../../lib/auth-errors';
import {
  generateAndStoreOAuthState,
  verifyAndClearOAuthState,
  clearOAuthState,
} from '../../lib/crypto';
import { gasConfig } from '../../gas.config';

// Conditionally import Apple Authentication (only available on iOS native)
let AppleAuthentication: typeof import('expo-apple-authentication') | null = null;
if (!isWeb && Platform.OS === 'ios') {
  try {
    AppleAuthentication = require('expo-apple-authentication');
  } catch {
    // Module not available
  }
}

// Complete any pending auth sessions in the browser.
WebBrowser.maybeCompleteAuthSession();

// --- Config-driven auth flags ---
const AUTH = gasConfig.features.auth;
const SCHEME = gasConfig.app.scheme;
const APP_NAME = gasConfig.app.name;

// Provider display names for error messages.
const PROVIDER_NAMES: Record<string, string> = {
  google: 'Google',
  twitter: 'Twitter',
  linkedin_oidc: 'LinkedIn',
  azure: 'Microsoft',
};

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

export interface LoginController {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  loading: boolean;
  appleAvailable: boolean;
  oauthProvider: OAuthProvider | 'apple' | null;
  emailUnconfirmed: boolean;
  resending: boolean;
  canSubmit: boolean;
  appName: string;
  showGoogle: boolean;
  showApple: boolean;
  showTwitter: boolean;
  showLinkedIn: boolean;
  showMicrosoft: boolean;
  hasOAuth: boolean;
  handleEmailLogin: () => Promise<void>;
  handleResendVerification: () => Promise<void>;
  handleOAuthLogin: (provider: OAuthProvider) => Promise<void>;
  handleAppleLogin: () => Promise<void>;
}

export function useLoginController(): LoginController {
  const { track } = useAnalytics();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);
  // Which OAuth/Apple provider is mid-flight, so we can show a spinner on
  // exactly that button instead of every social button at once.
  const [oauthProvider, setOAuthProvider] = useState<OAuthProvider | 'apple' | null>(null);
  // True only when the last email login failed with "email not confirmed",
  // which lets us offer an inline "Resend verification email" action.
  const [emailUnconfirmed, setEmailUnconfirmed] = useState(false);
  const [resending, setResending] = useState(false);

  // Capture mount-time once so re-renders don't reset the screen-load baseline.
  const screenStartRef = useRef(Date.now());
  useEffect(() => {
    track('login_screen_viewed');
    trackScreenLoad('login', screenStartRef.current);
    if (AUTH.apple && !isWeb && AppleAuthentication) {
      AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
    }
  }, [track]);

  // --- Email/password login ---
  async function handleEmailLogin() {
    if (!email || !password) return;
    setLoading(true);
    setEmailUnconfirmed(false);
    track('login_attempted', { provider: 'email' });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      track('login_failed', { provider: 'email', error: error.message });
      addBreadcrumb('auth', 'Login failed', { provider: 'email' });
      if (isEmailNotConfirmed(error)) {
        setEmailUnconfirmed(true);
      }
      Alert.alert('Login Failed', friendlyAuthError(error));
    } else {
      track('login_succeeded', { provider: 'email' });
    }
  }

  // --- Resend the signup verification email after an unconfirmed login ---
  async function handleResendVerification() {
    if (!email || resending) return;
    setResending(true);
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    setResending(false);
    if (error) {
      Alert.alert('Could Not Resend', friendlyAuthError(error));
    } else {
      Alert.alert('Verification email sent', 'Check your inbox for the verification link.');
    }
  }

  // --- OAuth login (Google, Twitter, LinkedIn, Microsoft) ---
  async function handleOAuthLogin(provider: OAuthProvider) {
    setLoading(true);
    setOAuthProvider(provider);
    const redirectTo = makeRedirectUri({ scheme: SCHEME, path: 'auth/callback' });

    // Generate a cryptographically random state, persist it to secure store,
    // and forward it to the provider as a query param. Verifying this value
    // on the callback prevents deep-link spoofing and code replay (P7-6 / H-6).
    const state = await generateAndStoreOAuthState();

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        skipBrowserRedirect: true,
        queryParams: { state },
      },
    });
    if (error || !data.url) {
      await clearOAuthState();
      setLoading(false);
      setOAuthProvider(null);
      const name = PROVIDER_NAMES[provider] ?? provider;
      Alert.alert(
        `${name} Sign In Unavailable`,
        `${name} sign-in isn't configured yet. Please use email${appleAvailable ? ' or Apple' : ''} to sign in.`
      );
      return;
    }
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type === 'success') {
      // Validate the state echoed back by the provider before exchanging the
      // code. `verifyAndClearOAuthState` clears the stored value on every call,
      // so a leaked code can never be replayed against a stale state.
      const returnedState = extractStateFromCallbackUrl(result.url);
      const stateOk = await verifyAndClearOAuthState(returnedState);
      if (!stateOk) {
        addBreadcrumb('auth', 'OAuth state mismatch', { provider });
        track('login_failed', { provider, error: 'state_mismatch' });
        Alert.alert('Sign In Failed', 'Security check failed. Please try again.');
        setLoading(false);
        setOAuthProvider(null);
        return;
      }
      await supabase.auth.exchangeCodeForSession(result.url);
    } else {
      // User cancelled, dismissed, or the flow errored before completing, 
      // drop the stored state so a stale value can't be reused.
      await clearOAuthState();
    }
    setLoading(false);
    setOAuthProvider(null);
  }

  async function handleAppleLogin() {
    if (isWeb) return;
    try {
      setLoading(true);
      setOAuthProvider('apple');
      await signInWithApple();
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
  }

  // Determine if any OAuth buttons will be shown.
  const showGoogle = AUTH.google;
  const showApple = !isWeb && Platform.OS === 'ios' && AUTH.apple && appleAvailable;
  const showTwitter = AUTH.twitter;
  const showLinkedIn = AUTH.linkedin === true;
  const showMicrosoft = AUTH.microsoft === true;
  const hasOAuth = showGoogle || showApple || showTwitter || showLinkedIn || showMicrosoft;

  const canSubmit = !loading && !!email && !!password;

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    appleAvailable,
    oauthProvider,
    emailUnconfirmed,
    resending,
    canSubmit,
    appName: APP_NAME,
    showGoogle,
    showApple,
    showTwitter,
    showLinkedIn,
    showMicrosoft,
    hasOAuth,
    handleEmailLogin,
    handleResendVerification,
    handleOAuthLogin,
    handleAppleLogin,
  };
}

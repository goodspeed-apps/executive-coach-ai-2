/**
 * GAS Template, Password Recovery Controllers (headless)
 *
 * Two zero-JSX view-models for the recovery flow:
 *  - useResetPasswordController(): request a reset link (step 1)
 *  - useUpdatePasswordController(): exchange the recovery code, set the new
 *    password, and route into the app (step 2)
 *
 * The update hook preserves the byte-for-byte exchange ordering:
 *   getSession -> if(!session) exchangeCodeForSession(code) [bail 'Link Expired'
 *   on exchangeError] -> updateUser({password}) [handle 'should be different']
 *   -> track success -> router.replace(`/(tabs)/${firstTab}`).
 *
 * Imports are RELATIVE (the `hooks` jest project has no @/ mapper).
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '../../lib/supabase';
import { useAnalytics } from '../useAnalytics';
import { addBreadcrumb } from '../../lib/sentry';
import { trackScreenLoad } from '../../lib/performance';
import { friendlyAuthError } from '../../lib/auth-errors';
import { gasConfig } from '../../gas.config';

// --- Config-driven values ---
const SCHEME = gasConfig.app.scheme;
const APP_NAME = gasConfig.app.name;
const MIN_PASSWORD_LENGTH = 8;

export interface ResetPasswordController {
  email: string;
  setEmail: (value: string) => void;
  loading: boolean;
  sent: boolean;
  appName: string;
  handleSendResetLink: () => Promise<void>;
}

export function useResetPasswordController(): ResetPasswordController {
  const { track } = useAnalytics();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // Capture mount-time once so re-renders don't reset the screen-load baseline.
  const screenStartRef = useRef(Date.now());
  useEffect(() => {
    track('reset_password_screen_viewed');
    trackScreenLoad('reset_password', screenStartRef.current);
  }, [track]);

  const handleSendResetLink = useCallback(async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      Alert.alert('Missing Email', 'Please enter your email address.');
      return;
    }
    setLoading(true);
    track('reset_password_requested');
    // Mirror how login/signup build redirectTo so the recovery link lands on the
    // shared deep-link callback, which forwards `type=recovery` to update-password.
    const redirectTo = makeRedirectUri({ scheme: SCHEME, path: 'auth/callback' });
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, { redirectTo });
    setLoading(false);
    if (error) {
      track('reset_password_failed', { error: error.message });
      addBreadcrumb('auth', 'Password reset request failed');
      Alert.alert('Reset Failed', friendlyAuthError(error));
      return;
    }
    // Always show the confirmation on success. (Supabase intentionally does not
    // reveal whether an address exists; we mirror that and never disclose it.)
    setSent(true);
  }, [email, track]);

  return {
    email,
    setEmail,
    loading,
    sent,
    appName: APP_NAME,
    handleSendResetLink,
  };
}

export interface UpdatePasswordController {
  password: string;
  onPasswordChange: (value: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (value: string) => void;
  passwordError: string;
  loading: boolean;
  canSubmit: boolean;
  appName: string;
  minPasswordLength: number;
  handleUpdatePassword: () => Promise<void>;
}

export function useUpdatePasswordController(): UpdatePasswordController {
  const { track } = useAnalytics();
  // The recovery `code` is forwarded by the callback; some Supabase setups send
  // the user straight here with the code in the URL, so read it directly too.
  const { code } = useLocalSearchParams<{ code?: string }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  // The first authenticated route once the password is set.
  const firstTab = gasConfig.navigation.tabs[0]?.file ?? 'index';

  // Capture mount-time once so re-renders don't reset the screen-load baseline.
  const screenStartRef = useRef(Date.now());
  useEffect(() => {
    track('update_password_screen_viewed');
    trackScreenLoad('update_password', screenStartRef.current);
  }, [track]);

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

  const handleUpdatePassword = useCallback(async () => {
    if (password.length < MIN_PASSWORD_LENGTH) {
      Alert.alert('Weak Password', `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setLoading(true);
    track('update_password_attempted');

    // If we arrived with a recovery code and don't yet have a session, exchange
    // it now. `updateUser` requires an authenticated session, and the exchange
    // sets it on the client before resolving. If there's already a recovery
    // session (e.g. PASSWORD_RECOVERY established it), this is skipped.
    if (code) {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setLoading(false);
          track('update_password_failed', { error: exchangeError.message });
          addBreadcrumb('auth', 'Recovery code exchange failed');
          Alert.alert(
            'Link Expired',
            'This reset link is invalid or has expired. Please request a new one.',
          );
          return;
        }
      }
    }

    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      track('update_password_failed', { error: error.message });
      addBreadcrumb('auth', 'Password update failed');
      // Supabase rejects reusing the current password with a specific message;
      // surface it directly since it's actionable and safe.
      const reused = error.message.toLowerCase().includes('should be different');
      Alert.alert(
        'Update Failed',
        reused ? 'Your new password must be different from your old password.' : friendlyAuthError(error),
      );
      return;
    }

    track('update_password_succeeded');
    Alert.alert('Password Updated', 'Your password has been changed.');
    // Session is now active, head into the app.
    router.replace(`/(tabs)/${firstTab}` as any);
  }, [password, confirmPassword, code, firstTab, track]);

  const canSubmit = password.length >= MIN_PASSWORD_LENGTH && confirmPassword.length > 0 && !passwordError;

  return {
    password,
    onPasswordChange,
    confirmPassword,
    onConfirmPasswordChange,
    passwordError,
    loading,
    canSubmit,
    appName: APP_NAME,
    minPasswordLength: MIN_PASSWORD_LENGTH,
    handleUpdatePassword,
  };
}

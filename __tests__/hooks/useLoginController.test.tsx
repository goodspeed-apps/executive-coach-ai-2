/**
 * Tests for hooks/headless/useLoginController.ts — the headless login VM.
 *
 * The shared __tests__/setup.ts supabase mock lacks signInWithOAuth /
 * exchangeCodeForSession, and the shared react-native mock lacks Alert, so this
 * suite SELF-MOCKS every dependency the controller touches. A shared `calls`
 * array records the security-critical call order so we can assert the OAuth
 * state-CSRF dance runs in exactly the right sequence (the whole point of the
 * verbatim move). renderHook + act follow the useChannelSubscription precedent.
 */

// Record the order of security-critical calls across every mocked module.
const calls: string[] = [];

// The shared react-native mock (mapped by the `hooks` jest project) has every
// component RNTL needs to render, but NOT Alert. Spread it and add Alert so the
// controller's `Alert.alert(...)` calls don't blow up the render host.
jest.mock('react-native', () => ({
  ...jest.requireActual('../../__tests__/__mocks__/react-native.js'),
  Alert: { alert: jest.fn() },
}));

jest.mock('../../lib/crypto', () => ({
  generateAndStoreOAuthState: jest.fn(async () => { calls.push('generateAndStoreOAuthState'); return 'state-token'; }),
  verifyAndClearOAuthState: jest.fn(async () => { calls.push('verifyAndClearOAuthState'); return true; }),
  clearOAuthState: jest.fn(async () => { calls.push('clearOAuthState'); }),
}));

jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(async () => { calls.push('signInWithPassword'); return { data: { session: null }, error: null }; }),
      signInWithOAuth: jest.fn(async () => { calls.push('signInWithOAuth'); return { data: { url: 'https://provider.example/auth?state=state-token' }, error: null }; }),
      exchangeCodeForSession: jest.fn(async () => { calls.push('exchangeCodeForSession'); return { data: { session: {} }, error: null }; }),
      resend: jest.fn(async () => ({ error: null })),
    },
  },
}));

jest.mock('../../lib/sentry', () => ({ addBreadcrumb: jest.fn() }));
jest.mock('../../lib/performance', () => ({ trackScreenLoad: jest.fn() }));
jest.mock('../../lib/platform', () => ({ isWeb: false }));
jest.mock('../../lib/auth-errors', () => ({
  friendlyAuthError: jest.fn((e: any) => (e?.message ?? 'error')),
  isEmailNotConfirmed: jest.fn(() => false),
}));

jest.mock('../../hooks/useAnalytics', () => ({ useAnalytics: () => ({ track: jest.fn() }) }));

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn(async () => {
    calls.push('openAuthSessionAsync');
    return { type: 'success', url: 'myapp://auth/callback?code=auth-code&state=state-token' };
  }),
}));

jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn(() => 'myapp://auth/callback'),
}));

// Virtual: the module is only require()d on iOS native and isn't installed in
// the jest sandbox, so declare it virtual.
jest.mock('expo-apple-authentication', () => ({
  isAvailableAsync: jest.fn(async () => false),
}), { virtual: true });

jest.mock('../../services/apple-auth', () => ({
  signInWithApple: jest.fn(async () => ({ userId: 'u', email: null })),
}));

import { renderHook, act } from '@testing-library/react-native';
import { useLoginController } from '../../hooks/headless/useLoginController';
import { supabase } from '../../lib/supabase';

beforeEach(() => {
  calls.length = 0;
  jest.clearAllMocks();
});

describe('useLoginController', () => {
  test('handleOAuthLogin runs the state-CSRF dance in exact order', async () => {
    const { result } = await renderHook(() => useLoginController());

    await act(async () => {
      await result.current.handleOAuthLogin('google');
    });

    expect(calls).toEqual([
      'generateAndStoreOAuthState',
      'signInWithOAuth',
      'openAuthSessionAsync',
      'verifyAndClearOAuthState',
      'exchangeCodeForSession',
    ]);
  });

  test('email login calls signInWithPassword', async () => {
    const { result } = await renderHook(() => useLoginController());

    // Set credentials and let the re-render commit so result.current.handleEmailLogin
    // is the closure that reads the updated state.
    await act(async () => {
      result.current.setEmail('user@example.com');
      result.current.setPassword('password123');
    });

    await act(async () => {
      await result.current.handleEmailLogin();
    });

    expect((supabase.auth.signInWithPassword as jest.Mock)).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123',
    });
    expect(calls).toContain('signInWithPassword');
  });
});

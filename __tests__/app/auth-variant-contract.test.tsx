/**
 * GAS Template — Auth Variant Contract Test (app project)
 *
 * The auth variant kit (components/kit/auth/) ships 5 genuinely-distinct,
 * layout-only auth variants that the dev-agent seed-selects per app. Whatever
 * the chosen layout, EVERY variant must satisfy the FROZEN Phase 0 selector
 * contract: for login & signup modes the auth-drive gate finds the email,
 * password, submit, and the two OAuth buttons by their EXACT accessibilityLabel
 * + role. This test enforces that contract across every variant x mode, asserts
 * the resolver fail-softs unknown/undefined/null to the default, and golden-locks
 * the registry keys to the frozen id list so the kit can never silently drift
 * out of sync with @goodspeed/shared AUTH_VARIANT_IDS.
 */

import React from 'react';
import { render } from '@testing-library/react-native';

// Link/router would need a navigation context to render; neutralize them.
jest.mock('expo-router', () => ({
  __esModule: true,
  Link: ({ children }: { children?: React.ReactNode }) => children ?? null,
  router: { replace: jest.fn(), push: jest.fn(), back: jest.fn(), navigate: jest.fn() },
  useLocalSearchParams: () => ({}),
}));

// The shared setup.app.ts lucide mock omits MailCheck (used by the verification
// sub-screens, never rendered with this baseVm); provide it so the import resolves.
jest.mock('lucide-react-native', () => ({
  Eye: 'Eye',
  EyeOff: 'EyeOff',
  MailCheck: 'MailCheck',
}));

// react-native-svg (the provider brand marks) pulls native RN internals that
// crash under the app jest mock; the contract is labels + roles, not the icon
// pixels, so stub the SVG primitives to plain host strings.
jest.mock('react-native-svg', () => ({
  __esModule: true,
  default: 'Svg',
  Svg: 'Svg',
  Path: 'Path',
  Rect: 'Rect',
}));

// AppLogo require()s a PNG, which jest can't transform; the brand image is not
// part of the selector contract, so stub it to a host string.
jest.mock('../../components/AppLogo', () => ({ __esModule: true, default: 'AppLogo' }));

import {
  AUTH_VARIANTS,
  AUTH_VARIANT_IDS,
  DEFAULT_AUTH_VARIANT_ID,
  resolveAuthVariant,
} from '../../components/kit/auth/registry';
import { AuthCenteredCard } from '../../components/kit/auth/AuthCenteredCard';
import { LOCAL_SELECTOR_CONTRACT, type AuthMode } from '../../components/kit/auth/types';

// A broad fixture view-model: nothing loading, no sub-screens, both OAuth shown,
// every other flag false, all handlers/setters no-op. Each variant reads only
// what it needs off this `any`.
function makeBaseVm(): any {
  const noop = () => {};
  return {
    email: '',
    password: '',
    confirmPassword: '',
    passwordError: '',
    appName: 'TestApp',
    minPasswordLength: 8,
    loading: false,
    verificationSent: false,
    sent: false,
    appleAvailable: true,
    oauthProvider: null,
    emailUnconfirmed: false,
    resending: false,
    resendCooldown: 0,
    resentConfirmation: false,
    canSubmit: false,
    showGoogle: true,
    showApple: true,
    showTwitter: false,
    showLinkedIn: false,
    showMicrosoft: false,
    hasOAuth: true,
    setEmail: noop,
    setPassword: noop,
    onPasswordChange: noop,
    onConfirmPasswordChange: noop,
    handleEmailLogin: noop,
    handleEmailSignup: noop,
    handleResendVerification: noop,
    handleOAuthLogin: noop,
    handleOAuthSignup: noop,
    handleAppleLogin: noop,
    handleAppleSignup: noop,
    handleSendResetLink: noop,
    handleUpdatePassword: noop,
    backToLogin: noop,
  };
}

const CONTRACT_MODES: Array<Extract<AuthMode, 'login' | 'signup'>> = ['login', 'signup'];

describe('auth variant contract', () => {
  it('exposes exactly the frozen AUTH_VARIANT_IDS as registry keys (golden anti-drift)', () => {
    expect(Object.keys(AUTH_VARIANTS).sort()).toEqual([...AUTH_VARIANT_IDS].sort());
  });

  // Every variant x {login, signup} must surface all five contracted controls by
  // their exact label + role, regardless of the visible text the layout shows.
  for (const id of Object.keys(AUTH_VARIANTS)) {
    const V = AUTH_VARIANTS[id];
    for (const mode of CONTRACT_MODES) {
      it(`variant "${id}" / ${mode}: renders all 5 contracted selectors`, async () => {
        const contract = LOCAL_SELECTOR_CONTRACT[mode];
        const { getByLabelText } = await render(<V mode={mode} vm={makeBaseVm()} />);
        for (const key of Object.keys(contract) as Array<keyof typeof contract>) {
          const { label } = contract[key];
          expect(getByLabelText(label)).toBeTruthy();
        }
      });
    }
  }

  it('resolveAuthVariant fail-softs unknown/undefined/null to AuthCenteredCard (the default)', () => {
    expect(resolveAuthVariant('bogus-not-a-variant')).toBe(AuthCenteredCard);
    expect(resolveAuthVariant(undefined)).toBe(AuthCenteredCard);
    expect(resolveAuthVariant(null)).toBe(AuthCenteredCard);
    expect(resolveAuthVariant(DEFAULT_AUTH_VARIANT_ID)).toBe(AuthCenteredCard);
  });

  it('resolveAuthVariant returns the requested variant for a known id', () => {
    for (const id of AUTH_VARIANT_IDS) {
      expect(resolveAuthVariant(id)).toBe(AUTH_VARIANTS[id]);
    }
  });
});

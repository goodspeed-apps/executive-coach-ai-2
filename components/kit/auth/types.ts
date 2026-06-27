/**
 * GAS Template, Auth Variant Kit types
 *
 * Shared contract for every auth layout variant. A variant is a LAYOUT ONLY, 
 * it never calls supabase.auth and owns no state; it reads the controller
 * view-model (`vm`) and renders the corresponding form for the given `mode`.
 *
 * LOCAL_SELECTOR_CONTRACT mirrors the FROZEN Phase 0 selector contract that the
 * auth-drive gate asserts against a built app. Whatever the visible button text
 * is, the accessibilityLabel + role on the email / password / submit / OAuth
 * controls MUST equal these values, that label is the contract, not the copy.
 */

export type AuthMode = 'login' | 'signup' | 'reset' | 'update';

export interface AuthVariantProps {
  mode: AuthMode;
  /** The controller view-model (useLoginController / useSignupController / …). Kept broad on purpose. */
  vm: any;
}

export interface AuthSelector {
  label: string;
  role: 'button' | 'textbox';
}

/**
 * BYTE-IDENTICAL to
 * goodspeed-studio/packages/worker/src/lib/auth-drive-gate/selector-contract.ts
 * (the SELECTOR_CONTRACT login/signup blocks). The template is standalone and
 * cannot import it, so the contract is duplicated here and golden-tested.
 */
export const LOCAL_SELECTOR_CONTRACT = {
  login: {
    email: { label: 'Email address', role: 'textbox' } as AuthSelector,
    password: { label: 'Password', role: 'textbox' } as AuthSelector,
    submit: { label: 'Sign in', role: 'button' } as AuthSelector,
    oauthApple: { label: 'Sign in with Apple', role: 'button' } as AuthSelector,
    oauthGoogle: { label: 'Sign in with Google', role: 'button' } as AuthSelector,
  },
  signup: {
    email: { label: 'Email address', role: 'textbox' } as AuthSelector,
    password: { label: 'Password', role: 'textbox' } as AuthSelector,
    submit: { label: 'Create account', role: 'button' } as AuthSelector,
    oauthApple: { label: 'Continue with Apple', role: 'button' } as AuthSelector,
    oauthGoogle: { label: 'Continue with Google', role: 'button' } as AuthSelector,
  },
} as const;

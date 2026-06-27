/**
 * cold-load-redirect, pure extraction of app/index.tsx's routing decision tree.
 *
 * This module holds the redirect logic as a pure function so it can be unit-tested
 * without any React Native or Expo Router runtime. Phase 1 seam: app/index.tsx
 * delegates to this function. Zero behavior change.
 *
 * Decision order (must match app/index.tsx verbatim):
 * 1. session exists → /(tabs)/${firstTab}
 * 2. has onboarded (no session) → /(auth)/login
 * 3. first launch + onboarding enabled → /(auth)/onboarding/welcome
 * 4. first launch + onboarding disabled → /(auth)/login
 */

export interface ColdLoadInputs {
  session: boolean;
  hasOnboarded: boolean;
  onboardingEnabled: boolean;
  firstTab: string;
}

export function resolveColdLoadRedirect(input: ColdLoadInputs): string {
  if (input.session) return `/(tabs)/${input.firstTab}`;
  if (input.hasOnboarded) return '/(auth)/login';
  if (input.onboardingEnabled) return '/(auth)/onboarding/welcome';
  return '/(auth)/login';
}

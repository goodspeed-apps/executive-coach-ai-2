/**
 * Tests for lib/cold-load-redirect — pure decision function extracted from app/index.tsx.
 *
 * Asserts all 4 branches:
 * 1. session=true  → /(tabs)/${firstTab}  (wins over all other flags)
 * 2. session=false, hasOnboarded=true → /(auth)/login
 * 3. session=false, hasOnboarded=false, onboardingEnabled=true → /(auth)/onboarding/welcome
 * 4. session=false, hasOnboarded=false, onboardingEnabled=false → /(auth)/login
 */

import { resolveColdLoadRedirect } from '../../lib/cold-load-redirect';

describe('resolveColdLoadRedirect', () => {
  const firstTab = 'index';

  test('session=true → /(tabs)/${firstTab} regardless of other flags', () => {
    expect(
      resolveColdLoadRedirect({ session: true, hasOnboarded: false, onboardingEnabled: true, firstTab }),
    ).toBe('/(tabs)/index');
    // session wins even when hasOnboarded is also true
    expect(
      resolveColdLoadRedirect({ session: true, hasOnboarded: true, onboardingEnabled: false, firstTab }),
    ).toBe('/(tabs)/index');
  });

  test('session=false, hasOnboarded=true → /(auth)/login', () => {
    expect(
      resolveColdLoadRedirect({ session: false, hasOnboarded: true, onboardingEnabled: true, firstTab }),
    ).toBe('/(auth)/login');
  });

  test('first launch + onboardingEnabled=true → /(auth)/onboarding/welcome', () => {
    expect(
      resolveColdLoadRedirect({ session: false, hasOnboarded: false, onboardingEnabled: true, firstTab }),
    ).toBe('/(auth)/onboarding/welcome');
  });

  test('first launch + onboardingEnabled=false → /(auth)/login', () => {
    expect(
      resolveColdLoadRedirect({ session: false, hasOnboarded: false, onboardingEnabled: false, firstTab }),
    ).toBe('/(auth)/login');
  });

  test('uses firstTab value in the tabs route', () => {
    expect(
      resolveColdLoadRedirect({ session: true, hasOnboarded: false, onboardingEnabled: false, firstTab: 'explore' }),
    ).toBe('/(tabs)/explore');
  });
});

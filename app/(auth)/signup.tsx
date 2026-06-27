/**
 * GAS Template, Signup Screen (thin shell)
 *
 * Template-owned route. All behavior lives in useSignupController() (headless);
 * the LAYOUT is a seed-selected auth variant resolved from
 * gasConfig.design.variants.auth (fail-softs to the centered-card default).
 * This file stays a thin shell, no auth logic, no JSX.
 */

import { useSignupController } from '@/hooks/headless/useSignupController';
import { resolveAuthVariant } from '@/components/kit/auth/registry';
import { gasConfig } from '../../gas.config';

export default function SignupScreen() {
  const vm = useSignupController();
  const V = resolveAuthVariant(gasConfig.design.variants?.auth);
  return <V mode="signup" vm={vm} />;
}

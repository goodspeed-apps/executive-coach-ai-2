/**
 * GAS Template, Login Screen (thin shell)
 *
 * Template-owned route. All behavior lives in useLoginController() (headless);
 * the LAYOUT is a seed-selected auth variant resolved from
 * gasConfig.design.variants.auth (fail-softs to the centered-card default).
 * This file stays a thin shell, no auth logic, no JSX, so per-app uniqueness
 * is a single config value and the controller/contract never fork.
 */

import { useLoginController } from '@/hooks/headless/useLoginController';
import { resolveAuthVariant } from '@/components/kit/auth/registry';
import { gasConfig } from '../../gas.config';

export default function LoginScreen() {
  const vm = useLoginController();
  const V = resolveAuthVariant(gasConfig.design.variants?.auth);
  return <V mode="login" vm={vm} />;
}

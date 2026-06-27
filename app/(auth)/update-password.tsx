/**
 * GAS Template, Update Password Screen (thin shell)
 *
 * Template-owned route. All behavior lives in useUpdatePasswordController()
 * (headless); the LAYOUT is a seed-selected auth variant resolved from
 * gasConfig.design.variants.auth (fail-softs to the centered-card default).
 * This file stays a thin shell, no auth logic, no JSX.
 */

import { useUpdatePasswordController } from '@/hooks/headless/usePasswordRecoveryController';
import { resolveAuthVariant } from '@/components/kit/auth/registry';
import { gasConfig } from '../../gas.config';

export default function UpdatePasswordScreen() {
  const vm = useUpdatePasswordController();
  const V = resolveAuthVariant(gasConfig.design.variants?.auth);
  return <V mode="update" vm={vm} />;
}

/**
 * GAS Template, Settings Screen (thin shell)
 *
 * Phase 1 of per-app screen-uniqueness. ALL behavior lives in the headless
 * hooks/headless/useSettingsModel.ts; ALL layout lives in the settings variant
 * kit (components/kit/settings/). This screen is a 3-line shell: build the model,
 * resolve the configured variant (fail-soft to grouped-cards), render it.
 *
 * The dev-agent customizes the LOOK by writing one of SETTINGS_VARIANT_IDS into
 * gasConfig.design.variants.settings and the BEHAVIOR by extending the model, 
 * not by editing this file. Stays template-owned (TEMPLATE_PROVIDED_SCREENS).
 */

import { useSettingsModel } from '@/hooks/headless/useSettingsModel';
import { resolveSettingsVariant } from '@/components/kit/settings/registry';
import { gasConfig } from '../../gas.config';

export default function SettingsScreen() {
  const model = useSettingsModel();
  const Variant = resolveSettingsVariant(gasConfig.design.variants?.settings);
  return <Variant model={model} />;
}

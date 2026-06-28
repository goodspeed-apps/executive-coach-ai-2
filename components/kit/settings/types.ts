/**
 * GAS Template, Settings Variant Kit types
 *
 * Shared contract for every settings layout variant. A variant is a LAYOUT ONLY:
 * a pure function of `{ model }` (the SettingsModel from the headless hook). It
 * never calls useAuth / useSubscription / useHelp and owns no behavior, every
 * handler, gate and label already lives on the model. The only hook a variant
 * may call is useThemeColors (view-only colors).
 */

import type { ComponentType } from 'react';
import type { SettingsModel } from '@/hooks/headless/useSettingsModel';

export type { SettingsModel };

export interface SettingsVariantProps {
  model: SettingsModel;
}

export type SettingsVariantComponent = ComponentType<SettingsVariantProps>;

import type { Meta, StoryObj } from '@storybook/react';
import { SettingsGroupedCards } from '../../components/kit/settings/SettingsGroupedCards';
import { SettingsFlatList } from '../../components/kit/settings/SettingsFlatList';
import { SettingsSidebarSections } from '../../components/kit/settings/SettingsSidebarSections';
import { SettingsCompact } from '../../components/kit/settings/SettingsCompact';
import type { SettingsVariantProps } from '../../components/kit/settings/types';
import { mockSettingsModel } from '../../__tests__/components/kit/mock-settings-model';

// A valid SettingsModel fixture shared by every variant story (free user, the
// upgrade card visible, a couple of rows per section).
const fixtureModel = mockSettingsModel();

// ─── Grouped Cards (DEFAULT) ──────────────────────────────────────────────
const groupedCardsMeta: Meta<typeof SettingsGroupedCards> = {
  title: 'Kit/Settings/GroupedCards',
  component: SettingsGroupedCards,
  args: { model: fixtureModel } as SettingsVariantProps,
};
export default groupedCardsMeta;
export const GroupedCards: StoryObj<typeof SettingsGroupedCards> = {
  name: 'grouped-cards',
  args: { model: fixtureModel } as SettingsVariantProps,
};

// ─── Flat List ────────────────────────────────────────────────────────────
export const FlatList: StoryObj<typeof SettingsFlatList> = {
  name: 'flat-list',
  render: (args) => <SettingsFlatList {...(args as SettingsVariantProps)} />,
  args: { model: fixtureModel } as SettingsVariantProps,
};

// ─── Sidebar Sections ─────────────────────────────────────────────────────
export const SidebarSections: StoryObj<typeof SettingsSidebarSections> = {
  name: 'sidebar-sections',
  render: (args) => <SettingsSidebarSections {...(args as SettingsVariantProps)} />,
  args: { model: fixtureModel } as SettingsVariantProps,
};

// ─── Compact ──────────────────────────────────────────────────────────────
export const Compact: StoryObj<typeof SettingsCompact> = {
  name: 'compact',
  render: (args) => <SettingsCompact {...(args as SettingsVariantProps)} />,
  args: { model: fixtureModel } as SettingsVariantProps,
};

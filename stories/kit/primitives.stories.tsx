/**
 * Kit Primitives Stories — Phase 3 (M2)
 *
 * One explicit named export per variant id across all 6 primitive families.
 * The `name:` field carries the verbatim registry id (family-prefixed where
 * required to disambiguate shared tokens across families).
 *
 * Naming convention:
 *   KitButton  → unprefixed       (solid, soft, outline, ghost, pill, underline, brutalist, gradient)
 *   KitCard    → card-<id>        (card-elevated, card-flat, …)
 *   KitInput   → input-<id>
 *   KitListRow → listrow-<id>
 *   KitHeader  → header-<id>
 *   KitSurface → surface-<id>
 *
 * Static CSF (explicit named exports, NOT a module.exports loop) so Storybook 8
 * can index stories without executing module code.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Text } from 'react-native';
import { KitButton } from '../../components/kit/primitives/KitButton';
import { KitCard } from '../../components/kit/primitives/KitCard';
import { KitInput } from '../../components/kit/primitives/KitInput';
import { KitListRow } from '../../components/kit/primitives/KitListRow';
import { KitHeader } from '../../components/kit/primitives/KitHeader';
import { KitSurface } from '../../components/kit/primitives/KitSurface';

const noop = () => {};
const noopText = (_: string) => {};

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Kit/Primitives',
};
export default meta;

// ─── KitButton (8 variants, unprefixed) ──────────────────────────────────────

export const solid: StoryObj = {
  name: 'solid',
  render: () => <KitButton variant="solid" label="Continue" onPress={noop} />,
};

export const soft: StoryObj = {
  name: 'soft',
  render: () => <KitButton variant="soft" label="Continue" onPress={noop} />,
};

export const outline: StoryObj = {
  name: 'outline',
  render: () => <KitButton variant="outline" label="Continue" onPress={noop} />,
};

export const ghost: StoryObj = {
  name: 'ghost',
  render: () => <KitButton variant="ghost" label="Continue" onPress={noop} />,
};

export const pill: StoryObj = {
  name: 'pill',
  render: () => <KitButton variant="pill" label="Continue" onPress={noop} />,
};

export const underline: StoryObj = {
  name: 'underline',
  render: () => <KitButton variant="underline" label="Continue" onPress={noop} />,
};

export const brutalist: StoryObj = {
  name: 'brutalist',
  render: () => <KitButton variant="brutalist" label="Continue" onPress={noop} />,
};

export const gradient: StoryObj = {
  name: 'gradient',
  render: () => <KitButton variant="gradient" label="Continue" onPress={noop} />,
};

// ─── KitCard (7 variants, card- prefixed) ────────────────────────────────────

export const cardElevated: StoryObj = {
  name: 'card-elevated',
  render: () => (
    <KitCard variant="elevated">
      <Text>Card</Text>
    </KitCard>
  ),
};

export const cardFlat: StoryObj = {
  name: 'card-flat',
  render: () => (
    <KitCard variant="flat">
      <Text>Card</Text>
    </KitCard>
  ),
};

export const cardOutlined: StoryObj = {
  name: 'card-outlined',
  render: () => (
    <KitCard variant="outlined">
      <Text>Card</Text>
    </KitCard>
  ),
};

export const cardGlass: StoryObj = {
  name: 'card-glass',
  render: () => (
    <KitCard variant="glass">
      <Text>Card</Text>
    </KitCard>
  ),
};

export const cardBrutalist: StoryObj = {
  name: 'card-brutalist',
  render: () => (
    <KitCard variant="brutalist">
      <Text>Card</Text>
    </KitCard>
  ),
};

export const cardGradientBorder: StoryObj = {
  name: 'card-gradient-border',
  render: () => (
    <KitCard variant="gradient-border">
      <Text>Card</Text>
    </KitCard>
  ),
};

export const cardInset: StoryObj = {
  name: 'card-inset',
  render: () => (
    <KitCard variant="inset">
      <Text>Card</Text>
    </KitCard>
  ),
};

// ─── KitInput (5 variants, input- prefixed) ───────────────────────────────────

export const inputOutline: StoryObj = {
  name: 'input-outline',
  render: () => (
    <KitInput variant="outline" value="" onChangeText={noopText} placeholder="Enter text..." />
  ),
};

export const inputFilled: StoryObj = {
  name: 'input-filled',
  render: () => (
    <KitInput variant="filled" value="" onChangeText={noopText} placeholder="Enter text..." />
  ),
};

export const inputUnderline: StoryObj = {
  name: 'input-underline',
  render: () => (
    <KitInput variant="underline" value="" onChangeText={noopText} placeholder="Enter text..." />
  ),
};

export const inputFloatingLabel: StoryObj = {
  name: 'input-floating-label',
  render: () => (
    <KitInput
      variant="floating-label"
      label="Email"
      value=""
      onChangeText={noopText}
      placeholder="Enter text..."
    />
  ),
};

export const inputInset: StoryObj = {
  name: 'input-inset',
  render: () => (
    <KitInput variant="inset" value="" onChangeText={noopText} placeholder="Enter text..." />
  ),
};

// ─── KitListRow (5 variants, listrow- prefixed) ───────────────────────────────

export const listrowPlain: StoryObj = {
  name: 'listrow-plain',
  render: () => <KitListRow variant="plain" title="Item" />,
};

export const listrowCard: StoryObj = {
  name: 'listrow-card',
  render: () => <KitListRow variant="card" title="Item" />,
};

export const listrowInset: StoryObj = {
  name: 'listrow-inset',
  render: () => <KitListRow variant="inset" title="Item" />,
};

export const listrowLeadingIcon: StoryObj = {
  name: 'listrow-leading-icon',
  render: () => <KitListRow variant="leading-icon" title="Item" />,
};

export const listrowSplit: StoryObj = {
  name: 'listrow-split',
  render: () => <KitListRow variant="split" title="Item" trailing="Value" />,
};

// ─── KitHeader (5 variants, header- prefixed) ────────────────────────────────

export const headerStandard: StoryObj = {
  name: 'header-standard',
  render: () => <KitHeader variant="standard" title="Header" />,
};

export const headerLargeTitle: StoryObj = {
  name: 'header-large-title',
  render: () => <KitHeader variant="large-title" title="Header" />,
};

export const headerCentered: StoryObj = {
  name: 'header-centered',
  render: () => <KitHeader variant="centered" title="Header" />,
};

export const headerCompact: StoryObj = {
  name: 'header-compact',
  render: () => <KitHeader variant="compact" title="Header" />,
};

export const headerHero: StoryObj = {
  name: 'header-hero',
  render: () => <KitHeader variant="hero" title="Header" />,
};

// ─── KitSurface (4 variants, surface- prefixed) ───────────────────────────────

export const surfaceRaised: StoryObj = {
  name: 'surface-raised',
  render: () => (
    <KitSurface variant="raised">
      <Text>Content</Text>
    </KitSurface>
  ),
};

export const surfacePlain: StoryObj = {
  name: 'surface-plain',
  render: () => (
    <KitSurface variant="plain">
      <Text>Content</Text>
    </KitSurface>
  ),
};

export const surfaceBordered: StoryObj = {
  name: 'surface-bordered',
  render: () => (
    <KitSurface variant="bordered">
      <Text>Content</Text>
    </KitSurface>
  ),
};

export const surfaceInset: StoryObj = {
  name: 'surface-inset',
  render: () => (
    <KitSurface variant="inset">
      <Text>Content</Text>
    </KitSurface>
  ),
};

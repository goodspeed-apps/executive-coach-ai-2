/**
 * Kit Scaffolds Stories — Phase 3 (M2)
 *
 * One explicit named export per SCAFFOLD_ID. The `name:` field carries the
 * verbatim registry id so the unstoried-variant CI check can match it.
 *
 * Each story resolves its scaffold component via resolveScaffold(id) and
 * renders it with minimal fixture data from scaffold-fixtures.ts.
 *
 * Static CSF (explicit named exports, NOT a module.exports loop) so Storybook 8
 * can index stories without executing module code.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { resolveScaffold } from '../../components/kit/scaffolds/registry';
import { SCAFFOLD_STORY_FIXTURES } from './scaffold-fixtures';

const meta: Meta = {
  title: 'Kit/Scaffolds',
};
export default meta;

// ─── dense-dashboard ─────────────────────────────────────────────────────────

export const denseDashboard: StoryObj = {
  name: 'dense-dashboard',
  render: () => {
    const S = resolveScaffold('dense-dashboard');
    return <S {...SCAFFOLD_STORY_FIXTURES['dense-dashboard']} />;
  },
};

// ─── media-player ─────────────────────────────────────────────────────────────

export const mediaPlayer: StoryObj = {
  name: 'media-player',
  render: () => {
    const S = resolveScaffold('media-player');
    return <S {...SCAFFOLD_STORY_FIXTURES['media-player']} />;
  },
};

// ─── conversation-list ────────────────────────────────────────────────────────

export const conversationList: StoryObj = {
  name: 'conversation-list',
  render: () => {
    const S = resolveScaffold('conversation-list');
    return <S {...SCAFFOLD_STORY_FIXTURES['conversation-list']} />;
  },
};

// ─── photo-grid ───────────────────────────────────────────────────────────────

export const photoGrid: StoryObj = {
  name: 'photo-grid',
  render: () => {
    const S = resolveScaffold('photo-grid');
    return <S {...SCAFFOLD_STORY_FIXTURES['photo-grid']} />;
  },
};

// ─── hero-cta ────────────────────────────────────────────────────────────────

export const heroCta: StoryObj = {
  name: 'hero-cta',
  render: () => {
    const S = resolveScaffold('hero-cta');
    return <S {...SCAFFOLD_STORY_FIXTURES['hero-cta']} />;
  },
};

// ─── profile-detail ───────────────────────────────────────────────────────────

export const profileDetail: StoryObj = {
  name: 'profile-detail',
  render: () => {
    const S = resolveScaffold('profile-detail');
    return <S {...SCAFFOLD_STORY_FIXTURES['profile-detail']} />;
  },
};

// ─── map-split ────────────────────────────────────────────────────────────────

export const mapSplit: StoryObj = {
  name: 'map-split',
  render: () => {
    const S = resolveScaffold('map-split');
    return <S {...SCAFFOLD_STORY_FIXTURES['map-split']} />;
  },
};

// ─── timeline-feed ────────────────────────────────────────────────────────────

export const timelineFeed: StoryObj = {
  name: 'timeline-feed',
  render: () => {
    const S = resolveScaffold('timeline-feed');
    return <S {...SCAFFOLD_STORY_FIXTURES['timeline-feed']} />;
  },
};

// ─── horizontal-showcase ──────────────────────────────────────────────────────

export const horizontalShowcase: StoryObj = {
  name: 'horizontal-showcase',
  render: () => {
    const S = resolveScaffold('horizontal-showcase');
    return <S {...SCAFFOLD_STORY_FIXTURES['horizontal-showcase']} />;
  },
};

// ─── settings-list ────────────────────────────────────────────────────────────

export const settingsList: StoryObj = {
  name: 'settings-list',
  render: () => {
    const S = resolveScaffold('settings-list');
    return <S {...SCAFFOLD_STORY_FIXTURES['settings-list']} />;
  },
};

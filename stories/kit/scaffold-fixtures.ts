/**
 * Scaffold Story Fixtures
 *
 * Minimal ScaffoldProps for each SCAFFOLD_ID. Each fixture supplies just enough
 * data and slot props for the scaffold to render without crashing in Storybook.
 * All slots are undefined (scaffolds render gracefully with empty slots) and data
 * uses the loose per-archetype shapes from components/kit/scaffolds/types.ts.
 */

import type { ScaffoldProps } from '../../components/kit/scaffolds/types';

export const SCAFFOLD_STORY_FIXTURES: Record<string, ScaffoldProps> = {
  'dense-dashboard': {
    data: {
      title: 'Dashboard',
      primaryLabel: 'Revenue',
      primaryValue: '$12,400',
      change: '+8%',
      stats: [
        { label: 'Users', value: 1240, change: '+12%', trend: 'up' },
        { label: 'Sessions', value: 3820, change: '+5%', trend: 'up' },
        { label: 'Bounce', value: '42%', change: '-2%', trend: 'down' },
        { label: 'Duration', value: '3m 12s', change: '+0%', trend: 'flat' },
      ],
    },
  },

  'media-player': {
    data: {
      title: 'Midnight Drive',
      artist: 'The Synthetics',
      album: 'Neon Nights',
      progress: 0.38,
      elapsed: '1:24',
      duration: '3:42',
    },
  },

  'conversation-list': {
    data: [
      { id: '1', name: 'Alice', preview: 'Hey, how are you?', timestamp: '2m', unread: 2 },
      { id: '2', name: 'Bob', preview: 'Did you see the game?', timestamp: '14m', unread: 0 },
      { id: '3', name: 'Carol', preview: 'Meeting at 3pm', timestamp: '1h', unread: 1 },
    ],
  },

  'photo-grid': {
    data: [
      { id: '1', url: 'https://picsum.photos/seed/a/300/300', caption: 'Sunset' },
      { id: '2', url: 'https://picsum.photos/seed/b/300/300', caption: 'Forest' },
      { id: '3', url: 'https://picsum.photos/seed/c/300/300', caption: 'City' },
      { id: '4', url: 'https://picsum.photos/seed/d/300/300', caption: 'Ocean' },
    ],
  },

  'hero-cta': {
    data: {
      title: 'Welcome Back',
      subtitle: 'Pick up where you left off',
      ctaLabel: 'Continue',
    },
  },

  'profile-detail': {
    data: {
      name: 'Jane Smith',
      handle: '@janesmith',
      bio: 'Designer & developer based in San Francisco.',
      stats: [
        { label: 'Posts', value: 142 },
        { label: 'Followers', value: 2800 },
        { label: 'Following', value: 310 },
      ],
    },
  },

  'map-split': {
    data: [
      { id: '1', name: 'Blue Bottle Coffee', detail: 'Coffee shop', distance: '0.2 mi' },
      { id: '2', name: 'Tartine Bakery', detail: 'Bakery', distance: '0.4 mi' },
      { id: '3', name: 'Bi-Rite Market', detail: 'Grocery', distance: '0.6 mi' },
    ],
  },

  'timeline-feed': {
    data: [
      { id: '1', time: '9:00 AM', title: 'Stand-up', body: 'Daily team sync' },
      { id: '2', time: '11:00 AM', title: 'Design review', body: 'Review new mockups with the team' },
      { id: '3', time: '2:00 PM', title: 'Sprint planning', body: 'Plan next sprint priorities' },
    ],
  },

  'horizontal-showcase': {
    data: [
      {
        id: 's1',
        title: 'Featured',
        cards: [
          { id: 'c1', title: 'Item One', subtitle: 'Subtitle here' },
          { id: 'c2', title: 'Item Two', subtitle: 'Subtitle here' },
          { id: 'c3', title: 'Item Three', subtitle: 'Subtitle here' },
        ],
      },
      {
        id: 's2',
        title: 'Popular',
        cards: [
          { id: 'c4', title: 'Item Four', subtitle: 'Subtitle here' },
          { id: 'c5', title: 'Item Five', subtitle: 'Subtitle here' },
        ],
      },
    ],
  },

  'settings-list': {
    data: [
      {
        id: 'g1',
        title: 'Account',
        rows: [
          { id: 'r1', label: 'Profile', value: 'Jane Smith' },
          { id: 'r2', label: 'Email', value: 'jane@example.com' },
        ],
      },
      {
        id: 'g2',
        title: 'Preferences',
        rows: [
          { id: 'r3', label: 'Theme', value: 'System' },
          { id: 'r4', label: 'Notifications', value: 'On' },
        ],
      },
    ],
  },
};

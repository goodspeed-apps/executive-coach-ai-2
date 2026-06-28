/**
 * Unstoried Variant CI Check
 *
 * Fails if any registered variant/scaffold id has no matching Storybook story.
 * Every story MUST carry `name: '<id>'` with the verbatim registry id so this
 * check can find it.
 *
 * RN-free import strategy:
 *   - KIT_*_VARIANT_IDS: from components/kit/primitives/types.ts (pure — the RN
 *     imports in that file are type-only inside interface declarations, erased at
 *     runtime).
 *   - AUTH_VARIANT_IDS: from components/kit/auth/ids.ts (pure leaf module).
 *   - SETTINGS_VARIANT_IDS: from components/kit/settings/ids.ts (pure leaf module).
 *   - SCAFFOLD_IDS: from components/kit/scaffolds/ids.ts (pure leaf module).
 *   We do NOT import from registry.ts files — those pull in RN components.
 */

import { join } from 'node:path';
import { storyIdsInFile, collectStoryIds, missingStories } from '../../scripts/story-coverage';

// Pure id arrays — no RN components dragged in.
import {
  KIT_BUTTON_VARIANT_IDS,
  KIT_CARD_VARIANT_IDS,
  KIT_INPUT_VARIANT_IDS,
  KIT_LISTROW_VARIANT_IDS,
  KIT_HEADER_VARIANT_IDS,
  KIT_SURFACE_VARIANT_IDS,
} from '../../components/kit/primitives/types';
import { AUTH_VARIANT_IDS } from '../../components/kit/auth/ids';
import { SETTINGS_VARIANT_IDS } from '../../components/kit/settings/ids';
import { SCAFFOLD_IDS } from '../../components/kit/scaffolds/ids';

// Absolute path to the stories directory (resolved relative to project root).
const STORIES_DIR = join(__dirname, '../../stories');

// ─── Build the required id list ───────────────────────────────────────────────

// Primitives: family-prefixed as used in primitives.stories.tsx names.
const requiredButtonIds = [...KIT_BUTTON_VARIANT_IDS]; // unprefixed
const requiredCardIds = [...KIT_CARD_VARIANT_IDS].map((id) => `card-${id}`);
const requiredInputIds = [...KIT_INPUT_VARIANT_IDS].map((id) => `input-${id}`);
const requiredListRowIds = [...KIT_LISTROW_VARIANT_IDS].map((id) => `listrow-${id}`);
const requiredHeaderIds = [...KIT_HEADER_VARIANT_IDS].map((id) => `header-${id}`);
const requiredSurfaceIds = [...KIT_SURFACE_VARIANT_IDS].map((id) => `surface-${id}`);

const REQUIRED_IDS: string[] = [
  ...requiredButtonIds,
  ...requiredCardIds,
  ...requiredInputIds,
  ...requiredListRowIds,
  ...requiredHeaderIds,
  ...requiredSurfaceIds,
  ...[...AUTH_VARIANT_IDS],
  ...[...SETTINGS_VARIANT_IDS],
  ...[...SCAFFOLD_IDS],
];

// ─── Unit tests for the story-coverage helper ─────────────────────────────────

describe('storyIdsInFile', () => {
  test('extracts name: "id" values from source text', () => {
    const src = `
      export const Foo: StoryObj = { name: 'solid', render: () => null };
      export const Bar: StoryObj = { name: 'card-elevated', render: () => null };
    `;
    const ids = storyIdsInFile(src);
    expect(ids.has('solid')).toBe(true);
    expect(ids.has('card-elevated')).toBe(true);
    expect(ids.size).toBe(2);
  });

  test('extracts title last-segment (lowercased) as a secondary id', () => {
    const src = `const meta = { title: 'Kit/Auth/CenteredCard' };`;
    const ids = storyIdsInFile(src);
    expect(ids.has('centeredcard')).toBe(true);
  });

  test('handles double-quoted name fields', () => {
    const src = `export const S: StoryObj = { name: "split-hero" };`;
    const ids = storyIdsInFile(src);
    expect(ids.has('split-hero')).toBe(true);
  });

  test('returns empty set for text with no name or title', () => {
    const ids = storyIdsInFile('const x = 1;');
    expect(ids.size).toBe(0);
  });
});

// ─── Main coverage check ──────────────────────────────────────────────────────

describe('unstoried variant check', () => {
  let present: Set<string>;

  beforeAll(() => {
    present = collectStoryIds(STORIES_DIR);
  });

  test('every registered variant/scaffold id has at least one story', () => {
    const missing = missingStories(REQUIRED_IDS, present);
    if (missing.length > 0) {
      // Fail with a clear, actionable message listing exactly which ids are missing.
      throw new Error(
        `${missing.length} registered id(s) have no story with a matching \`name: '<id>'\`:\n` +
          missing.map((id) => `  • ${id}`).join('\n') +
          '\n\nAdd a story export with `name: \'<id>\'` in stories/kit/ for each missing id.',
      );
    }
    expect(missing).toHaveLength(0);
  });

  test('KitButton ids are all present (spot-check)', () => {
    const missing = missingStories(requiredButtonIds, present);
    expect(missing).toHaveLength(0);
  });

  test('KitCard ids are all present (spot-check)', () => {
    const missing = missingStories(requiredCardIds, present);
    expect(missing).toHaveLength(0);
  });

  test('auth ids are all present (spot-check)', () => {
    const missing = missingStories([...AUTH_VARIANT_IDS], present);
    expect(missing).toHaveLength(0);
  });

  test('scaffold ids are all present (spot-check)', () => {
    const missing = missingStories([...SCAFFOLD_IDS], present);
    expect(missing).toHaveLength(0);
  });
});

// ─── missingStories helper unit tests ────────────────────────────────────────

describe('missingStories', () => {
  test('returns empty array when all required ids are present', () => {
    const present = new Set(['solid', 'outline', 'ghost']);
    expect(missingStories(['solid', 'outline'], present)).toEqual([]);
  });

  test('returns sorted missing ids', () => {
    const present = new Set(['solid']);
    expect(missingStories(['ghost', 'outline', 'solid'], present)).toEqual(['ghost', 'outline']);
  });

  test('returns all when none present', () => {
    const present = new Set<string>();
    const result = missingStories(['a', 'b'], present);
    expect(result).toEqual(['a', 'b']);
  });
});

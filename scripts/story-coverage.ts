/**
 * GAS Template — Story Coverage Helpers
 *
 * Pure fs/string functions for discovering which variant ids are covered by
 * Storybook story files. No JSX, no React Native — safe to import from any
 * jest project (scripts project uses ts-jest, no RN env).
 *
 * Convention: a story is "registered" when either:
 *   (a) it carries `name: '<id>'` — a verbatim match on the string literal.
 *   (b) the story file's Meta `title` last path segment matches the id
 *       (lowercased, trimmed) — e.g. title: 'Kit/Auth/CenteredCard' → 'centeredcard'.
 *
 * The unstoried-variant check uses only (a) — all stories MUST carry `name: '<id>'`
 * with the verbatim id (including family prefix, e.g. 'card-brutalist').
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Extract every story id found in a single story source file.
 * Collects both `name: '<id>'` literals and the last segment of any
 * `title: 'A/B/<seg>'` string (lowercased, trimmed).
 */
export function storyIdsInFile(src: string): Set<string> {
  const ids = new Set<string>();

  // (a) name: '<id>' — verbatim id, single or double quotes.
  const nameRe = /\bname\s*:\s*['"]([^'"]+)['"]/g;
  let m: RegExpExecArray | null;
  while ((m = nameRe.exec(src)) !== null) {
    ids.add(m[1].trim());
  }

  // (b) title: 'A/B/<seg>' last segment, lowercased and trimmed.
  const titleRe = /\btitle\s*:\s*['"]([^'"]+)['"]/g;
  while ((m = titleRe.exec(src)) !== null) {
    const parts = m[1].split('/');
    const last = parts[parts.length - 1].trim().toLowerCase();
    if (last) ids.add(last);
  }

  return ids;
}

/**
 * Recursively collect all story ids from every *.stories.tsx file under
 * `storiesDir`, returning the union as a single Set<string>.
 */
export function collectStoryIds(storiesDir: string): Set<string> {
  const all = new Set<string>();
  walkStories(storiesDir, all);
  return all;
}

function walkStories(dir: string, ids: Set<string>): void {
  let names: string[];
  try {
    // Use the string[] overload (no withFileTypes) for broad TypeScript compatibility.
    names = readdirSync(dir) as string[];
  } catch {
    return;
  }
  for (const name of names) {
    const full = join(dir, name);
    try {
      const s = statSync(full);
      if (s.isDirectory()) {
        walkStories(full, ids);
      } else if (s.isFile() && name.endsWith('.stories.tsx')) {
        try {
          const src = readFileSync(full, 'utf8');
          for (const id of storyIdsInFile(src)) {
            ids.add(id);
          }
        } catch {
          // skip unreadable files
        }
      }
    } catch {
      // skip entries we can't stat
    }
  }
}

/**
 * Return the subset of `required` ids that have no matching story in `present`.
 * Result is sorted for stable output.
 */
export function missingStories(required: string[], present: Set<string>): string[] {
  return required.filter((id) => !present.has(id)).sort();
}

/**
 * Control test-handle coverage — mirrors the studio app-quality gate's
 * `control/missing-test-handle` rule (scanSelectorCoverage) so a tappable
 * control that ships without a testID or accessibilityLabel fails here, in the
 * template's own CI, instead of only at the EAS-dispatch chokepoint.
 *
 * A real onPress (anything other than the no-op shapes the dead-control scan
 * owns) MUST have a testID or accessibilityLabel in its JSX element window so
 * the functional gate's flow driver has a stable handle to target. This is a
 * pure-filesystem scan: no React Native render, no component imports.
 */
import { readdirSync, statSync, readFileSync } from 'fs';
import { join, extname } from 'path';

const REPO = join(__dirname, '..', '..');
const ROOTS = ['app', 'components'];
const SKIP_DIRS = new Set(['node_modules', '.git', '.expo', 'dist', 'build', 'ios', 'android', '__tests__', '__mocks__']);

/** A stable test handle the functional-gate flow driver can target. */
const HANDLE_RE = /\b(?:testID|accessibilityLabel)\s*=/;
/** A real tappable action — excludes the no-op shapes (those are the dead-control scan's job). */
const REAL_ONPRESS_RE = /\bonPress\s*=\s*\{(?!\s*(?:\(\s*\)\s*=>\s*\{\s*\}|undefined|null|noop)\s*\})/;

function stripComments(line: string): string {
  let out = line.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  out = out.replace(/\/\*[\s\S]*?\*\//g, '');
  out = out.replace(/(^|[^:])\/\/.*$/, '$1');
  return out;
}

function isNonCopyLine(line: string): boolean {
  const t = line.trim();
  if (t === '') return true;
  if (t.startsWith('//') || t.startsWith('*') || t.startsWith('/*') || t.startsWith('*/')) return true;
  if (/^import\s/.test(t) || /^export\s+\{/.test(t)) return true;
  return false;
}

/**
 * Does the JSX element around a handler line carry a testID or accessibilityLabel?
 * Scans back to the element's opening tag and forward to its close — mirroring the
 * gate's elementHasTestHandle window (10 lines back, 12 forward).
 */
function elementHasTestHandle(lines: string[], idx: number): boolean {
  for (let i = idx; i >= Math.max(0, idx - 10); i--) {
    const l = stripComments(lines[i]);
    if (HANDLE_RE.test(l)) return true;
    if (i !== idx && /<[A-Za-z]/.test(l)) break;
  }
  for (let i = idx + 1; i <= Math.min(lines.length - 1, idx + 12); i++) {
    const l = stripComments(lines[i]);
    if (HANDLE_RE.test(l)) return true;
    if (/\/?>/.test(l)) break;
  }
  return false;
}

function collectTsxFiles(dir: string, out: string[]): void {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    if (SKIP_DIRS.has(name)) continue;
    const abs = join(dir, name);
    let st;
    try {
      st = statSync(abs);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      collectTsxFiles(abs, out);
    } else if (extname(name) === '.tsx' && !/\.(test|spec|stories)\.tsx$/.test(name)) {
      out.push(abs);
    }
  }
}

describe('control test-handle coverage', () => {
  const files: string[] = [];
  for (const root of ROOTS) collectTsxFiles(join(REPO, root), files);

  it('scans a non-empty set of source files', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it('every tappable control has a testID or accessibilityLabel', () => {
    const violations: string[] = [];
    for (const abs of files) {
      const lines = readFileSync(abs, 'utf8').split('\n');
      lines.forEach((rawLine, idx) => {
        if (isNonCopyLine(rawLine)) return;
        const line = stripComments(rawLine);
        if (!REAL_ONPRESS_RE.test(line)) return;
        if (elementHasTestHandle(lines, idx)) return;
        const rel = abs.slice(REPO.length + 1);
        violations.push(`${rel}:${idx + 1} | ${line.trim().slice(0, 100)}`);
      });
    }
    expect(violations).toEqual([]);
  });
});

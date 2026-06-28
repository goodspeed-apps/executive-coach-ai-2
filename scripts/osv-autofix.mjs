#!/usr/bin/env node
/**
 * osv-autofix — close known dependency advisories by writing scoped pnpm overrides.
 *
 * WHY THIS EXISTS
 * The OSV / pnpm-audit gate is scan-only: it surfaces advisories but never fixes them.
 * Most advisories here are TRANSITIVE (deep under react-native / expo / metro), so a
 * direct dependency bump cannot reach them. The pnpm answer is a scoped override that
 * pins the vulnerable transitive package up to its patched version. This script reads
 * `pnpm audit --json`, classifies each advisory, and writes the SAFE overrides for you.
 *
 * SAFE vs SKIPPED (the script never ships a risky fix on its own):
 *   - SAFE: the patched version is in the SAME major as what is installed. The override
 *     is capped below the next major (`>=patched <nextMajor`) so it can never silently
 *     jump a major and break the build.
 *   - SKIPPED (flagged for a human): the patched version is a MAJOR bump from what is
 *     installed (e.g. uuid 7/9 -> 11, where the API changed), or the advisory spans more
 *     than one installed major (needs a judgement call per major). These are printed and
 *     left untouched.
 *
 * After writing overrides it runs `pnpm install` and re-audits, reporting what cleared.
 *
 * USAGE
 *   node scripts/osv-autofix.mjs            # write safe overrides, install, re-audit
 *   node scripts/osv-autofix.mjs --dry-run  # classify + print only; write nothing
 *
 * Exit code: 0 if nothing remains that this script could have fixed; 1 if advisories
 * remain that need a human (so CI / a caller can tell the difference).
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PKG_PATH = join(ROOT, 'package.json');
const DRY_RUN = process.argv.includes('--dry-run');

// ── helpers ───────────────────────────────────────────────────────────────────

/** Run pnpm audit and return the parsed JSON (audit exits non-zero when vulns exist). */
function runAudit() {
  let out = '';
  try {
    out = execFileSync('pnpm', ['audit', '--json'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  } catch (e) {
    // pnpm audit exits 1 when advisories are found; the JSON is still on stdout.
    out = e.stdout?.toString() ?? '';
  }
  if (!out.trim()) return { advisories: {} };
  try {
    return JSON.parse(out);
  } catch {
    // pnpm may emit NDJSON or a wrapper; take the last JSON object on stdout.
    const lines = out.trim().split('\n').filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i--) {
      try { return JSON.parse(lines[i]); } catch { /* keep scanning up */ }
    }
    return { advisories: {} };
  }
}

/** The advisory map across pnpm-audit output shapes ({advisories:{...}} or {...}). */
function advisoriesOf(report) {
  const adv = report.advisories ?? report;
  return adv && typeof adv === 'object' ? Object.values(adv).filter((a) => a && a.module_name) : [];
}

/** First semver-looking token in a range string, e.g. ">=1.8.4" -> "1.8.4". */
function firstVersion(range) {
  const m = String(range ?? '').match(/\d+\.\d+\.\d+/);
  return m ? m[0] : null;
}

const majorOf = (v) => (v ? Number(v.split('.')[0]) : NaN);

// ── classify ────────────────────────────────────────────────────────────────

function classify(advisory) {
  const name = advisory.module_name;
  const vulnerable = advisory.vulnerable_versions ?? '*';
  const patchedMin = firstVersion(advisory.patched_versions);
  const findings = Array.isArray(advisory.findings) ? advisory.findings : [];
  const installed = [...new Set(findings.map((f) => f.version).filter(Boolean))];
  const installedMajors = [...new Set(installed.map(majorOf).filter((n) => Number.isFinite(n)))];

  if (!patchedMin) {
    return { name, decision: 'skip', reason: 'no patched version published', vulnerable, installed };
  }
  const patchMajor = majorOf(patchedMin);

  if (installedMajors.length > 1) {
    return { name, decision: 'skip', reason: `installed across majors ${installedMajors.join('/')} — needs a per-major override`, vulnerable, installed };
  }
  const installedMajor = installedMajors[0];
  if (Number.isFinite(installedMajor) && patchMajor > installedMajor) {
    return { name, decision: 'skip', reason: `patched ${patchedMin} is a MAJOR bump from installed ${installed.join(', ')} — review by hand`, vulnerable, installed };
  }

  // SAFE: same-major patch. Cap below the next major so the override can't jump a major.
  const overrideKey = `${name}@${vulnerable}`;
  const overrideValue = `>=${patchedMin} <${patchMajor + 1}`;
  return { name, decision: 'fix', overrideKey, overrideValue, severity: advisory.severity, vulnerable, installed };
}

// ── main ──────────────────────────────────────────────────────────────────────

console.log('[osv-autofix] auditing...');
const before = runAudit();
const advisories = advisoriesOf(before);
if (advisories.length === 0) {
  console.log('[osv-autofix] no advisories. Nothing to do.');
  process.exit(0);
}

const classified = advisories.map(classify);
const toFix = classified.filter((c) => c.decision === 'fix');
const toSkip = classified.filter((c) => c.decision === 'skip');

console.log(`\n[osv-autofix] ${advisories.length} advisory record(s): ${toFix.length} safe to override, ${toSkip.length} need a human.\n`);
for (const c of toFix) console.log(`  FIX   ${c.severity ?? '?'}\t${c.overrideKey}  ->  ${c.overrideValue}`);
for (const c of toSkip) console.log(`  SKIP  ${c.name}\t(${c.reason})`);
console.log('');

if (toFix.length === 0) {
  console.log('[osv-autofix] nothing safely auto-fixable. Skipped items above need manual review.');
  process.exit(toSkip.length > 0 ? 1 : 0);
}

if (DRY_RUN) {
  console.log('[osv-autofix] --dry-run: wrote nothing.');
  process.exit(toSkip.length > 0 ? 1 : 0);
}

// Merge the safe overrides into pnpm.overrides ONLY. We do NOT touch the top-level
// npm-style `overrides`: pnpm reads pnpm.overrides, and a scoped-range key there for a
// package that is also a direct dependency (e.g. @babel/core) is INVALID npm syntax and
// errors with EOVERRIDE. pnpm.overrides is the field that actually takes effect.
const pkg = JSON.parse(readFileSync(PKG_PATH, 'utf8'));
pkg.pnpm ??= {};
pkg.pnpm.overrides ??= {};
let added = 0;
for (const c of toFix) {
  if (pkg.pnpm.overrides[c.overrideKey] !== c.overrideValue) added++;
  pkg.pnpm.overrides[c.overrideKey] = c.overrideValue;
}
writeFileSync(PKG_PATH, JSON.stringify(pkg, null, 2) + '\n');
console.log(`[osv-autofix] wrote ${added} override(s) to package.json. Installing...`);

execFileSync('pnpm', ['install', '--no-frozen-lockfile'], { cwd: ROOT, stdio: 'inherit' });

console.log('\n[osv-autofix] re-auditing...');
const after = advisoriesOf(runAudit());
const stillByName = new Set(after.map((a) => a.module_name));
const fixedNames = toFix.map((c) => c.name).filter((n) => !stillByName.has(n));
const stillFixable = toFix.map((c) => c.name).filter((n) => stillByName.has(n));

console.log(`\n[osv-autofix] cleared: ${fixedNames.join(', ') || '(none)'}`);
if (stillFixable.length) console.log(`[osv-autofix] STILL present after override (investigate): ${stillFixable.join(', ')}`);
if (toSkip.length) console.log(`[osv-autofix] left for manual review: ${toSkip.map((c) => c.name).join(', ')}`);

// Non-zero when anything still needs a human (skipped, or an override that didn't take).
process.exit(stillFixable.length > 0 || toSkip.length > 0 ? 1 : 0);

#!/usr/bin/env node

/**
 * GAS Template — Bundle Size Check
 *
 * Runs expo export for web, sums the output, and fails if over the budget
 * defined in gas.config.ts (performance.maxBundleSizeMB, default 8 MB).
 *
 * Also measures the whole-app JS gz bytes of the export dir and compares to
 * scripts/kit-size-baseline.json (kitBytesGz) AND gas.config.ts
 * performance.maxKitBytesGz. Fails (exit 1) if jsGz > maxKitBytesGz OR
 * jsGz > baseline.kitBytesGz * 1.05.
 *
 * NOTE: "whole-app JS gz" is the stable proxy for kit growth in the web export.
 * The true Hermes .hbc delta is recorded from the native EAS artifact into
 * baseline.hermesBytes out of band — this script does not produce it.
 *
 * Usage: node scripts/check-bundle-size.mjs
 *        node scripts/check-bundle-size.mjs --update-kit-baseline
 *        npm run check-bundle
 */

import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

// ─── Config ───────────────────────────────────────────────────────────────────

const DEFAULT_OUTPUT_DIR = '.perf-build';
const DEFAULT_MB = 8;

// ─── CLI args ─────────────────────────────────────────────────────────────────

/** Minimal arg parser: --skip-export, --output-dir <path>, --update-kit-baseline. */
function parseArgs(argv) {
  const opts = { skipExport: false, outputDir: DEFAULT_OUTPUT_DIR, updateKitBaseline: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--skip-export') {
      opts.skipExport = true;
    } else if (a === '--update-kit-baseline') {
      opts.updateKitBaseline = true;
    } else if (a === '--output-dir') {
      const val = argv[i + 1];
      if (!val) {
        process.stderr.write('⚠️  --output-dir requires a path argument.\n');
        process.exit(2);
      }
      opts.outputDir = val;
      i++;
    } else if (a.startsWith('--output-dir=')) {
      opts.outputDir = a.slice('--output-dir='.length);
    }
  }
  return opts;
}

const { skipExport, outputDir: OUTPUT_DIR, updateKitBaseline } = parseArgs(process.argv.slice(2));

/** Regex-parse maxBundleSizeMB from gas.config.ts — file is not importable from plain Node. */
function readThreshold() {
  try {
    const src = readFileSync('gas.config.ts', 'utf8');
    const match = src.match(/maxBundleSizeMB\s*:\s*(\d+(?:\.\d+)?)/);
    if (match) {
      const parsed = parseFloat(match[1]);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    process.stderr.write(
      `⚠️  gas.config.ts has no maxBundleSizeMB — falling back to ${DEFAULT_MB} MB. Set performance.maxBundleSizeMB explicitly.\n`,
    );
  } catch {
    process.stderr.write(`⚠️  Could not read gas.config.ts — falling back to ${DEFAULT_MB} MB.\n`);
  }
  return DEFAULT_MB;
}

// ─── Kit size budget helpers ──────────────────────────────────────────────────

const KIT_BASELINE_PATH = 'scripts/kit-size-baseline.json';
const DEFAULT_MAX_KIT_BYTES_GZ = 400000;

/** Regex-parse maxKitBytesGz from gas.config.ts (same approach as maxBundleSizeMB). */
function readMaxKitBytesGz() {
  try {
    const src = readFileSync('gas.config.ts', 'utf8');
    const match = src.match(/maxKitBytesGz\s*:\s*(\d+)/);
    if (match) {
      const parsed = parseInt(match[1], 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  } catch {
    // ignore — fall through to default
  }
  return DEFAULT_MAX_KIT_BYTES_GZ;
}

/** Read the committed kit baseline JSON; returns null if missing/unreadable. */
function readKitBaseline() {
  try {
    return JSON.parse(readFileSync(KIT_BASELINE_PATH, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Recursively gzip-compress every .js file under `dir` and return the sum of
 * compressed byte counts. This is a stable proxy for kit growth in the web
 * export: it measures the same JS surface area as Metro, without requiring a
 * Hermes build. The true Hermes .hbc delta is recorded from the EAS artifact
 * into baseline.hermesBytes out of band.
 */
function jsGzBytes(dir) {
  let total = 0;
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        total += jsGzBytes(full);
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        try {
          const raw = readFileSync(full);
          total += gzipSync(raw).length;
        } catch {
          // skip unreadable files
        }
      }
    }
  } catch {
    // directory unreadable — return 0
  }
  return total;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Recursively sum all file sizes under a directory. */
function dirSizeBytes(dir) {
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      total += dirSizeBytes(full);
    } else {
      total += statSync(full).size;
    }
  }
  return total;
}

function cleanup() {
  // Only clean up the directory we own (default). If a caller passes
  // --output-dir explicitly (e.g. CI pointing at /tmp/export-check), leave
  // it alone — they manage its lifecycle.
  if (OUTPUT_DIR === DEFAULT_OUTPUT_DIR && existsSync(OUTPUT_DIR)) {
    rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const thresholdMB = readThreshold();

console.log('\n━━━ GAS Bundle Size Check ━━━\n');
console.log(`▸ Budget: ${thresholdMB} MB`);
if (skipExport) {
  console.log(`▸ Mode: --skip-export (measuring existing ${OUTPUT_DIR})`);
}

cleanup();

try {
  if (skipExport) {
    if (!existsSync(OUTPUT_DIR)) {
      console.error(
        `\n⛔ --skip-export was set but ${OUTPUT_DIR} does not exist. ` +
        `Run expo export before invoking this script with --skip-export.\n`,
      );
      process.exit(1);
    }
  } else {
    console.log(`\n▸ Running expo export (web)...`);
    try {
      execSync(
        `npx expo export --platform web --output-dir ${OUTPUT_DIR}`,
        { stdio: ['ignore', 'inherit', 'pipe'] },
      );
    } catch (exportErr) {
      // Template-mode skip: expo export can't run without a real project configured.
      // Capture stderr + message to detect known template-only failures.
      const stderr = exportErr?.stderr?.toString() ?? '';
      const msg = String(exportErr?.message ?? '');
      const combined = stderr + msg;

      // Template-mode is narrow: app.config.js requires gas.config.ts which Node can't
      // import directly in the bare template (DevAgent provisions the build pipeline).
      // GAS_REQUIRE_BUNDLE_CHECK=1 disables this skip so DevAgent-generated apps fail
      // on real bundle problems instead of silently passing.
      const requireBundleCheck = process.env.GAS_REQUIRE_BUNDLE_CHECK === '1';
      const isTemplateFailure = !requireBundleCheck && (
        /Cannot find module ['"][.\/]*gas\.config['"]?/.test(combined) ||
        combined.includes('require() of ES Module') ||
        !existsSync('node_modules')
      );

      if (isTemplateFailure) {
        // Print stderr so the skip reason is visible
        if (stderr) process.stderr.write(stderr);
        console.log(
          '\n  — template-mode skip: expo export cannot run in the uninstalled template directory.',
        );
        console.log('    This check will run normally in a provisioned app.\n');
        process.exit(0);
      }

      // Real failure — print captured stderr then re-throw
      if (stderr) process.stderr.write(stderr);
      throw exportErr;
    }
  }

  // Measure
  const bytes = dirSizeBytes(OUTPUT_DIR);
  const mb = bytes / (1024 * 1024);
  const over = mb > thresholdMB;

  const label = over ? '✗' : '✓';
  console.log(`\nBundle size: ${mb.toFixed(2)} MB / ${thresholdMB} MB limit ${label}`);

  if (over) {
    console.error(
      `\n⛔ Bundle exceeds budget by ${(mb - thresholdMB).toFixed(2)} MB. ` +
      `Reduce bundle size or raise performance.maxBundleSizeMB in gas.config.ts.\n`,
    );
    process.exit(1);
  }

  console.log('\n✅ Bundle size within budget.\n');

  // ─── Kit size budget check ──────────────────────────────────────────────────
  console.log('━━━ Kit Size Budget Check ━━━\n');

  const maxKitBytesGz = readMaxKitBytesGz();
  const baseline = readKitBaseline();
  const jsGz = jsGzBytes(OUTPUT_DIR);
  const jsGzKB = (jsGz / 1024).toFixed(1);
  const maxKB = (maxKitBytesGz / 1024).toFixed(1);

  console.log(`▸ JS gz bytes (whole-app export): ${jsGzKB} KB`);
  console.log(`▸ maxKitBytesGz budget:           ${maxKB} KB`);

  if (baseline) {
    const baselineKB = (baseline.kitBytesGz / 1024).toFixed(1);
    const ceilingKB = ((baseline.kitBytesGz * 1.05) / 1024).toFixed(1);
    console.log(`▸ Baseline (committed):           ${baselineKB} KB  (+5% ceiling: ${ceilingKB} KB)`);
  }

  // --update-kit-baseline: write the measured value and exit 0.
  if (updateKitBaseline) {
    const existing = readKitBaseline() ?? {};
    const updated = {
      ...existing,
      kitBytesGz: jsGz,
      measuredAt: new Date().toISOString().slice(0, 10),
    };
    writeFileSync(KIT_BASELINE_PATH, JSON.stringify(updated, null, 2) + '\n');
    console.log(`\n✅ Kit baseline updated: ${jsGzKB} KB gz → ${KIT_BASELINE_PATH}\n`);
    process.exit(0);
  }

  let kitFailed = false;

  if (jsGz > maxKitBytesGz) {
    console.error(
      `\n⛔ JS gz (${jsGzKB} KB) exceeds maxKitBytesGz budget (${maxKB} KB). ` +
        `Reduce kit size or raise performance.maxKitBytesGz in gas.config.ts.\n`,
    );
    kitFailed = true;
  }

  if (baseline && baseline.kitBytesGz > 0) {
    const ceiling = baseline.kitBytesGz * 1.05;
    if (jsGz > ceiling) {
      const ceilingKB = (ceiling / 1024).toFixed(1);
      console.error(
        `\n⛔ JS gz (${jsGzKB} KB) exceeds baseline +5% ceiling (${ceilingKB} KB). ` +
          `Run \`node scripts/check-bundle-size.mjs --update-kit-baseline\` to update the baseline ` +
          `if this growth is intentional.\n`,
      );
      kitFailed = true;
    }
  }

  if (!kitFailed) {
    console.log('\n✅ Kit size within budget.\n');
  } else {
    process.exit(1);
  }
} finally {
  cleanup();
}

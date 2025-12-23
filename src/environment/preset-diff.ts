/**
 * Preset Diff Viewer
 *
 * - Compare two preset objects (or files under config/customers/*.json)
 * - Produces a structured diff and a human-readable summary
 * - Saves reports to test-results/preset-diff/
 *
 * Usage:
 *  import { diffAndAttach } from '@src/environment/preset-diff';
 *  await diffAndAttach('customer_A', 'customer_B', { attachToTestInfo: testInfo });
 */

import fs from 'fs';
import path from 'path';
import { Logger } from '@src/utils/logger.util';

const logger =
  (globalThis as any).__TEST_LOGGER__ ||
  new Logger({ testId: 'preset-diff', testOutputDir: './logs', toConsole: true, context: 'preset-diff' });

export type DiffChange =
  | {
      kind: 'added';
      path: string; // dot path
      value: any;
    }
  | {
      kind: 'removed';
      path: string;
      value: any;
    }
  | {
      kind: 'changed';
      path: string;
      oldValue: any;
      newValue: any;
    }
  | {
      kind: 'typeChanged';
      path: string;
      oldType: string;
      newType: string;
      oldValue: any;
      newValue: any;
    };

export type PresetDiff = {
  aId?: string;
  bId?: string;
  timestamp: string;
  changes: DiffChange[];
};

/** stable stringify for predictable diffs */
function stableStringify(obj: any): string {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map(stableStringify).join(',')}]`;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => JSON.stringify(k) + ':' + stableStringify(obj[k])).join(',')}}`;
}

/** load preset by path or by id (under config/customers/<id>.json) */
export function loadPreset(pathOrId: string): any {
  const candidateFile = path.isAbsolute(pathOrId) ? pathOrId : path.join(process.cwd(), 'config', 'customers', `${pathOrId}.json`);
  if (!fs.existsSync(candidateFile)) {
    throw new Error(`Preset not found: ${candidateFile}`);
  }
  const raw = fs.readFileSync(candidateFile, 'utf8');
  return JSON.parse(raw);
}

/** Helper to determine primitive */
function isPrimitive(v: any) {
  return v === null || (typeof v !== 'object' && typeof v !== 'function');
}

/** Build dot-path for nested keys */
function joinPath(base: string, key: string | number) {
  if (base === '') return String(key);
  // arrays will use [i] style
  if (typeof key === 'number') return `${base}[${key}]`;
  return `${base}.${key}`;
}

/**
 * Diff two values recursively and append changes to result.
 * - For objects: walk keys
 * - For arrays: if arrays of primitives compare by index; if arrays of objects try to match by 'name' or stableStringify
 */
export function diffValues(a: any, b: any, basePath = '', out: DiffChange[] = []): DiffChange[] {
  // same reference or equal by stable stringify -> no change
  if (stableStringify(a) === stableStringify(b)) return out;

  const aIsPrim = isPrimitive(a);
  const bIsPrim = isPrimitive(b);

  if (aIsPrim && bIsPrim) {
    out.push({ kind: 'changed', path: basePath, oldValue: a, newValue: b });
    return out;
  }

  if (aIsPrim !== bIsPrim) {
    out.push({
      kind: 'typeChanged',
      path: basePath,
      oldType: typeof a,
      newType: typeof b,
      oldValue: a,
      newValue: b,
    });
    return out;
  }

  // both arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    // if array of primitives, compare by index
    const aPrim = a.every(isPrimitive);
    const bPrim = b.every(isPrimitive);
    if (aPrim && bPrim) {
      const len = Math.max(a.length, b.length);
      for (let i = 0; i < len; i++) {
        if (i >= a.length) {
          out.push({ kind: 'added', path: joinPath(basePath, i), value: b[i] });
        } else if (i >= b.length) {
          out.push({ kind: 'removed', path: joinPath(basePath, i), value: a[i] });
        } else if (stableStringify(a[i]) !== stableStringify(b[i])) {
          out.push({ kind: 'changed', path: joinPath(basePath, i), oldValue: a[i], newValue: b[i] });
        }
      }
      return out;
    }

    // arrays of objects: try to match by 'key' fields: 'name', 'key', 'id' in that priority
    const keyFieldCandidates = ['name', 'key', 'id'];
    // build map for b
    const mapB = new Map<string, any>();
    for (const item of b) {
      let keyFound = keyFieldCandidates.map(k => item && item[k]).find(v => v !== undefined);
      if (keyFound === undefined) keyFound = stableStringify(item);
      mapB.set(String(keyFound), item);
    }
    // track processed keys
    const processed = new Set<string>();
    for (const itemA of a) {
      let keyA = keyFieldCandidates.map(k => itemA && itemA[k]).find(v => v !== undefined);
      if (keyA === undefined) keyA = stableStringify(itemA);
      const match = mapB.get(String(keyA));
      if (match !== undefined) {
        // recursive diff
        diffValues(itemA, match, joinPath(basePath, String(keyA)), out);
        processed.add(String(keyA));
      } else {
        out.push({ kind: 'removed', path: joinPath(basePath, String(keyA)), value: itemA });
      }
    }
    // additions
    for (const [k, itemB] of mapB.entries()) {
      if (!processed.has(k)) {
        out.push({ kind: 'added', path: joinPath(basePath, String(k)), value: itemB });
      }
    }
    return out;
  }

  // both objects (not arrays)
  if (!Array.isArray(a) && !Array.isArray(b)) {
    const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
    const sorted = Array.from(keys).sort();
    for (const key of sorted) {
      if (!(key in a)) {
        out.push({ kind: 'added', path: joinPath(basePath, key), value: b[key] });
      } else if (!(key in b)) {
        out.push({ kind: 'removed', path: joinPath(basePath, key), value: a[key] });
      } else {
        diffValues(a[key], b[key], joinPath(basePath, key), out);
      }
    }
    return out;
  }

  // fallback: type changed
  out.push({
    kind: 'typeChanged',
    path: basePath,
    oldType: typeof a,
    newType: typeof b,
    oldValue: a,
    newValue: b,
  });
  return out;
}

/** Main diff wrapper */
export function diffPresets(a: any, b: any, aId?: string, bId?: string): PresetDiff {
  const changes: DiffChange[] = [];
  diffValues(a, b, '', changes);
  return {
    aId,
    bId,
    timestamp: new Date().toISOString(),
    changes,
  };
}

/** Human-friendly formatter */
export function formatDiffHuman(diff: PresetDiff): string {
  if (!diff.changes || diff.changes.length === 0) return 'No differences found.';
  const lines: string[] = [];
  lines.push(`Preset Diff Report`);
  if (diff.aId || diff.bId) {
    lines.push(`A: ${diff.aId ?? 'N/A'}    B: ${diff.bId ?? 'N/A'}`);
  }
  lines.push(`Generated: ${diff.timestamp}`);
  lines.push('');
  for (const c of diff.changes) {
    switch (c.kind) {
      case 'added':
        lines.push(`+ ADDED   ${c.path} = ${safePreview(c.value)}`);
        break;
      case 'removed':
        lines.push(`- REMOVED ${c.path} = ${safePreview(c.value)}`);
        break;
      case 'changed':
        lines.push(`~ CHANGED ${c.path} : ${safePreview(c.oldValue)} => ${safePreview(c.newValue)}`);
        break;
      case 'typeChanged':
        lines.push(
          `! TYPE    ${c.path} : (${c.oldType}) ${safePreview(c.oldValue)} => (${c.newType}) ${safePreview(c.newValue)}`
        );
        break;
    }
  }
  return lines.join('\n');
}

/** small utility to preview values (short) */
function safePreview(v: any) {
  try {
    if (typeof v === 'string') {
      return v.length > 80 ? v.slice(0, 77) + '...' : v;
    }
    const s = JSON.stringify(v);
    return s.length > 120 ? s.slice(0, 117) + '...' : s;
  } catch {
    return String(v);
  }
}

/** Save diff reports to disk (json + human text) and return file paths */
export function saveDiffReport(aId: string, bId: string, diff: PresetDiff) {
  const outDir = path.join(process.cwd(), 'test-results', 'preset-diff');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const baseName = `${sanitizeFileName(aId)}_vs_${sanitizeFileName(bId)}_${Date.now()}`;
  const jsonPath = path.join(outDir, `${baseName}.json`);
  const txtPath = path.join(outDir, `${baseName}.txt`);

  fs.writeFileSync(jsonPath, JSON.stringify(diff, null, 2), 'utf8');
  fs.writeFileSync(txtPath, formatDiffHuman(diff), 'utf8');

  logger.info('[preset-diff] Saved diff reports', { jsonPath, txtPath });
  return { jsonPath, txtPath };
}

/** convenience wrapper for Playwright tests.
 * - loads presets by id (under config/customers)
 * - runs diff, saves report, and (optionally) attaches to testInfo
 */
export async function diffAndAttach(aId: string, bId: string, options?: { attachToTestInfo?: any }) {
  const a = loadPreset(aId);
  const b = loadPreset(bId);
  const diff = diffPresets(a, b, aId, bId);
  const { jsonPath, txtPath } = saveDiffReport(aId, bId, diff);

  // attach to Playwright testInfo if provided
  if (options?.attachToTestInfo) {
    try {
      const ti = options.attachToTestInfo;
      // attach JSON
      await ti.attach('preset-diff-json', { path: jsonPath, contentType: 'application/json' });
      // attach human text
      await ti.attach('preset-diff-text', { path: txtPath, contentType: 'text/plain' });
    } catch (err) {
      logger.warn('[preset-diff] failed to attach to testInfo', { error: String(err) });
    }
  }

  return { diff, jsonPath, txtPath };
}

/** Helpers */
function sanitizeFileName(s: string) {
  return (s || 'unknown').replace(/[^a-z0-9_\-\.]/gi, '_');
}

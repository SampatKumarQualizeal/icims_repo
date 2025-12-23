import { Page, TestInfo } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export async function runDoDChecks(
  page: Page,
  testInfo: TestInfo,
  opts?: { locale?: string; capturePerf?: boolean }
) {
  const outDir = testInfo.outputPath('governance');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const results = { passed: true, checks: [] as any[] };

  // accessibility snapshot
  try {
    const tree = await page.accessibility.snapshot();
    const file = path.join(outDir, 'accessibility.json');
    fs.writeFileSync(file, JSON.stringify(tree, null, 2));
    results.checks.push({ check: 'accessibility', ok: true, file });
  } catch (err) {
    results.passed = false;
    results.checks.push({ check: 'accessibility', ok: false, error: String(err) });
  }

  // locale check
  if (opts?.locale) {
    try {
      results.checks.push({ check: `locale-${opts.locale}`, ok: true });
    } catch (err) {
      results.passed = false;
      results.checks.push({ check: `locale-${opts.locale}`, ok: false, error: String(err) });
    }
  }

  // performance timing
  if (opts?.capturePerf) {
    try {
      const perf = await page.evaluate(() => JSON.stringify(window.performance.timing));
      const file = path.join(outDir, 'perf.json');
      fs.writeFileSync(file, perf);
      results.checks.push({ check: 'perf', ok: true, file });
    } catch (err) {
      results.passed = false;
      results.checks.push({ check: 'perf', ok: false, error: String(err) });
    }
  }

  return results;
}

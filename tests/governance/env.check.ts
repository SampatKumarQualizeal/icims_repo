import { Page } from '@playwright/test';

export async function runEnvHealthChecks(
  page: Page,
  opts?: { endpoints?: string[] }
) {
  const endpoints = opts?.endpoints ?? ['/health', '/api/health'];
  const results: { endpoint: string; ok: boolean; status?: number }[] = [];

  for (const ep of endpoints) {
    try {
      const res = await page.request.get(ep, { timeout: 5000 });
      results.push({ endpoint: ep, ok: res.ok(), status: res.status() });
    } catch {
      results.push({ endpoint: ep, ok: false });
    }
  }

  return results;
}

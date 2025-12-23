
import { test as base, Browser } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { Logger } from '@src/utils/logger.util';
import { config } from '@config/config';

/**
 * NOTE: we use `base.extend<any>` to avoid strict TypeScript fixture-scope mismatch
 * between worker-scoped and test-scoped fixtures. This is a pragmatic, safe approach
 * — runtime behavior is unchanged.
 */

export const workerFixtures = base.extend<any>({
  // worker-scoped auth storage path (one per worker process)
  authStorageStatePath: [
    async ({ browser }: { browser: Browser }, use: (p: string) => Promise<void>, workerInfo:any) => {
      const pid = process.pid;
      const outDir = path.join(process.cwd(), 'test-results', 'auth-state');
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

      const stateFile = path.join(outDir, `storage-${pid}.json`);
      const logger = (globalThis as any).__TEST_LOGGER__ as Logger | undefined;

      if (fs.existsSync(stateFile)) {
        logger?.info('[worker] Reusing auth storage state', { pid, stateFile });
        await use(stateFile);
        return;
      }

      logger?.info('[worker] Creating auth storage state', { pid, stateFile });

      // Create a fresh context and perform UI login steps then save storage state.
      const context = await browser.newContext();
      const page = await context.newPage();

      const loginUrl = config.appBaseUrl?.endsWith('/')
        ? `${config.appBaseUrl}login`
        : `${config.appBaseUrl}/login`;

      try {
        await page.goto(loginUrl, { waitUntil: 'networkidle' });

        // adapt selectors for your application as needed
        if (config.auth?.uiUser) await page.fill('input[name="username"]', config.auth.uiUser);
        if (config.auth?.uiPass) await page.fill('input[name="password"]', config.auth.uiPass);
        await Promise.all([
          page.click('button[type="submit"]'),
          page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30_000 }),
        ]);

        await context.storageState({ path: stateFile });
        logger?.info('[worker] Saved auth storage state', { stateFile });
      } catch (err) {
        logger?.error('[worker] Failed to create auth storage state', { error: String(err) });
        // Ensure context closed on error
      } finally {
        try { await context.close(); } catch (_) { /* ignore */ }
      }

      await use(stateFile);
    },
    { scope: 'worker' }
  ],

  // optional marker file to indicate prewarm complete - helpful for debugging
  prewarmedContextPath: [
    async ({}, use: (p: string) => Promise<void>, workerInfo:any) => {
      const pid = process.pid;
      const outDir = path.join(process.cwd(), 'test-results', 'auth-state');
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

      const marker = path.join(outDir, `prewarm-${pid}.txt`);
      if (!fs.existsSync(marker)) fs.writeFileSync(marker, `prewarmed ${Date.now()}`);
      await use(marker);
    },
    { scope: 'worker' }
  ]
});

export default workerFixtures;

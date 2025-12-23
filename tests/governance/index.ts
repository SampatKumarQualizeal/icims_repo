// tests/governance/index.ts
import {
  test as base,
  expect,
  Browser,
  Page,
  type TestInfo,
  BrowserContext,
} from '@playwright/test';

import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

import { Logger } from '@src/utils/logger.util';
import { config } from '@config/config';

import { runEnvHealthChecks } from './env.check';
import { runDoDChecks } from './dod.check';

import { generateMetadata } from './metadata';
import { TestMetadata } from './types';

import { waitForNetworkIdle } from '@src/utils/wait.util';
import { EvidenceCollector } from '@src/utils/evidence.collector';

import { FailureCategorizer } from '@src/utils/failure.categorizer';
import { FailureTrendStore } from '@src/utils/failure.trends';

import { AuthManager } from '@src/utils/auth-manager.util';
import { BaseTest } from '@src/utils/base-test.util';

import { TabManager } from '@src/components/tab-manager.component';
import { loadTestData } from '@src/config/data-loader.util';
import { extractTestId } from './test-id.util';

// NEW: import ApiClient type/class
import { ApiClient } from '@src/api/api-client';

// -----------------------------------------------------------------------------
// Playwright extend — include apiClient in our fixture typings
// -----------------------------------------------------------------------------
export const test = base.extend<{ apiClient: ApiClient }>({

  // ---------------------------------------------------------------------------
  // Worker-level Logger
  // ---------------------------------------------------------------------------
  workerLogger: [
    async ({ }, use, workerInfo) => {
      const workerId = randomUUID();

      const logger = new Logger({
        testId: `worker-${workerId}`,
        testOutputDir: path.join(workerInfo.project.outputDir, `worker-${workerInfo.workerIndex}`),
        toConsole: true,
        context: `worker:${workerInfo.workerIndex}`,
      });

      (globalThis as any).__WORKER_LOGGER__ = logger;

      logger.info('[Worker] Started', { workerIndex: workerInfo.workerIndex });

      await use(logger);

      logger.info('[Worker] Finished', { workerIndex: workerInfo.workerIndex });
    },
    { scope: 'worker' },
  ],

  // ---------------------------------------------------------------------------
  // Test-level logger
  // ---------------------------------------------------------------------------
  logger: async ({ workerLogger }, use, testInfo: TestInfo) => {
    const testId = randomUUID();
    const out = testInfo.outputPath('logs');

    const logger = workerLogger.child({
      testId,
      testOutputDir: out,
      context: `test:${testInfo.title}`,
    });

    (globalThis as any).__TEST_LOGGER__ = logger;
    (testInfo as any)._startTime = Date.now();

    logger.info('Execution Mode', { mode: config.executionMode });

    await use(logger);

    const duration = Date.now() - (testInfo as any)._startTime;
    testInfo.attach('test-duration', {
      body: String(duration),
      contentType: 'text/plain',
    });

    logger.info('Test duration recorded', { duration });
  },

  // ---------------------------------------------------------------------------
  // Fixed metadata
  // ---------------------------------------------------------------------------
  metadata: async ({ }, use) => {
    const metadata = generateMetadata({
      product: 'OTHER',
      owner: 'automation',
      risk: 'Medium',
      type: 'E2E',
      criticalWorkflow: false,
      tags: []
    });
    await use(metadata);
  },

  // ---------------------------------------------------------------------------
  // Extract testId
  // ---------------------------------------------------------------------------
  testId: async ({ }, use: (id: string) => Promise<void>, testInfo: TestInfo) => {
    const id = extractTestId(testInfo.title);
    (testInfo as any)._meta = (testInfo as any)._meta || {};
    (testInfo as any)._meta.testId = id;

    await use(id);
  },

  // ---------------------------------------------------------------------------
  // testData
  // ---------------------------------------------------------------------------
  testData: async ({ testId }: { testId: string }, use: (data: Record<string, any>) => Promise<void>) => {
    const env = process.env.ENV || 'qa';
    const merged = loadTestData(testId, env);
    await use(merged);
  },

  // ---------------------------------------------------------------------------
  // page fixture (backed by authPage when authManager is enabled)
  // ---------------------------------------------------------------------------
  page: async ({ authManager, browser, authPage }, use) => {

    if (authManager?.isDisabled) {
      (globalThis as any).__TEST_LOGGER__?.info('[page] AuthManager disabled → using CLEAN page');
      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      await use(page);
      try { await ctx.close(); } catch { }
      return;
    }

    (globalThis as any).__TEST_LOGGER__?.info('[page] AuthManager enabled → using AUTHENTICATED page');

    await use(authPage);
  },

  // ---------------------------------------------------------------------------
  // runPreChecks
  // ---------------------------------------------------------------------------
  runPreChecks: async ({ page, logger }, use: (fn: () => Promise<void>) => Promise<void>, testInfo: TestInfo) => {
    await use(async () => {
      logger.info('Pre-checks started');

      await waitForNetworkIdle(page, 250, 15_000);

      const env = await runEnvHealthChecks(page);
      const unhealthy = env.filter((e: any) => !e.ok);

      if (unhealthy.length > 0) {
        testInfo.attach('env.check', {
          body: JSON.stringify(env, null, 2),
          contentType: 'application/json'
        });
        throw new Error('Environment health checks failed');
      }

      const dod = await runDoDChecks(page, testInfo, { locale: 'en-US', capturePerf: false });

      testInfo.attach('dod.check', {
        body: JSON.stringify(dod, null, 2),
        contentType: 'application/json'
      });

      if (!dod.passed) {
        throw new Error('DoD checks failed');
      }

      logger.info('Pre-checks passed');
    });
  },

  // ---------------------------------------------------------------------------
  // authManager (worker-scoped)
  // ---------------------------------------------------------------------------
  authManager: [
    async ({ browser }, use) => {
      // Always create an AuthManager instance and publish it globally so other fixtures
      // never see `null` even if prewarm fails.
      const am = new AuthManager();
      (globalThis as any).__AUTH_MANAGER__ = am;

      // Log startup status
      (globalThis as any).__TEST_LOGGER__?.info(`[AuthManager] Initialized in ${am.isDisabled ? 'DISABLED' : 'ENABLED'} mode`);

      // Prewarm — but do not let prewarm failure kill the fixture creation.
      try {
        if (!am.isDisabled) {
          (globalThis as any).__TEST_LOGGER__?.info('[AuthManager] Prewarming roles (ENABLED mode)');
          await am.prewarmRolesWithContexts(browser, ['recruiter', 'admin']);
        } else {
          (globalThis as any).__TEST_LOGGER__?.info('[AuthManager] Skipping prewarm (DISABLED mode)');
        }

        (globalThis as any).__TEST_LOGGER__?.info('[AuthManager] Prewarm completed (or nothing to prewarm)');
      } catch (err) {
        (globalThis as any).__TEST_LOGGER__?.warn('[AuthManager] Prewarm failed but continuing with AuthManager instance', { err: String(err) });
      }

      // Provide the manager to tests — teardown happens in finally
      try {
        await use(am);
      } finally {
        // Worker-scoped teardown: clear cached contexts (best-effort)
        try {
          (globalThis as any).__TEST_LOGGER__?.info('[AuthManager] Worker teardown — clearing cached contexts');
          await am.clearCachedContexts();
        } catch (err) {
          (globalThis as any).__TEST_LOGGER__?.warn('[AuthManager] clearCachedContexts failed during worker teardown', { err: String(err) });
        }
        // remove global ref
        try { delete (globalThis as any).__AUTH_MANAGER__; } catch { }
      }
    },
    { scope: 'worker' },
  ],

  // ---------------------------------------------------------------------------
  // authPage
  // ---------------------------------------------------------------------------
  authPage: async ({ browser, authManager }, use) => {
    const logger = (globalThis as any).__TEST_LOGGER__;

    // If authManager disabled — create fresh context/page (and attach TabManager)
    if (authManager?.isDisabled) {
      logger?.info('[authPage] AuthManager DISABLED — creating fresh unauthenticated page');

      const ctx = await browser.newContext();
      const page = await ctx.newPage();

      // Ensure TabManager exists and listens to this context early
      try {
        const existing = (globalThis as any).__TAB_MANAGER__ as TabManager | undefined;
        if (existing) {
          existing.addContext(ctx);
          existing.registerMain(page, 'Main Tab');
          logger?.info('[authPage] Reused existing TabManager for unauthenticated page');
        } else {
          const tm = new TabManager(ctx);
          tm.registerMain(page, 'Main Tab');
          (globalThis as any).__TAB_MANAGER__ = tm;
          logger?.info('[authPage] Created TabManager for unauthenticated page');
        }
      } catch (err) {
        logger?.warn('[authPage] TabManager attach failed for unauthenticated page', { err: String(err) });
      }

      await use(page);
      try { await ctx.close(); } catch { }
      return;
    }

    // Defensive: ensure we have an AuthManager reference (fall back to global if missing)
    const am = authManager ?? (globalThis as any).__AUTH_MANAGER__ as AuthManager | undefined;

    if (!am) {
      // Fallback plan: if authManager truly missing, create a plain page so tests don't crash
      logger?.warn('[authPage] authManager missing — falling back to a fresh page to avoid test failure');
      const ctx = await browser.newContext();
      const page = await ctx.newPage();

      try {
        const existing = (globalThis as any).__TAB_MANAGER__ as TabManager | undefined;
        if (existing) {
          existing.addContext(ctx);
          existing.registerMain(page, 'Main Tab');
          logger?.info('[authPage] Reused existing TabManager (fallback)');
        } else {
          const tm = new TabManager(ctx);
          tm.registerMain(page, 'Main Tab');
          (globalThis as any).__TAB_MANAGER__ = tm;
          logger?.info('[authPage] Created TabManager (fallback)');
        }
      } catch (err) {
        logger?.warn('[authPage] TabManager attach failed (fallback)', { err: String(err) });
      }

      await use(page);
      try { await ctx.close(); } catch { }
      return;
    }

    // Normal path: attempt to get cached authenticated page for recruiter
    logger?.info('[authPage] AuthManager ENABLED — requesting cached authenticated page');

    let result: { context: BrowserContext; page: Page; cached?: boolean } | undefined;
    try {
      result = await am.getCachedPageForRole(browser, 'recruiter').catch(err => { throw err; });
      logger?.info(`[authPage] Authenticated page resolved (cached=${Boolean(result?.cached)})`);
    } catch (err) {
      logger?.warn('[authPage] getCachedPageForRole failed — falling back to fresh authenticated-like page', { err: String(err) });
      // Fallback: create new context and return plain page so tests can continue
      try {
        const ctx = await browser.newContext({ storageState: undefined });
        const page = await ctx.newPage();
        // attach tab manager
        try {
          const existing = (globalThis as any).__TAB_MANAGER__ as TabManager | undefined;
          if (existing) {
            existing.addContext(ctx);
            existing.registerMain(page, 'Main Tab');
            logger?.info('[authPage] Reused existing TabManager after fallback creation');
          } else {
            const tm = new TabManager(ctx);
            tm.registerMain(page, 'Main Tab');
            (globalThis as any).__TAB_MANAGER__ = tm;
            logger?.info('[authPage] Created TabManager after fallback creation');
          }
        } catch (err2) {
          logger?.warn('[authPage] TabManager attach failed after fallback creation', { err: String(err2) });
        }

        await use(page);
        try { await ctx.close(); } catch { }
        return;
      } catch (err2) {
        logger?.error('[authPage] Fallback creation failed — cannot provide authPage', { err: String(err2) });
        throw err2;
      }
    }

    // Attach TabManager to this context NOW (so listeners exist before any further pages)
    try {
      const context = result!.context;
      const page = result!.page;
      const cached = !!result!.cached;

      const existing = (globalThis as any).__TAB_MANAGER__ as TabManager | undefined;
      if (existing) {
        existing.addContext(context);
        try { existing.registerMain(page, 'Main Tab'); } catch { /* may already be registered */ }

        logger?.info('[authPage] Reused existing TabManager — Main Tab registered');
      } else {
        const tm = new TabManager(context);
        tm.registerMain(page, 'Main Tab');
        (globalThis as any).__TAB_MANAGER__ = tm;

        logger?.info('[authPage] New TabManager created — Main Tab registered');
      }

      // Annotate what we are returning
      logger?.info('[authPage] Providing authenticated page to test', {
        cached,
        url: page.url?.() ?? '(unknown)'
      });

      await use(page);
    } catch (err) {
      logger?.warn('[authPage] TabManager setup failed', { err: String(err) });
      // still try to provide the page if possible
      try {
        await use(result!.page);
      } catch (uerr) {
        throw uerr;
      }
    }
  },


  // ---------------------------------------------------------------------------
  // rolePage
  // ---------------------------------------------------------------------------
  rolePage: async ({ browser, authManager }, use, testInfo) => {
    if (authManager?.isDisabled) {
      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      await use(page);
      try { await ctx.close(); } catch { }
      return;
    }

    const roleAnn = testInfo.annotations.find(a => a.type === 'role');
    const freshAnn = testInfo.annotations.find(a => a.type === 'freshRole');
    const role = roleAnn?.description || 'recruiter';
    const fresh = !!freshAnn;

    let result;
    try {
      result = await authManager.getCachedPageForRole(browser, role, { fresh });
    } catch (err) {
      (globalThis as any).__TEST_LOGGER__?.warn('[rolePage] getCachedPageForRole failed — falling back to new context', { err: String(err) });
      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      await use(page);
      try { await ctx.close(); } catch { }
      return;
    }

    const ctx = result.context;
    const page = result.page;

    // Attach the role context to TabManager so popups from role contexts are captured
    try {
      const existing = (globalThis as any).__TAB_MANAGER__ as TabManager | undefined;
      if (existing) existing.addContext(ctx);
    } catch { }

    await use(page);

    if (!result.cached) {
      try { await ctx.close(); } catch { }
    }
  },

  // ---------------------------------------------------------------------------
  // tabs
  // ---------------------------------------------------------------------------
  tabs: async ({ authPage }, use) => {
    // If authPage already created and it set up a global TabManager, reuse it.
    const existing = (globalThis as any).__TAB_MANAGER__ as TabManager | undefined;
    if (existing) {
      await use(existing);
      // cleanup handled by the TabManager instance created earlier in authPage
      return;
    }

    // Fallback: create a TabManager from authPage.context()
    const ctx = authPage.context();
    const tabManager = new TabManager(ctx);
    tabManager.registerMain(authPage, 'Main Tab');
    (globalThis as any).__TAB_MANAGER__ = tabManager;

    await use(tabManager);

    await test.step('[Cleanup] Closing test-scoped tabs', async () => {
      try { await tabManager.cleanupTabs('Main Tab'); } catch { }
    });

    delete (globalThis as any).__TAB_MANAGER__;
  },

  // ---------------------------------------------------------------------------
  // NEW: apiClient fixture (per-test)
  // ---------------------------------------------------------------------------
  apiClient: async ({ logger }, use, testInfo) => {
    // base URL from env or config
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3000';
    const client = new ApiClient(baseUrl, logger);

    // Expose client to test
    await use(client);

    // Ensure we dispose the request context after the test completes
    try {
      client.dispose();
    } catch (err) {
      logger.error('[apiClient] dispose failed', { err });
    }
  },

  // ---------------------------------------------------------------------------
  // BaseTest wrapper — pass correct page to BaseTest
  // ---------------------------------------------------------------------------
  baseTest: async (
    { page, logger, tabs, authManager, browser, testId, testData, apiClient, authPage },
    use: (b: BaseTest) => Promise<void>,
    testInfo: TestInfo
  ) => {
    // If authManager is disabled we use the plain page fixture.
    // Otherwise use the authenticated page so BaseTest.page and TabManager are consistent.
    const mainPage = authManager?.isDisabled ? page : authPage;

    // Ensure TabManager is aware of the authPage context (defensive)
    try { tabs.addContext?.(mainPage.context()); } catch { }

    const base = new BaseTest(
      mainPage,
      logger,
      tabs,
      { authManager, browser, testId, testData, testInfo, apiClient }
    );

    await use(base);
    
    // Automatic cleanup of all registered dispose functions
    try {
      await base.cleanup();
    } catch (err) {
      logger.error('[baseTest] cleanup failed', { err });
    }
  },

});

// ---------------------------------------------------------------------------
// Evidence Collector — run ONLY ON FAILURE
// ---------------------------------------------------------------------------
test.afterEach(async ({ logger, tabs }, testInfo) => {
  const failed =
    testInfo.status === 'failed' ||
    testInfo.status === 'timedOut' ||
    testInfo.error;

  if (!failed) {
    logger?.info('[EvidenceCollector] Test passed — skipping evidence');
    return;
  }

  try {
    logger?.warn('[EvidenceCollector] Test failed — collecting evidence');

    const collector = new EvidenceCollector(logger);

    await collector.collect(testInfo, {
      tabManager: tabs,
      friendlyName: testInfo.title,
      zip: true
    });
  } catch (err) {
    logger?.error('[EvidenceCollector] Failed during evidence collection', { err });
  }
});

export { expect };

// src/utils/base-test.util.ts
import test, { Browser, Page, TestInfo } from '@playwright/test';
import { Logger } from '@src/utils/logger.util';
import { AuthManager } from '@src/utils/auth-manager.util';
import { ApiClient } from '@src/api/api-client';

import { assertThat } from '@src/utils/assert-generic.util';
import { softAssertions } from '@src/utils/assert-soft.util';

import { TabManager } from '@src/components/tab-manager.component';

export class BaseTest {
  readonly page: Page;
  readonly logger: Logger;
  readonly tabs: TabManager;
  readonly testData: any;
  readonly testId!: string;

  // expose api client if provided
  readonly api?: ApiClient;

  // Generic & soft assertions
  readonly assertThat = assertThat;
  readonly soft = softAssertions();

  private authManager?: AuthManager;
  private browser?: Browser;
  private _test;
  private _info;
  
  // Track dispose functions for automatic cleanup
  private _disposeQueue: Array<() => Promise<void>> = [];

  constructor(
    page: Page,
    logger: Logger,
    tabs: TabManager,
    opts?: {
      authManager?: AuthManager;
      browser?: Browser;
      testId?: string;
      testData?: any;
      testInfo?: TestInfo;
      testFn?: any;
      apiClient?: ApiClient; // <-- allow apiClient in options
    }
  ) {
    this.page = page;
    this.logger = logger;
    this.tabs = tabs;

    this.authManager = opts?.authManager;
    this.browser = opts?.browser;
    this.testData = opts?.testData ?? {};
    this._test = opts?.testFn;
    this._info = opts?.testInfo;

    // assign api client if present
    this.api = opts?.apiClient;

  }

  async section<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const stack = (new Error()).stack?.split("\n").slice(1, 6).join("\n");
    this.logger?.info('[BaseTest.section] START', {
      label,
      testTitle: this._info?.title ?? 'unknown',
      ts: Date.now(),
      stack
    });

    // Only use test.step when Playwright test runner is still active
    const canUseStep =
      this._info &&
      typeof (test as any).step === "function";

    try {
      let result: T;

      if (canUseStep) {
        result = await test.step(label, fn);
      } else {
        result = await fn();
      }

      this.logger?.info('[BaseTest.section] END', {
        label,
        ts: Date.now()
      });

      return result;

    } catch (err) {
      this.logger?.error('[BaseTest.section] ERROR', {
        label,
        ts: Date.now(),
        err: String(err)
      });
      throw err;

    } finally {
      this.logger?.debug('[BaseTest.section] FINALLY', {
        label,
        ts: Date.now()
      });
    }
  }

  async as(role: string, opts?: { fresh?: boolean }) {
  if (!this.authManager || !this.browser) {
    throw new Error(
      "BaseTest.as(role) requires AuthManager + Browser (injected by governance)."
    );
  }

  this.logger.info("[BaseTest] Creating role session", { role, opts });

  const { page, context, cached } =
    await this.authManager.getCachedPageForRole(
      this.browser,
      role,
      { fresh: opts?.fresh }
    );

  // Ensure TabManager watches this role's context (so popups are captured)
  try { this.tabs.addContext(context); } catch {}

  // Make this role page the active main tab for TabManager
  try { this.tabs.registerMain(page, `${role} Main Tab`); } catch {}

  const roleBase = new BaseTest(page, this.logger, this.tabs, {
    authManager: this.authManager,
    browser: this.browser
  });

  const dispose = async () => {
    if (cached) {
      await page.close().catch(() => { });
      this.logger.info("[BaseTest] Closed cached page", { role });
    } else {
      await context.close().catch(() => { });
      this.logger.info("[BaseTest] Closed fresh context", { role });
    }
  };
  
  // Register dispose function for automatic cleanup
  this.registerDispose(dispose);

  return { base: roleBase, dispose };
}

  /**
   * Register a dispose function for automatic cleanup at test end.
   * This is called automatically by as() but can also be used manually.
   */
  registerDispose(fn: () => Promise<void>): void {
    this._disposeQueue.push(fn);
  }

  /**
   * Clean up all registered dispose functions.
   * Called automatically by the governance layer's baseTest fixture teardown.
   * Uses best-effort cleanup: logs errors but continues with remaining disposals.
   */
  async cleanup(): Promise<void> {
    this.logger.info('[BaseTest.cleanup] Starting cleanup', { queueLength: this._disposeQueue.length });
    
    for (const dispose of this._disposeQueue) {
      try {
        await dispose();
      } catch (err) {
        this.logger.warn('[BaseTest.cleanup] Dispose function failed (continuing)', { err: String(err) });
      }
    }
    
    // Clear the queue after all attempts
    this._disposeQueue = [];
    this.logger.info('[BaseTest.cleanup] Cleanup complete');
  }


}

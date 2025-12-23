// src/utils/auth-manager.util.ts
import fs from 'fs';
import path from 'path';
import { Browser, BrowserContext, Page } from '@playwright/test';
import { randomUUID } from 'crypto';

import { config } from '@config/config';
import { Logger } from '@src/utils/logger.util';
import { retryWithBackoff } from '@src/utils/retry.util';
import { ATSLoginFlow } from '@src/flows/ats/common/ats.login.flow';

type RoleCredentials = { username: string; password: string };

export class AuthManager {
  public isDisabled?: boolean;

  private outDir: string;
  private loginRetries: number;
  private retryDelayMs: number;
  private postLoginTimeoutMs: number;

  private locks = new Map<string, Promise<void>>();
  private cachedContexts = new Map<string, BrowserContext>();
  private logger: Logger;

  constructor(opts?: {
  outDir?: string;
  loginRetries?: number;
  retryDelayMs?: number;
  postLoginTimeoutMs?: number;
}) {
  this.isDisabled = config.disableAuthManager === true;   // <-- FIX

  this.outDir = opts?.outDir ?? path.join(process.cwd(), 'test-results', 'auth-state');
  this.loginRetries = opts?.loginRetries ?? 3;
  this.retryDelayMs = opts?.retryDelayMs ?? 300;
  this.postLoginTimeoutMs = opts?.postLoginTimeoutMs ?? 15_000;

  this.logger =
    (globalThis as any).__TEST_LOGGER__ ??
    new Logger({
      testId: randomUUID(),
      testOutputDir: this.outDir,
      toConsole: true
    });

  if (!fs.existsSync(this.outDir)) fs.mkdirSync(this.outDir, { recursive: true });

  this.logger.info(
    `[AuthManager] Initialized in ${this.isDisabled ? 'DISABLED' : 'ENABLED'} mode`
  );
}

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  private storageFileNameForRole(role: string) {
    return path.join(this.outDir, `${role}-storage-${process.pid}.json`);
  }

  private lockKey(role: string) {
    return `${role}:${process.pid}`;
  }

  private async ensurePrimaryPage(ctx: BrowserContext): Promise<Page> {
    // Create a controlled primary page and close any stray about:blank pages.
    const page = await ctx.newPage();

    for (const p of ctx.pages()) {
      const url = p.url?.() ?? '';
      if (p !== page && url === 'about:blank') {
        try { await p.close(); } catch {}
      }
    }

    this.logger.info('[AuthManager] Ensured primary page in context');
    return page;
  }

  private async acquireLock(role: string, fn: () => Promise<void>) {
    const key = this.lockKey(role);
    if (this.locks.has(key)) {
      // wait for the other worker/operation to finish
      await this.locks.get(key);
      return;
    }

    const executing = (async () => {
      try {
        await fn();
      } finally {
        this.locks.delete(key);
      }
    })();

    this.locks.set(key, executing);
    await executing;
  }

  // ---------------------------------------------------------------------------
  // ensureAuthState
  // - Creates storageState for role if missing
  // - Uses ATSLoginFlow.login(...) to perform the login
  // - Validates the saved state before returning
  // ---------------------------------------------------------------------------
  async ensureAuthState(browser: Browser, role: string, credsOverride?: RoleCredentials): Promise<string> {
    const stateFile = this.storageFileNameForRole(role);

    // If state already exists return immediately
    if (fs.existsSync(stateFile)) {
      this.logger.info(`[AuthManager] Using existing auth state for '${role}' → ${stateFile}`);
      return stateFile;
    }

    this.logger.info(`[AuthManager] No saved state for '${role}', creating...`);

    await this.acquireLock(role, async () => {
      // double-check inside lock
      if (fs.existsSync(stateFile)) {
        this.logger.info(`[AuthManager] State created by another worker for '${role}'`);
        return;
      }

      const creds = credsOverride ?? this.resolveCredentialsForRole(role);
      if (!creds) throw new Error(`No credentials available for role '${role}'`);

      await retryWithBackoff(
        async () => {
          const ctx = await browser.newContext();
          let page: Page | null = null;

          try {
            page = await this.ensurePrimaryPage(ctx);

            // Delegate login to reusable LoginFlow
            const flow = new ATSLoginFlow(page, this.logger);
            const result = await flow.login(creds, role);

            if (!result.success) {
              // LoginFlow already captured debug artifacts. Bubble up to retry logic.
              this.logger.warn(`[AuthManager] LoginFlow returned failure for '${role}': ${result.error}`);
              throw new Error(result.error ?? 'LoginFlow failed');
            }

            // Save storage state and validate it
            await ctx.storageState({ path: stateFile });
            this.logger.info(`[AuthManager] Storage state saved for '${role}' → ${stateFile}`);

            await this.validateState(browser, stateFile, role);
          } finally {
            // Close the temporary context used for creating the state to avoid leaks
            try {
              for (const p of ctx.pages()) { await p.close().catch(() => {}); }
              await ctx.close().catch(() => {});
            } catch {}
          }
        },
        this.loginRetries,
        this.retryDelayMs,
        (err, attempt) => {
          this.logger.warn(`[AuthManager] Login attempt ${attempt} failed for '${role}'`, { error: String(err) });
        }
      );
    });

    return stateFile;
  }

  // ---------------------------------------------------------------------------
  // validateState
  // - ensures the saved storageState actually logs into the app
  // - if validation fails the state file is removed so subsequent calls re-create it
  // ---------------------------------------------------------------------------
  private async validateState(browser: Browser, stateFile: string, role: string) {
    this.logger.info(`[AuthManager] Validating stored auth state for '${role}'`);

    const vCtx = await browser.newContext({ storageState: stateFile });
    try {
      const vPage = await this.ensurePrimaryPage(vCtx);

      await vPage.goto(config.appBaseUrl, { waitUntil: 'networkidle', timeout: 8000 }).catch(() => {});

      const selectors = [
        '[data-testid="nav-app-bar"]',
        '[data-testid="app-root"]',
        '#navigatorUserMenu'
      ];

      for (const sel of selectors) {
        const ok = await vPage.locator(sel).first().waitFor({ timeout: 3000 }).then(() => true).catch(() => false);
        if (ok) {
          this.logger.info(`[AuthManager] State validated successfully for '${role}'`);
          return;
        }
      }

      // Not valid — remove and throw so retry logic recreates it
      try { fs.unlinkSync(stateFile); } catch {}
      throw new Error(`[AuthManager] Invalid storageState for role '${role}'`);
    } finally {
      try {
        for (const p of vCtx.pages()) await p.close().catch(() => {});
        await vCtx.close().catch(() => {});
      } catch {}
    }
  }

  // ---------------------------------------------------------------------------
  // getContextForRole / getPageForRole
  // ---------------------------------------------------------------------------
  async getContextForRole(
    browser: Browser,
    role: string,
    creds?: RoleCredentials,
    opts?: { viewport?: { width: number; height: number } }
  ): Promise<BrowserContext> {
    const stateFile = await this.ensureAuthState(browser, role, creds);
    const ctx = await browser.newContext({
      storageState: stateFile,
      viewport: opts?.viewport
    });

    // Ensure primary page exists
    try { await this.ensurePrimaryPage(ctx); } catch {}

    this.logger.info(`[AuthManager] Created context for '${role}' using ${stateFile}`);
    return ctx;
  }

  async getPageForRole(
    browser: Browser,
    role: string,
    creds?: RoleCredentials,
    opts?: { viewport?: { width: number; height: number } }
  ): Promise<{ page: Page; context: BrowserContext }> {
    const ctx = await this.getContextForRole(browser, role, creds, opts);
    // Prefer an existing non-blank page
    let page = ctx.pages().find(p => (p.url?.() ?? '') !== 'about:blank');
    if (!page) page = await ctx.newPage();
    this.logger.info(`[AuthManager] getPageForRole created page/context for '${role}'`);
    return { page, context: ctx };
  }

  // ---------------------------------------------------------------------------
  // getCachedPageForRole
  // - returns cached context/page if available (unless opts.fresh)
  // - otherwise creates a new context/page
  // ---------------------------------------------------------------------------
  async getCachedPageForRole(
    browser: Browser,
    role: string,
    opts?: { fresh?: boolean; viewport?: { width: number; height: number } }
  ): Promise<{ page: Page; context: BrowserContext; cached: boolean }> {
    // Use cached if present unless fresh requested
    if (!opts?.fresh && this.cachedContexts.has(role)) {
      const ctx = this.cachedContexts.get(role)!;
      this.logger.info(`[AuthManager] Returning CACHED authenticated context for role '${role}'`);
      try {
        // pick a non-blank page or create one
        let page = ctx.pages().find(p => (p.url?.() ?? '') !== 'about:blank');
        if (!page) page = await ctx.newPage();

        // ensure page is on app root so consumers see an app page
        const url = page.url?.() ?? '';
        if (!url || url === 'about:blank') {
          await page.goto(config.appBaseUrl, { waitUntil: 'networkidle' }).catch(() => {});
        }

        return { page, context: ctx, cached: true };
      } catch (err) {
        this.logger.warn(`[AuthManager] Cached context for '${role}' appears broken, recreating`, { err: String(err) });
        try { for (const p of ctx.pages()) await p.close().catch(() => {}); await ctx.close().catch(() => {}); } catch {}
        this.cachedContexts.delete(role);
      }
    }

    // fallback: create fresh
    const fresh = await this.getPageForRole(browser, role, undefined, { viewport: opts?.viewport });
    return { ...fresh, cached: false };
  }

  // ---------------------------------------------------------------------------
  // prewarmRolesWithContexts
  // - create contexts for roles and cache them for reuse
  // ---------------------------------------------------------------------------
  async prewarmRolesWithContexts(
  browser: Browser,
  roles: string[],
  credsMap?: Record<string, RoleCredentials>,
  opts?: { viewport?: { width: number; height: number } }
) {
  if (this.isDisabled) {
    this.logger.info('[AuthManager] Skipping prewarm — AuthManager is DISABLED');
    return;
  }

  for (const role of roles) {
    try {
      this.logger.info(`[AuthManager] Prewarming role '${role}'`);
      await this.ensureAuthState(browser, role, credsMap?.[role]);

      const stateFile = this.storageFileNameForRole(role);
      const ctx = await browser.newContext({ storageState: stateFile, viewport: opts?.viewport });

      await this.ensurePrimaryPage(ctx);
      this.cachedContexts.set(role, ctx);

      this.logger.info(`[AuthManager] Prewarmed and cached context for '${role}'`);
    } catch (err) {
      this.logger.warn(`[AuthManager] Failed to prewarm '${role}'`, { error: String(err) });
    }
  }
}

  // ---------------------------------------------------------------------------
  // clearCachedContexts
  // ---------------------------------------------------------------------------
  async clearCachedContexts() {
    for (const [role, ctx] of this.cachedContexts.entries()) {
      this.logger.info(`[AuthManager] Closing cached context for '${role}'`);
      try {
        for (const p of ctx.pages()) await p.close().catch(() => {});
        await ctx.close().catch(() => {});
      } catch (err) {
        this.logger.warn(`[AuthManager] Error closing cached context for '${role}'`, { error: String(err) });
      }
    }
    this.cachedContexts.clear();
  }

  // ---------------------------------------------------------------------------
  // resolveCredentialsForRole
  // ---------------------------------------------------------------------------
  public resolveCredentialsForRole(role: string): RoleCredentials | undefined {
    try {
      const secrets = config?.secrets;
      if (secrets?.ats?.roleCredentials?.[role]) {
        return secrets.ats.roleCredentials[role] as RoleCredentials;
      }

      const u = process.env[`${role.toUpperCase()}_USER`];
      const p = process.env[`${role.toUpperCase()}_PASS`];
      if (u && p) return { username: u, password: p };

      // last resort try generic keys
      if (secrets?.adminUser && secrets?.adminPass) return { username: secrets.adminUser, password: secrets.adminPass };

      return undefined;
    } catch {
      return undefined;
    }
  }

  // ---------------------------------------------------------------------------
  // clearStoredStates
  // ---------------------------------------------------------------------------
  clearStoredStates() {
    try {
      const files = fs.readdirSync(this.outDir);
      for (const f of files) {
        if (f.includes('-storage-')) {
          try { fs.unlinkSync(path.join(this.outDir, f)); } catch {}
        }
      }
      this.logger.info('[AuthManager] Cleared stored auth states');
    } catch (err) {
      this.logger.warn('[AuthManager] clearStoredStates failed', { err: String(err) });
    }
  }
}

import { BrowserContext, Page, test } from '@playwright/test';
import { Logger } from '@src/utils/logger.util';

interface TabOptions {
  annotate?: boolean;
  timeout?: number;
}

export class TabManager {
  private rootContext: BrowserContext;      // <── FIX #1: store primary context
  private contexts = new Set<BrowserContext>();
  private tabs = new Map<string, Page>();
  private activeTabName = '';
  private autoCounter = 1;
  private logger: Logger;

  constructor(initialContext: BrowserContext) {
    this.logger = (globalThis as any).__TEST_LOGGER__;
    this.rootContext = initialContext;      // <── FIX #2: assign primary context
    this.addContext(initialContext);
  }

  // ===========================================================================
  // CONTEXT MANAGEMENT
  // ===========================================================================

  addContext(ctx: BrowserContext) {
    if (this.contexts.has(ctx)) return;
    this.contexts.add(ctx);

    ctx.on('page', async (page: Page) => {
      try {
        const opener = await page.opener().catch(() => null);
        const isPopup = !!opener;

        const name = isPopup
          ? `Popup #${this.autoCounter++}`
          : `Tab #${this.autoCounter++}`;

        this.logger?.info(
          `[TabManager] Auto detected ${isPopup ? 'popup' : 'tab'}: '${name}'`
        );

        await this.waitForPageFullyLoaded(page);
        this.tabs.set(name, page);
        this.activeTabName = name;
        this.attachCloseListener(page, name);
      } catch (err) {
        this.logger?.warn(`[TabManager] ctx.on('page') handler failed: ${err}`);
      }
    });
  }

  // ===========================================================================
  // MAIN TAB REGISTRATION
  // ===========================================================================

  registerMain(page: Page, name = 'Main Tab') {
    this.tabs.set(name, page);
    this.activeTabName = name;
    this.addContext(page.context());
    this.attachCloseListener(page, name);

    this.logger?.info(`[TabManager] Registered main tab '${name}'`);
  }

  // ===========================================================================
  // INTERNAL HELPERS
  // ===========================================================================

  private async autoNameFor(page: Page) {
    const title = await page.title().catch(() => '').then(t => t.trim());
    if (title) return title;

    const last = page.url().split('/').pop();
    if (last) return last;

    return `Tab #${this.autoCounter++}`;
  }

  private async waitForPageFullyLoaded(page: Page) {
    await page.waitForLoadState('domcontentloaded').catch(() => { });
    await page.waitForLoadState('load').catch(() => { });
    await page.waitForLoadState('networkidle').catch(() => { });
  }

  private attachCloseListener(page: Page, name: string) {
    page.on('close', () => {
      if (this.tabs.get(name) === page) {
        this.logger?.warn(`[TabManager] Tab '${name}' closed`);
        this.tabs.delete(name);

        const remaining = [...this.tabs.keys()];
        this.activeTabName = remaining[0] ?? '';
      }
    });
  }

  private ensureValidTab(name: string): Page {
    if (!name) throw new Error(`[TabManager] No active tab set`);

    const page = this.tabs.get(name);
    if (!page) throw new Error(`[TabManager] Tab '${name}' does not exist`);

    if (page.isClosed()) {
      this.logger?.warn(`[TabManager] '${name}' is closed, recovering…`);
      this.tabs.delete(name);

      const remaining = [...this.tabs.values()];
      if (remaining.length === 0)
        throw new Error(`[TabManager] No open tabs remain`);

      const first = [...this.tabs.keys()][0];
      this.activeTabName = first;
      return remaining[0];
    }

    return page;
  }

  /**
 * Wait for a NEW TAB (context-level page event)
 * Not a popup — this handles <a target="_blank"> and JS opened tabs.
 */
  async waitForNewTab(name?: string, options?: TabOptions): Promise<Page> {
    const timeout = options?.timeout ?? 20000;
    const annotate = options?.annotate ?? true;

    const label = name
      ? `Wait For New Tab: ${name}`
      : `Wait For New Tab (auto)`;

    const logic = async () => {
      this.logger?.info(`[TabManager] Waiting for NEW TAB across all contexts`);

      const newPage = await Promise.race<Page | null>([
        ...[...this.contexts].map(ctx =>
          ctx.waitForEvent('page', { timeout }).catch(() => null)
        ),
        new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), timeout)
        )
      ]);

      if (!newPage) {
        throw new Error(
          `Timed out waiting for NEW TAB '${name ?? 'auto'}' after ${timeout}ms`
        );
      }

      await this.waitForPageFullyLoaded(newPage);

      const finalName = name ?? (await this.autoNameFor(newPage));
      this.tabs.set(finalName, newPage);
      this.activeTabName = finalName;

      this.attachCloseListener(newPage, finalName);

      this.logger?.info(`[TabManager] Registered NEW TAB as '${finalName}'`);

      return newPage;
    };

    return annotate ? test.step(label, logic) : logic();
  }

  /**
   * Open a NEW TAB caused by clicking a locator.
   * Does NOT rely on popup events — listens to context-level page creation.
   */
  async openTabByClick(
    clickedPage: Page,
    locator: { click: (...args: any[]) => Promise<any> },
    name?: string,
    options?: TabOptions
  ): Promise<Page> {

    const timeout = options?.timeout ?? 20000;
    const annotate = options?.annotate ?? true;

    const label = name
      ? `Open Tab By Click: ${name}`
      : `Open Tab By Click (auto)`;

    const logic = async () => {

      // Debug: help identify correct page
      try {
        this.logger?.info(`[TabManager] openTabByClick: clickedPage=${await clickedPage.url()}`);
      } catch { }

      const tabPromise = Promise.race<Page | null>([
        ...[...this.contexts].map(ctx =>
          ctx.waitForEvent('page', { timeout }).catch(() => null)
        ),
        new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), timeout)
        )
      ]);

      // Perform the user-triggered click
      await locator.click();

      const newTab = await tabPromise;

      if (!newTab) {
        throw new Error(`Timed out waiting for NEW TAB after click`);
      }

      await this.waitForPageFullyLoaded(newTab);

      const finalName = name ?? (await this.autoNameFor(newTab));

      this.tabs.set(finalName, newTab);
      this.activeTabName = finalName;

      this.attachCloseListener(newTab, finalName);

      this.logger?.info(`[TabManager] Registered tab opened by click -> '${finalName}'`);

      return newTab;
    };

    return annotate ? test.step(label, logic) : logic();
  }

  // ===========================================================================
  // POPUP HANDLING (CLICK POPUP)
  // ===========================================================================

  async waitForPopup(name?: string, options?: TabOptions): Promise<Page> {
    const annotate = options?.annotate ?? true;
    const timeout = options?.timeout ?? 15000;

    const label = name
      ? `Wait For Popup: ${name}`
      : `Wait For Popup (auto)`;

    const logic = async () => {

      // 🔥 Always listen on opener (main tab), not active tab
      const opener = this.openerPage(this.rootContext);   // <── FIX #3

      this.logger?.info(
        `[TabManager] Waiting for popup from opener page (root context)`
      );

      const popup = await opener.waitForEvent('popup', { timeout });

      await this.waitForPageFullyLoaded(popup);

      const finalName = name || (await this.autoNameFor(popup));

      this.tabs.set(finalName, popup);
      this.activeTabName = finalName;

      this.attachCloseListener(popup, finalName);

      this.logger?.info(`[TabManager] Registered popup as '${finalName}'`);
      return popup;
    };

    return annotate ? test.step(label, logic) : logic();
  }

  /**
   * Open popup by clicking a locator on a known page.
   * clickedPage: Page that will perform the click (top-level page containing iframe).
   * locator: Locator or Playground locator-like object with .click()
   */
  async openPopupByClick(
    clickedPage: Page,
    locator: { click: (...args: any[]) => Promise<any> },
    name?: string,
    options?: TabOptions
  ): Promise<Page> {
    const timeout = options?.timeout ?? 20000;
    const annotate = options?.annotate ?? true;

    const logic = async () => {
      // debug: log clickedPage identity
      try {
        this.logger?.info(`[TabManager] openPopupByClick: clickedPage.url=${await clickedPage.url()}`);
        this.logger?.info(`[TabManager] openPopupByClick: clickedPage.title=${await clickedPage.title()}`);
      } catch { /* ignore */ }

      // 1) Try listening for popup event on the page that executes the click
      const popupPromise = clickedPage.waitForEvent('popup', { timeout }).catch(() => null);

      // Perform click
      await locator.click();

      const popup = await popupPromise;

      if (popup) {
        // Good — popup emitted on clickedPage
        await this.waitForPageFullyLoaded(popup);
        const finalName = name ?? (await this.autoNameFor(popup));
        this.tabs.set(finalName, popup);
        this.activeTabName = finalName;
        this.attachCloseListener(popup, finalName);
        this.logger?.info(`[TabManager] Popup opened by click on clickedPage -> '${finalName}'`);
        return popup;
      }

      // 2) Fallback: wait for any new page on any tracked context (covers target=_blank, redirects, etc.)
      this.logger?.warn('[TabManager] Popup not detected on clickedPage — falling back to context-level detection');

      const fallbackPromise = Promise.race([
        ...[...this.contexts].map((ctx) => ctx.waitForEvent('page', { timeout }).catch(() => null)),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), timeout))
      ]);

      const newPage = await fallbackPromise;
      if (!newPage) throw new Error(`No popup/new tab detected after click (fallback timed out)`);

      await this.waitForPageFullyLoaded(newPage);
      const finalName2 = name ?? (await this.autoNameFor(newPage));
      this.tabs.set(finalName2, newPage);
      this.activeTabName = finalName2;
      this.attachCloseListener(newPage, finalName2);
      this.logger?.info(`[TabManager] Popup/new-tab detected via fallback -> '${finalName2}'`);
      return newPage;
    };

    return annotate ? test.step(`Open Popup By Click: ${name ?? 'auto'}`, logic) : logic();
  }

  debugState() {
    this.logger?.info('[TabManager] State dump', {
      activeTabName: this.activeTabName,
      tabs: [...this.tabs.entries()].map(([n, p]) => ({ n, url: p.url?.() ?? 'closed' })),
      contexts: [...this.contexts].map((c, i) => ({ idx: i, pages: c.pages().map(p => p.url?.() ?? '') }))
    });
  }


  // ===========================================================================
  // AUTO POPUP (window.open WITHOUT CLICK)
  // ===========================================================================

  async waitForAutoPopup(name?: string, options?: TabOptions) {
    const timeout = options?.timeout ?? 20000;
    const annotate = options?.annotate ?? true;

    const logic = async () => {
      const popup = await Promise.race(
        [...this.contexts].map(ctx =>
          ctx.waitForEvent('page') as Promise<Page>
        ).concat([
          new Promise<never>((_, r) =>
            setTimeout(
              () => r(new Error(`Timed out waiting for auto popup`)),
              timeout
            )
          )
        ])
      );

      await this.waitForPageFullyLoaded(popup);

      const finalName = name ?? (await this.autoNameFor(popup));
      this.tabs.set(finalName, popup);
      this.activeTabName = finalName;

      this.attachCloseListener(popup, finalName);
      return popup;
    };

    return annotate ? test.step(`Wait For Auto Popup`, logic) : logic();
  }

  // ===========================================================================
  // SWITCHING
  // ===========================================================================

  async switchTo(name: string, options?: TabOptions) {
    const annotate = options?.annotate ?? true;

    const logic = async () => {
      this.ensureValidTab(name);
      this.activeTabName = name;
    };

    return annotate ? test.step(`Switch To Tab`, logic) : logic();
  }

  async switchToIndex(index: number, options?: TabOptions) {
    const annotate = options?.annotate ?? true;

    const logic = async () => {
      const names = [...this.tabs.keys()];
      if (index < 0 || index >= names.length)
        throw new Error(`Invalid tab index '${index}'`);

      const name = names[index];
      this.ensureValidTab(name);
      this.activeTabName = name;
    };

    return annotate ? test.step(`Switch To Tab Index`, logic) : logic();
  }

  async withPopup(name: string, fn: (page: Page) => Promise<void>) {
    const popup = await this.waitForPopup(name);
    try {
      return await fn(popup);
    } finally {
      await this.close(name);
      await this.switchTo('Main Tab');
    }
  }

  /** Returns the page that should receive popup events */
  private openerPage(ctx: BrowserContext): Page {
    // Always prefer Main Tab
    const main = this.tabs.get("Main Tab");
    if (main && !main.isClosed()) return main;

    // Fallback: first non-closed page
    const all = ctx.pages().filter(p => !p.isClosed());
    if (all.length === 0) throw new Error(`No pages found in context`);
    return all[0];
  }

  // ===========================================================================
  // CLOSE
  // ===========================================================================

  async close(name: string, options?: TabOptions) {
    const annotate = options?.annotate ?? true;

    const logic = async () => {
      const page = this.ensureValidTab(name);
      await page.close().catch(() => { });
      this.tabs.delete(name);

      const remaining = [...this.tabs.keys()];
      this.activeTabName = remaining[0] ?? '';
    };

    return annotate ? test.step(`Close Tab`, logic) : logic();
  }

  async closeCurrent(options?: TabOptions) {
    return this.close(this.activeTabName, options);
  }

  // ===========================================================================
  // ACCESSORS
  // ===========================================================================

  get current(): Page {
    return this.ensureValidTab(this.activeTabName);
  }

  listTabs() {
    return [...this.tabs.keys()];
  }

  // ===========================================================================
  // PAGE OBJECT FACTORY
  // ===========================================================================

  as<T>(Ctor: new (page: Page, ...args: any[]) => T, tabName?: string, ...extra: any[]) {
    const name = tabName ?? this.activeTabName;
    const page = this.ensureValidTab(name);
    return new Ctor(page, ...extra);
  }

  // ===========================================================================
  // CLEANUP
  // ===========================================================================

  async cleanupTabs(main = 'Main Tab') {
    for (const [name, page] of this.tabs.entries()) {
      if (name === main) continue;
      if (!page.isClosed()) await page.close().catch(() => { });
      this.tabs.delete(name);
    }

    this.activeTabName = this.tabs.has(main)
      ? main
      : [...this.tabs.keys()][0] ?? '';
  }
}

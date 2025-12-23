// src/pages/base.page.ts
import { FrameLocator, Locator, Page, test } from '@playwright/test';
import { Logger } from '@src/utils/logger.util';
import { getExecutionProfile } from '@src/utils/execution-profile.util';


/**
 * BasePage
 *
 * - Automatically uses the main-body iframe when present (#main_body).
 * - Resolves string locators against the iframe root so page objects don't need to handle frames.
 * - Provides step/section wrappers for consistent reporting.
 */
export class BasePage {
  readonly page: Page;
  readonly root: Locator;
  readonly friendlyName: string;
  protected logger: Logger;
  protected frameLocator?: FrameLocator;

  constructor(page: Page, rootLocator: Locator | string, friendlyName = 'Page') {
    this.page = page;
    this.friendlyName = friendlyName;
    this.logger = (globalThis as any).__TEST_LOGGER__;

    // Attempt to use the common ATS iframe (#main_body). If it's not present,
    // FrameLocator still resolves locators when the frame later appears.
    try {
      this.frameLocator = this.page.frameLocator?.('#main_body');
    } catch {
      this.frameLocator = undefined;
    }

    // If caller passed a Locator, use it verbatim (it may already be frame-aware).
    if (typeof rootLocator !== 'string') {
      this.root = rootLocator;
    } else {
      // If we have a frameLocator, resolve string selectors against it. Otherwise resolve on page.
      this.root = this.frameLocator ? this.frameLocator.locator(rootLocator) : this.page.locator(rootLocator);
    }
  }

  // Expose the raw FrameLocator (useful when a flow wants to use frame-specific APIs)
  get frame() {
    return this.frameLocator;
  }

  /**
   * Page-level step annotation wrapper.
   * All page operations should be reported under the page friendly name.
   */
  async section(label: string, fn: () => Promise<void>) {
    await this.logger.section(`[${this.friendlyName}] ${label}`, fn);
  }

  async step(label: string, fn: () => Promise<void>) {
    await this.section(label, fn);
  }

  /**
   * Page visibility helpers (operate against the resolved root Locator).
   */
  async expectVisible(timeout = 5000) {
    await this.root.waitFor({ state: 'visible', timeout });
  }

  async expectHidden(timeout = 5000) {
    await this.root.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Default expectLoaded
   * - Pages may override, but flows/tests can safely call expectLoaded().
   */
  async expectLoaded(): Promise<void> {
    const { timeouts } = getExecutionProfile();

    await this.section(`${this.friendlyName} - expect loaded`, async () => {
      await this.root.waitFor({ state: 'attached', timeout: timeouts.pageLoad });
      await this.root.waitFor({ state: 'visible', timeout: timeouts.pageLoad });
    });
  }



  /**
   * Convenience goto: a small wrapper in-case we want common navigation handling.
   */
  async goto(url: string) {
    await this.page.goto(url,{
      waitUntil: 'domcontentloaded',
          timeout: 60000
        }).catch(() => {});
  }

  /**
   * Helper to resolve a selector to a Locator scoped to this page's root.
   * Accepts strings or Locator; useful when working with components that accept a Locator.
   */
resolveLocator(selectorOrLocator: string | Locator): Locator {
  if (typeof selectorOrLocator !== 'string') return selectorOrLocator;

  if (this.root) {
    const relative = this.root.locator(selectorOrLocator);
    return relative;
  }

  if (this.frameLocator) {
    return this.frameLocator.locator(selectorOrLocator);
  }

  return this.page.locator(selectorOrLocator);
}


  enterFrame(name: string) {
    return this.page.frameLocator(`iframe[name="${name}"]`);
  }

}

import { Locator, Page, expect, test } from '@playwright/test';
import { Logger } from '@src/utils/logger.util';
import { waitForDisappear, waitForVisible } from '@src/utils/wait.util';
import { retryWithBackoff } from '@src/utils/retry.util';
import { getExecutionProfile } from '@src/utils/execution-profile.util';
import { sanitizeString } from '@src/utils/sanitizer.util';

export abstract class BaseComponent {
  protected page: Page;
  protected selector: string | Locator;
  protected logger: Logger;
  friendlyName: string;

  constructor(page: Page, selector: string | Locator, friendlyName: string) {
    this.page = page;
    this.selector = selector;
    this.friendlyName = friendlyName;

    this.logger = (globalThis as any).__TEST_LOGGER__ as Logger;
  }

  get locator(): Locator {
    return typeof this.selector === 'string'
      ? this.page.locator(this.selector)
      : this.selector;
  }

  // ---------------------------------------------------------------------
  // CENTRAL EXEC PIPELINE (ANNOTATION + RETRIES)
  // ---------------------------------------------------------------------
  async exec<T>(
    label: string,
    fn: (loc: Locator) => Promise<T>,
    options?: { retries?: number; annotate?: boolean; skipVisibilityCheck?: boolean; skipRetries?: boolean }
  ): Promise<T> {
    const profile = getExecutionProfile();
    const annotate = options?.annotate ?? true;
    const skipVisibilityCheck = options?.skipVisibilityCheck ?? false;
    const skipRetries = options?.skipRetries ?? false;
    const loc = this.locator;

    // Sanitize the step name for reporting
    const stepName = sanitizeString(`${label}: ${this.friendlyName}`);

    const execution = async () => {
      try {
        // Wrap entire operation (visibility + action) in retry logic
        const operation = async () => {
          // Skip visibility check for methods that verify hidden/disappeared states
          if (!skipVisibilityCheck) {
            await waitForVisible(loc, profile.timeouts.component);
          }
          
          // Execute the action
          return await fn(loc);
        };

        // Apply retry logic unless explicitly skipped
        if (skipRetries) {
          return await operation();
        }
        
        return await retryWithBackoff(
          operation,
          profile.retries,
          profile.timeouts.retryInterval
        );
      } catch (err) {
        // Properly handle unknown error type
        const errorMessage = err instanceof Error ? err.message : String(err);
        throw new Error(`[${this.friendlyName}] ${label} failed: ${errorMessage}`);
      }
    };

    return annotate ? await test.step(stepName, execution) : await execution();
  }

  async safeFill(selector: string, value: string) {
    const masked = sanitizeString(value);

    await test.step(`Fill (masked): ${selector}`, async () => {
      // Use the masked value for reporting
      await this.page.fill(selector, value); // real value to browser
    });
  }

  async waitForDisappear(timeout = 5000) {
    try {
      // Check if element is already hidden/not present - if so, return immediately
      const isAlreadyHidden = await this.locator.isHidden().catch(() => true);
      if (isAlreadyHidden) {
        return;
      }

      await this.page.waitForTimeout(100); // slight delay to avoid false positives
      await this.exec(
        `Wait for disappear`,
        async (loc) => {
          await waitForDisappear(loc, timeout);
        },
        { skipVisibilityCheck: true, skipRetries: true }
      );
    } catch {
      // Ignore errors
    }
  }

  // ---------------------------------------------------------------------
  // WAIT FOR STATES  (visible, hidden, attached, detached, enabled, disabled)
  // ---------------------------------------------------------------------
  async waitFor(
    state:
      | "visible"
      | "hidden"
      | "attached"
      | "detached"
      | "enabled"
      | "disabled",
    timeout = 5000
  ) {
    await this.exec(`Wait for: ${state}`, async (loc) => {
      // native states
      if (["visible", "hidden", "attached", "detached"].includes(state)) {
        await loc.waitFor({ state: state as any, timeout });
        return;
      }

      // resolve DOM handle
      await loc.waitFor({ state: "attached", timeout });
      const handle = await loc.elementHandle();
      if (!handle)
        throw new Error(`Element not attached when waiting for ${state}`);

      if (state === "enabled") {
        await this.page.waitForFunction(
          (el) =>
            !el.hasAttribute("disabled") &&
            el.getAttribute("aria-disabled") !== "true",
          handle,
          { timeout }
        );
        return;
      }

      if (state === "disabled") {
        await this.page.waitForFunction(
          (el) =>
            el.hasAttribute("disabled") ||
            el.getAttribute("aria-disabled") === "true",
          handle,
          { timeout }
        );
        return;
      }
    });
  }

  // ---------------------------------------------------------------------
  // CLICK — supports Playwright options + exec options
  // ---------------------------------------------------------------------
  async click(
    pwOptions?: Parameters<Locator["click"]>[0],
    execOptions?: { retries?: number; annotate?: boolean }
  ) {
    return await this.exec(
      "Click",
      async (loc) => {
        await loc.click(pwOptions);
      },
      execOptions
    );
  }

  async dblclick(
    pwOptions?: Parameters<Locator["dblclick"]>[0],
    execOptions?: { retries?: number; annotate?: boolean }
  ) {
    return await this.exec(
      "Double Click",
      async (loc) => {
        await loc.dblclick(pwOptions);
      },
      execOptions
    );
  }

  // ---------------------------------------------------------------------
  // OTHER ACTIONS
  // ---------------------------------------------------------------------
  async press(keys: string) {
    return await this.exec(`Press ${keys}`, async (loc) => loc.press(keys));
  }

  async scrollIfNeeded() {
    return this.exec("Scroll into view", async (loc) => {
      try {
        await loc.scrollIntoViewIfNeeded();
      } catch { }
    });
  }

  async getText(opts?: { raw?: boolean }): Promise<string> {
    return await this.exec("Get text", async (loc) => {
      try {
        if (opts?.raw) return (await loc.textContent()) ?? "";
        return await loc.innerText();
      } catch {
        return (await loc.textContent()) ?? "";
      }
    });
  }

  // ---------------------------------------------------------------------
  // PROPERTY CHECKS
  // ---------------------------------------------------------------------
  async isEnabled(timeout = 5000) {
    return await this.exec("Check Enabled", async (loc) => loc.isEnabled({timeout: timeout}));
  }

  async isVisible(timeout = 5000) {
    return await this.exec("Check Visible", async (loc) => loc.isVisible({timeout: timeout}).catch(() => false));
  }

  async isHidden(timeout = 5000) {
    return await this.exec(
      "Check Hidden",
      async (loc) => loc.isHidden({timeout: timeout}),
      { skipVisibilityCheck: true }
    );
  }

  async isPresent() {
    return await this.exec("Check Present", async (loc) => (await loc.count()) > 0);
  }

  async count(options?: { annotate?: boolean }): Promise<number> {
    let result = 0;
    await this.exec(
      "Count elements",
      async (loc) => (result = await loc.count()),
      options
    );
    return result;
  }

  // ---------------------------------------------------------------------
  // ASSERTIONS (semantic)
  // ---------------------------------------------------------------------
  async verifyExists(options?: { annotate?: boolean }) {
    const step = `Assert Exists: ${this.friendlyName}`;
    const fn = () => expect(this.locator).toHaveCount(1);
    return options?.annotate === false ? fn() : test.step(step, fn);
  }

  async verifyNotExists(options?: { annotate?: boolean }) {
    const step = `Assert Not Exists: ${this.friendlyName}`;
    const fn = () => expect(this.locator).toHaveCount(0);
    return options?.annotate === false ? fn() : test.step(step, fn);
  }

  async verifyVisible(options?: { annotate?: boolean }) {
    const step = `Assert Visible: ${this.friendlyName}`;
    const fn = () => expect(this.locator).toBeVisible();
    return options?.annotate === false ? fn() : test.step(step, fn);
  }

  async verifyHidden(options?: { annotate?: boolean }) {
    const step = `Assert Hidden: ${this.friendlyName}`;
    const fn = () => expect(this.locator).toBeHidden();
    return options?.annotate === false ? fn() : test.step(step, fn);
  }

  async verifyEnabled(options?: { annotate?: boolean }) {
    const step = `Assert Enabled: ${this.friendlyName}`;
    const fn = () => expect(this.locator).toBeEnabled();
    return options?.annotate === false ? fn() : test.step(step, fn);
  }

  async verifyDisabled(options?: { annotate?: boolean }) {
    const step = `Assert Disabled: ${this.friendlyName}`;
    const fn = () => expect(this.locator).toBeDisabled();
    return options?.annotate === false ? fn() : test.step(step, fn);
  }

  async verifyTextEquals(expected: string, options?: { annotate?: boolean }) {
    const step = `Assert Text Equals (${expected}): ${this.friendlyName}`;
    const fn = () => expect(this.locator).toHaveText(expected);
    return options?.annotate === false ? fn() : test.step(step, fn);
  }

  async verifyTextContains(expected: string, options?: { annotate?: boolean }) {
    const step = `Assert Text Contains (${expected}): ${this.friendlyName}`;
    const fn = () => expect(this.locator).toContainText(expected);
    return options?.annotate === false ? fn() : test.step(step, fn);
  }

  // ---------------------------------------------------------------------
  // EXPECT STYLE ASSERTIONS
  // ---------------------------------------------------------------------
  async expectVisible(timeout = 5000) {
    return await this.exec("expectVisible", async (loc) =>
      await loc.waitFor({ state: "visible", timeout })
    );
  }

  async expectHidden(timeout = 5000) {
    return await this.exec(
      "expectHidden",
      async (loc) => await loc.waitFor({ state: "hidden", timeout }),
      { skipVisibilityCheck: true }
    );
  }

  async expectExists() {
    return await this.exec("expectExists", async (loc) =>
      loc.waitFor({ state: "attached" })
    );
  }

  async expectNotExists() {
    return await this.exec(
      "expectNotExists",
      async (loc) => loc.waitFor({ state: "detached" }),
      { skipVisibilityCheck: true }
    );
  }

  async expectTextEquals(text: string) {
    return await this.exec("expectTextEquals", async (loc) => {
      await loc.waitFor();
      const actual = await loc.textContent();
      if ((actual ?? "").trim() !== text)
        throw new Error(
          `Expected text "${text}" but found "${actual}"`
        );
    });
  }

  async expectTextContains(text: string) {
    return await this.exec("expectTextContains", async (loc) => {
      await loc.waitFor();
      const actual = await loc.textContent();
      if (!actual?.includes(text))
        throw new Error(
          `Expected text to contain "${text}" but found "${actual}"`
        );
    });
  }
}

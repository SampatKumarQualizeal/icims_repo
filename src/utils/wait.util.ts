
import { Page, Locator } from '@playwright/test';
import { getExecutionProfile as exprofile } from './execution-profile.util';

export async function waitForAppIdle(page: Page, idleMs = 400, timeout = exprofile().timeouts.pageLoad) {
  let inflight = 0;

  await page.addInitScript(() => {
    (window as any).inflightRequests = 0;

    const origFetch = window.fetch;
    window.fetch = function (...args) {
      (window as any).inflightRequests++;
      return origFetch.apply(this, args).finally(() => {
        (window as any).inflightRequests--;
      });
    };
  });

  const start = Date.now();
  while (Date.now() - start < timeout) {
    const pending = await page.evaluate(() => (window as any).inflightRequests);
    if (pending === 0) {
      await page.waitForTimeout(idleMs);
      return;
    }
    await page.waitForTimeout(50);
  }

  throw new Error("waitForAppIdle: timeout");
}

export async function waitForReadyElement(locator: Locator, timeout = exprofile().timeouts.component) {
  await locator.waitFor({ state: 'visible', timeout });
  await locator.waitFor({ state: 'attached', timeout });

  // Optional: wait a short time for layout stabilization
  const end = Date.now() + 500;
  while (Date.now() < end) {
    const box1 = await locator.boundingBox();
    await locator.page().waitForTimeout(50);
    const box2 = await locator.boundingBox();
    if (box1 && box2 &&
      box1.x === box2.x &&
      box1.y === box2.y &&
      box1.width === box2.width &&
      box1.height === box2.height) {
      return;
    }
  }
}

export async function waitForIcimsAppReady(page: Page) {
  // Wait for document.readyState
  await page.waitForLoadState("domcontentloaded");

  // Wait for spinners
  await page.locator('[data-testid="loading-spinner"], .skeleton-loader')
    .waitFor({ state: 'detached' }).catch(() => { });

  // Network quiet (our fixed function)
  await waitForAppIdle(page);

  // Small buffer
  await page.waitForTimeout(200);
}

/**
 * Wait until the page network is idle for the given time
 */
export async function waitForNetworkIdle(page: Page, idleTime = 250, timeout = exprofile().timeouts.pageLoad) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    // small navigation check - Playwright doesn't expose global network idle; use a heuristic
    const activity = await page.evaluate(() => {
      // returns number of active fetch/XHR (limited as heuristic)
      // NOTE: This snippet expects PerformanceResourceTiming available
      return (window as any).__playwright_network_inflight || 0;
    }).catch(() => 0);

    if (!activity) {
      // wait for extra stable window
      await page.waitForTimeout(idleTime);
      return;
    }
    await page.waitForTimeout(100);
  }
  throw new Error('waitForNetworkIdle: timeout');
}

/**
 * Wait for locator to be stable (visible + not moving) for stableMs
 */
export async function waitForElementStable(locator: Locator, stableMs = 200, timeout = exprofile().timeouts.component) {
  const start = Date.now();
  let lastBox = await locator.boundingBox().catch(() => null);
  let stableSince = Date.now();

  while (Date.now() - start < timeout) {
    const box = await locator.boundingBox().catch(() => null);
    if (!box) {
      stableSince = Date.now(); // not yet visible
    } else {
      if (lastBox &&
        box.x === lastBox.x &&
        box.y === lastBox.y &&
        box.width === lastBox.width &&
        box.height === lastBox.height) {
        // unchanged
        if (Date.now() - stableSince >= stableMs) return;
      } else {
        stableSince = Date.now();
      }
    }
    lastBox = box;
    await locator.page().waitForTimeout(100);
  }
  throw new Error('waitForElementStable: timeout');
}

/**
 * Wait for the element to appear + be stable and visible
 */
export async function waitForVisibleAndStable(locator: Locator, stableMs = 200, timeout = 10_000) {
  await waitForVisible(locator, timeout);
  await waitForElementStable(locator, stableMs, timeout);
}

/**
 * Waits until a locator disappears:
 * - becomes hidden OR
 * - detaches from DOM.
 */

export async function waitForDisappear(locator: Locator, timeout = 8000): Promise<void> {
  const page = locator.page();

  await page.waitForFunction(
    (el: Element | null) => {
      if (!el) return true;               // element missing → disappeared
      if (!el.isConnected) return true;   // detached → disappeared

      const style = window.getComputedStyle(el);
      const hidden =
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        (el as HTMLElement).offsetParent === null; // cast here

      return hidden;
    },
    await locator.elementHandle().catch(() => null),
    { timeout }
  );
}

export async function waitForVisible(locator: Locator, timeout = exprofile().timeouts.component) {
  await locator.waitFor({ state: 'visible', timeout });
}

export async function waitForReady(page: Page, timeout = exprofile().timeouts.pageLoad) {
  await page.waitForLoadState('networkidle', { timeout: timeout / 2 });
  await waitForPageLoaded(page, timeout);
  // wait for known "app-ready" spinner to disappear, if present
  // optional: check no XHR in the last N ms (app-dependent)
}

export async function waitForPageLoaded(page: Page, timeout = exprofile().timeouts.pageLoad): Promise<void> {
  await page.waitForFunction(
    () => document.readyState === 'complete',
    null,
    { timeout }
  );
}

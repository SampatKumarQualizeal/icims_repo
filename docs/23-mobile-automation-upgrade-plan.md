
# **23 - Mobile Automation Extension Plan**

*(Framework Upgrade Roadmap for Mobile Web & Device Emulation)*

This document outlines **what to add**, **where to add**, and **how to integrate** mobile testing into your existing system while keeping all governance, evidence, RCA, tabs, and component behavior consistent.

---

# 📌 **Goal**

Enable the framework to:

* run tests on **iOS Safari (emulated)**
* run tests on **Android Chrome (emulated)**
* support responsive UI behavior
* support mobile gestures (tap, swipe, scroll)
* handle mobile popups/tabs cleanly
* integrate evidence and RCA seamlessly
* maintain full backward compatibility
* remain Playwright-native (no Appium required)

---

# 🗂 **Phase 1 — Add Mobile Projects (Playwright Config)**

**Modify your `playwright.config.ts`** to include device profiles.

### Add:

```ts
import { devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  outputDir: 'test-results/',

  projects: [
    // Desktop (default)
    {
      name: 'chromium-desktop',
      use: { browserName: 'chromium' }
    },

    // Mobile Chrome (Android)
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        channel: 'chrome', // optional
      }
    },

    // Mobile Safari (iOS)
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 13'],
      }
    }
  ]
});
```

### Benefits:

* Zero code changes in tests
* All components/pages automatically work
* Execution profiles work per project
* Mobile visibility across CI

---

# 🗂 **Phase 2 — Extend `BaseComponent` for Mobile Awareness**

Mobile tests benefit from:

* **tap() instead of click()**
* **scrollIntoView** on elements not visible in viewport

### Add to `BaseComponent`:

```ts
protected get isMobile() {
  return this.page.viewportSize()?.width! < 600;
}

async tap(options?: { annotation?: boolean }) {
  return this.exec("tap", async loc => {
    if (this.isMobile) {
      await loc.tap();
    } else {
      await loc.click();
    }
  }, options);
}
```

### Modify component methods:

Replace:

```ts
await loc.click();
```

With:

```ts
this.isMobile ? await loc.tap() : await loc.click();
```

Minimal/no breaking change.

### Also add swipe actions:

```ts
async swipeUp(distance = 300) {
  const { width, height } = this.page.viewportSize()!;
  await this.page.touchscreen.swipe(width / 2, height - 100, width / 2, height - 100 - distance);
}
```

---

# 🗂 **Phase 3 — Add Mobile-Specific Waits**

Mobile layouts often hide elements behind:

* burger menus
* sliding containers
* mobile modals

Enhance your `waitForVisibleAndStable` utility:

```ts
if (page.isMobile) {
  timeout = timeout * 1.5;
  stabilityMs = stabilityMs * 2;
}
```

This improves stability on smaller screens.

---

# 🗂 **Phase 4 — Tab Manager Enhancements (Mobile-Aware)**

Mobile browsers sometimes open new content in the **same tab**.

Add a mobile fallback:

```ts
if (this.isMobile) {
  // Safari/Chrome on mobile open new windows differently
  context.on('page', async page => {
    this.register(page, "New Mobile Tab");
  });
}
```

Add detection:

```ts
isMobile = this.context.browser()?.browserType().name() !== "firefox"
   && this.context.browser()?.browserName() !== "chromium-desktop";
```

Also refine tab assertions:

```ts
if (this.isMobile && list.length === 1) {
  // Mobile fallback: no real multi-tab
  return name === "Main Tab";
}
```

---

# 🗂 **Phase 5 — Evidence Collector Mobile Enhancements**

### Attach viewport info:

```ts
meta.viewport = await page.viewportSize();
meta.device = page.context()._options.userAgent;
```

### Attach orientation:

```ts
meta.orientation = await page.evaluate(() => screen.orientation.type);
```

These help RCA + debugging.

---

# 🗂 **Phase 6 — RCA Rules for Mobile**

Add new RCA category:

```ts
"MOBILE_VIEWPORT_ISSUE"
```

Triggered when:

* elements clipped due to small screen
* layout shifts
* animations take longer
* mobile overlays block UI

Patterns to detect:

```
element is not clickable
tap failed
element is outside viewport
```

Add heuristics in `failure.categorizer.ts`.

---

# 🗂 **Phase 7 — Add Example Mobile Tests**

Create:

```
tests/specs/mobile/
```

Example test:

```ts
test('Mobile Login Flow', async ({ authPage, runPreChecks, logger }) => {

  await runPreChecks();

  const login = new LoginPage(authPage);
  await login.goto();

  await login.username.fill("admin");
  
  await login.password.fill("password");
  await login.loginButton.tap(); // mobile friendly

  await expect(authPage.getByText('Dashboard')).toBeVisible();
});
```

Add usage of mobile gestures:

```ts
await page.swipeUp();
await page.swipeDown();
```

---

# 🗂 **Phase 8 — CI Integration**

Add mobile into CI matrix:

```yaml
strategy:
  matrix:
    project: [chromium-desktop, mobile-chrome, mobile-safari]
```

You can choose:

* run mobile only on nightly
* run mobile only on staging
* run mobile only on PR smoke

---

# 🗂 **Phase 9 — Documentation Updates**

Add to docs:

* `mobile-support.md`
* Best practices for mobile locators
* Browser support matrix
* Screenshot differences
* Tab Manager limitations on mobile
* How to debug mobile failures

---

# 🏁 **Final Architecture State**

Once implemented, your framework will support:

| Capability                        | Status                                    |
| --------------------------------- | ----------------------------------------- |
| Mobile device emulation           | ✅ Fully supported                         |
| Mobile viewport & UI              | ✅ Fully supported                         |
| Mobile-friendly component actions | ✅ (tap/scroll/swipe)                      |
| Mobile RCA                        | ✅ Supported                               |
| Mobile evidence                   | ✔ Will include device + viewport metadata |
| Mobile tabs                       | ✔ Stable with mobile-aware fallback       |
| Native mobile apps (iOS/Android)  | ❌ Out of scope for Playwright             |
| Hybrid (React Native Web)         | ✔ Works if web-based                      |

Your system will be a **Cross-Platform Automation Platform** (desktop + mobile) with governance, RCA, evidence, data factory, and multi-tab support.


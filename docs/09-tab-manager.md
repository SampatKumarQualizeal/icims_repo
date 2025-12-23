# **09 – Tab Manager (Multi-Tab & Multi-Window Handling)**

Modern web applications frequently open **new tabs, popups, and external authentication windows**.
Managing these with raw Playwright APIs leads to:

* inconsistent tab switching
* race conditions
* lost references
* unpredictable failures
* “Execution context lost” errors
* unclosed tabs blocking further actions

The **Tab Manager** in this framework solves all of these problems through a robust, abstraction-driven architecture.

It is one of the framework’s most **enterprise-grade** subsystems.

---

# 🎯 **Purpose of the Tab Manager**

The Tab Manager:

### ✔ Tracks every tab/page in the test

### ✔ Assigns friendly names to tabs

### ✔ Ensures reliable tab switching

### ✔ Detects newly opened tabs

### ✔ Cleans up leftover tabs automatically

### ✔ Integrates with assertions

### ✔ Produces tab snapshots for evidence

### ✔ Informs RCA categorization

### ✔ Enhances observability via logs & step annotations

It works seamlessly with:

* Soft Assertions
* Evidence Collector
* Governance fixtures
* Step annotation system
* RCA Engine
* Execution profiles

---

# 📁 **Location**

```
src/components/tab-manager.component.ts
```

Integrated into governance fixture:

```
tests/governance/index.ts
```

As fixture:

```ts
tabs: async ({ authContext, authPage }, use, testInfo) => { ... }
```

---

# 🧠 **Core Design Goals**

| Goal               | How It's Achieved                                    |
| ------------------ | ---------------------------------------------------- |
| **Predictability** | Maintains an internal map of all open pages          |
| **Named tabs**     | Every tab gets a friendly name (e.g., "PDF Preview") |
| **Auto-detection** | Listens for `context.on('page')` events              |
| **Cleanup**        | Closes all tabs except “Main Tab” on failures        |
| **Observability**  | test.step annotations for all operations             |
| **Traceability**   | Stored into evidence under `tabs.snapshot.json`      |

---

# 🧱 **Architecture Overview**

The Tab Manager maintains:

```ts
class TabManager {
  private tabs: Map<string, Page>;
  private activeTabName: string;
  private browserContext: BrowserContext;
}
```

### Key responsibilities:

* Register main tab
* Detect new page events
* Assign friendly names
* Switch active tab
* Wait for new tabs
* Expose tab listing
* Cleanup
* Provide tab assertions (soft + hard)

---

# 🧩 **Initialization**

In governance:

```ts
tabs: async ({ authContext, authPage }, use, testInfo) => {
  const tabManager = new TabManager(authContext);
  tabManager.registerMain(authPage, "Main Tab");
  (globalThis as any).__TAB_MANAGER__ = tabManager;

  await use(tabManager);

  if (testInfo.status !== "passed") {
    await tabManager.cleanupTabs("Main Tab");
  }

  delete (globalThis as any).__TAB_MANAGER__;
}
```

### Notes:

* Sets up main tab
* Makes tab manager globally accessible
* Ensures cleanup after failures
* Provides tab snapshot to EvidenceCollector

---

# 🎛️ **TabManager API**

## **1. registerMain(page, name)**

Registers the first tab.

```ts
tabManager.registerMain(authPage, "Main Tab");
```

## **2. register(tabPage, friendlyName)**

Adds a new tab manually.

```ts
tabManager.register(newTab, "PDF Preview");
```

## **3. waitForNewTab(name, options?)**

Automatically waits for `context.on('page')`:

```ts
const pdfTab = await tabs.waitForNewTab("PDF Preview");
```

Options available:

* timeout
* waitUntil network idle

## **4. switchTo(name)**

Switches active context:

```ts
await tabs.switchTo("Candidate Details");
```

## **5. active**

Get active tab name:

```ts
tabs.activeTabName; // "Main Tab"
```

## **6. listTabs()**

Lists all registered tabs:

```ts
const all = tabs.listTabs(); 
// ["Main Tab", "PDF Preview"]
```

## **7. getPage(name)**

Retrieve Page object by name:

```ts
const pdfPage = tabs.getPage("PDF Preview");
```

## **8. cleanupTabs(mainTabName)**

Closes all tabs except the specified main tab:

```ts
await tabs.cleanupTabs("Main Tab");
```

This is triggered:

* automatically after soft assertion failures
* automatically after hard failures (in governance)

---

# 🧪 **Tab-Aware Soft Assertions**

Soft assertions integrate directly with the Tab Manager:

```ts
await soft.tabs(tabs).exists("PDF Preview");
await soft.tabs(tabs).opened("New Window");
await soft.tabs(tabs).active("Main Tab");
await soft.tabs(tabs).count(2);
```

Examples:

### 1. Check if a tab exists

```ts
await soft.tabs(tabs).exists("Preview PDF");
```

### 2. Check active tab

```ts
await soft.tabs(tabs).active("Main Tab");
```

### 3. Count tabs

```ts
await soft.tabs(tabs).count(2);
```

If failures occur:

* logged & annotated
* included in soft assertion summary
* RCA categorization triggered
* tab snapshot saved
* tab cleanup runs

---

# 🔎 **Evidence Integration**

When EvidenceCollector runs:

```
evidence/<test-id>/meta/tabs.snapshot.json
```

Example file:

```json
{
  "tabs": ["Main Tab", "Preview PDF"],
  "active": "Preview PDF",
  "mainTabName": "Main Tab"
}
```

This allows:

* debugging flaky tests
* environment behavior comparison
* RCA (TAB_WINDOW_ISSUE)

---

# 🧠 **RCA Integration**

The FailureCategorizer recognizes:

* “no such window”
* “Execution context was destroyed”
* “popup”
* “new page”
* “waitForEvent(‘page’) timeout”

And classifies it as:

```
TAB_WINDOW_ISSUE
```

With suggestions like:

* Add waits for new tab
* Stabilize popup flows
* Validate tab switching logic
* Context was destroyed too early

---

# 🧭 **Design Principles**

### ✔ Friendly Names

Tabs become business entities (e.g., "Offer Letter PDF Preview").

### ✔ Predictability

Eliminates non-deterministic Playwright behavior around `context.on('page')`.

### ✔ Deterministic Switching

Switching tabs is always stable and consistent.

### ✔ Isolation

Tests don't accidentally continue interacting with the wrong tab.

### ✔ Observability

Every tab action is annotated:

```
► [Tabs] Switching to "PDF Preview"
► [Tabs] Waiting for new tab "Candidate Details"
```

### ✔ Reliability

Automatic cleanup ensures that leftover tabs never break subsequent tests.

---

# 🧱 **Sample Test with Multi-Tab Flow**

```ts
test('Candidate Preview PDF', async ({ authPage, tabs, runPreChecks }) => {
  
  await runPreChecks();

  const candidate = new CandidatePage(authPage);
  await candidate.goto();
  await candidate.openPreviewPDF();

  const pdfTab = await tabs.waitForNewTab("Candidate PDF Preview");

  await tabs.switchTo("Candidate PDF Preview");
  await pdfTab.expectLoaded();

  await tabs.switchTo("Main Tab");

});
```

### What happens behind the scenes:

* new tab event triggers
* tab registered
* friendly name applied
* active tab set
* logs & steps recorded
* tab snapshot output ready for evidence

---

# 🛡️ **Common Problems Solved by TabManager**

| Problem                        | How TabManager Fixes It                          |
| ------------------------------ | ------------------------------------------------ |
| Unpredictable popup detection  | Explicit waitForNewTab()                         |
| Wrong tab receives commands    | switchTo() enforces active tab                   |
| Tabs remain open after failure | cleanupTabs() executed                           |
| Complex flows open > 2 tabs    | Managed via Map<string, Page>                    |
| Lost page references           | registered & tracked centrally                   |
| Multi-tab assertions           | tabs().active(), tabs().count(), tabs().exists() |
| RCA cannot detect tab issues   | RCA categorizer integrated                       |

---

# 🔚 **Summary**

The Tab Manager turns Playwright’s low-level tab handling into a:

### ✔ High-level

### ✔ Observable

### ✔ Reliable

### ✔ Named

### ✔ Deterministic

### ✔ RCA-aware

### ✔ Evidence-aware

automation subsystem.

It is a *major differentiator* that elevates your framework to enterprise standards, especially for complex ATS workflows like:

* Offer Letter Preview
* Job Posting Preview
* Candidate Resume PDF
* Email Preview
* SSO login popups
* Third-party integrations

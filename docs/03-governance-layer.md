
# **03 – Governance Layer (Execution Orchestration Framework)**

The **Governance Layer** is the heart of the automation framework.
It defines *how tests run*, *what rules they must follow*, *what checks occur before and after execution*, and *what artifacts are produced*.
It abstracts away boilerplate, stabilizes execution, enforces quality, and provides enterprise-grade observability.

This layer is implemented in:

```
tests/governance/index.ts
tests/governance/env.check.ts
tests/governance/dod.check.ts
tests/governance/metadata.ts
tests/governance/types.ts
```

---

# 🔥 **Purpose of the Governance Layer**

The governance layer:

### ✔ Ensures **test discipline**

Every test automatically performs:

* environment health checks
* Definition of Done checks
* authentication & context bootstrapping
* logging initialization
* LD flag snapshot
* metadata attachment

### ✔ Centralizes **fixtures**

So individual tests remain short, clean, and readable.

### ✔ Ensures **predictability**

State management (auth, tabs, logs, evidence) becomes consistent across the suite.

### ✔ Produces **audit-ready evidence**

Including logs, traces, screenshots, metadata, LD snapshots, soft assertion summaries, tabs snapshot, RCA analysis, and trends.

### ✔ Adds **enterprise intelligence**

Automatically categorizes failures (RCA Engine)
Automatically stores trend data for dashboards
Automatically notifies Slack/Teams
Automatically archives evidence

---

# 📐 **Core Concepts**

The governance layer introduces a set of powerful concepts:

| Concept                        | Description                                                                                           |
| ------------------------------ | ----------------------------------------------------------------------------------------------------- |
| **Extended Fixtures**          | Consistent runtime objects injected into every test (logger, runPreChecks, authPage, metadata, tabs…) |
| **Test Lifecycle Enforcement** | Pre-checks before execution, evidence + RCA after execution                                           |
| **State Locking**              | Ensures only one login/auth-state generation per worker                                               |
| **Audit Logging**              | Every action, assertion, tab event, soft failure is logged & collected                                |
| **Governed Authentication**    | Reuses shared storageState per worker to avoid repetitive login flows                                 |
| **Evidence Collection**        | Archives everything produced by a test                                                                |
| **RCA Categorization**         | Classifies failures automatically                                                                     |
| **Trend Tracking**             | Writes trend entries to a common test-results/trends.json file                                        |

---

# 🧱 **Fixture Architecture**

The main exported governance instance is:

```ts
export const test = base.extend<{ ...fixtures }>();
```

Fixtures added:

### 1. **logger**

Global test logger (per test), exposes human-readable, structured logs.

### 2. **metadata**

Injects test metadata (product, risk, criticality, etc.) via `generateMetadata()`.

### 3. **runPreChecks**

Executes:

* network idle stabilization
* environment health check
* DoD (Definition of Done) validations

This enforces discipline and blocks tests from running on broken environments.

### 4. **authStorageStatePath**

Ensures authentication is generated **once per worker**.
Uses a **PID-based lock** to prevent parallel login storms.

### 5. **authContext**

Creates an authenticated Playwright browser context using the storage state.

### 6. **authPage**

New page instance for each test using the authenticated context.

### 7. **tabs (TabManager)**

Tracks every new tab/page, records them, and cleans up after test finishes.

### 8. **ld**

LaunchDarkly snapshot integration (optional, controlled via secrets).

---

# 🔁 **Lifecycle Overview**

Here’s what happens when you run:

```
test('My Test', async ({ page, logger, runPreChecks, tabs }) => {
   ...
});
```

### **BEFORE TEST**

1. **Logger initialized**

   * Creates UUID
   * Opens log file
   * Sets global logger
   * Captures start time

2. **Auth state loaded or created**

   * Reuse existing state if created in this worker
   * Or perform login once
   * Save storage state

3. **Run Pre-checks**

   * Network idle stabilization
   * runEnvHealthChecks
   * runDoDChecks
   * Attach both reports to test artifacts

4. **TabManager bootstrapped**

   * Main tab set
   * Global reference `__TAB_MANAGER__` available

---

### **DURING TEST**

All actions go through stable components, with:

* step annotations
* retries
* wait-for-stable
* logs
* soft assertion capture

TabManager tracks all new pages or popups.

---

### **AFTER TEST**

The governance layer performs:

1. **Test Duration Calculation**
   Attaches a `test-duration` artifact.

2. **Evidence Collection**
   Copies:

   * logs
   * trace
   * video
   * screenshots
   * LD flags
   * env/doD report
   * tabs snapshot
   * metadata snapshot
   * soft assertion summary
   * rca.json (if soft or hard failures)
     Creates a zipped evidence bundle.

3. **Hard RCA Categorization**

   * Uses FailureCategorizer
   * Attaches rca.json

4. **Trend Storage**
   Writes to `test-results/trends/trends.json`:

   * testTitle
   * category
   * confidence
   * timestamp
   * duration
   * environment
   * suggestedAction

5. **Slack/Teams notifications**
   On failures, including:

   * test name
   * environment
   * error message

6. **Tab Cleanup**
   Automatically closes leftover tabs.

---

# 🧪 **Governed Test Example**

```ts
import { test, expect } from '../governance';

test('ATS - Login Scenario', async ({ authPage, runPreChecks, logger, tabs }) => {

  await runPreChecks();

  logger.info("Starting login flow");

  const login = new LoginPage(authPage);
  await login.goto();
  await login.login("admin", "adminPass");

  const dashboard = new DashboardPage(authPage);
  await dashboard.expectLoaded();

  await tabs.assert.active("Main Tab");
});
```

### What you didn’t have to write:

* launch browser
* login
* tab tracking
* environment validation
* LD flag snapshot
* evidence collection
* RCA categorization
* log setup
* tab cleanup
* test metadata
* reporting setup

Governance layer handles ALL of this.

---

# 🧭 **Design Principles**

### 1. **Centralization**

All cross-cutting behaviors (logging, auth, tabs, RCA, evidence) live in governance, not in test code.

### 2. **Predictability**

Every test runs with the same controlled lifecycle.

### 3. **Auditability**

Every test run can be reconstructed with:

* trace
* video
* logs
* metadata
* rca.json
* soft assertion summary
* tab snapshot

### 4. **Modularity**

Fixtures are isolated and replaceable (e.g., swapping LD with another feature flag provider).

### 5. **Enterprise Maturity**

Designed to satisfy expectations of:

* CI reliability
* Governance teams
* RCA boards
* QA leadership
* Customer demos

---

# 🛠 **Extensibility Hooks**

The governance layer is designed to be easily extended:

| Feature                     | How to Add                                           |
| --------------------------- | ---------------------------------------------------- |
| DB Customer Replication     | Integrate into `runPreChecks` or as separate fixture |
| TestRail / TM4J Integration | Add post-test hook after trend storage               |
| Distributed Test Execution  | Governance fixtures are cross-worker safe            |
| ML-enhanced RCA             | Add new categorizer engine around FailureCategorizer |
| Environment Sync            | Plug into pre-checks or a new fixture                |

---

# 📌 **When to Modify Governance Layer**

Modify governance when you need to add:

* New test metadata
* New test lifecycle rules
* New regulatory checks
* New notifications
* New evidence types
* New RCA signals
* New global fixtures

Do **NOT** modify governance for:

* Page logic
* Test business steps
* Component actions
* Data generation
* API calls

Those belong elsewhere.

---

# 🏁 **Summary**

The governance layer is the **execution framework** and **quality gatekeeper** of your automation platform.
It ensures every test executes under strict, auditable, enterprise-friendly rules while remaining extremely easy to write and maintain.

This layer unlocks:

* Predictability
* Observability
* RCA intelligence
* Self-healing test behavior
* Modular pipeline integrations

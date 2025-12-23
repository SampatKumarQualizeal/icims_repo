
# **21 – Folder Structure (Project Layout & Rationale)**

This document explains the **directory structure** of the automation framework, why it’s structured this way, and how each folder contributes to clean architecture, maintainability, scalability, and developer experience.

A clear, well-organized project layout is essential for:

* onboarding new developers
* increasing test authoring speed
* preventing architectural drift
* integrating tools (RCA, Evidence, Trends, etc.)
* enabling enterprise-level governance

This folder structure reflects industry-standard patterns tailored for Playwright + enterprise automation.

---

# 📁 **Top-Level Directory Structure**

```
.
├── src/
│   ├── api/
│   ├── components/
│   ├── config/
│   ├── data-factory/
│   ├── environment/
│   ├── pages/
│   ├── utils/
│   ├── notifications/
│   └── ...
│
├── tests/
│   ├── governance/
│   └── specs/
│
├── docs/
├── test-results/
├── .env (ignored)
├── package.json
├── playwright.config.ts
└── tsconfig.json
```

---

# 🧱 **1. `src/` — Core Framework Source**

Everything under `src/` defines the **framework**, not the tests.
This is the reusable automation engine.

---

## 📁 **1.1 `src/components/`

(UI Components Layer)**

Contains reusable UI abstractions:

```
button.component.ts
input.component.ts
dropdown.component.ts
modal.component.ts
toast.component.ts
tab-manager.component.ts
base.component.ts
locator.util.ts
```

These offer:

* friendly-name locators
* retries
* stability waits
* logs & annotations
* built-in assertions

---

## 📁 **1.2 `src/pages/`

(Page Object Layer)**

Contains:

* UI pages
* high-level page actions
* business-friendly interfaces

Examples:

```
ats/login.page.ts
ats/dashboard.page.ts
ats/candidate.page.ts
```

Pages use components, not raw selectors.

---

## 📁 **1.3 `src/data-factory/`

(API + Synthetic Data Factory)**

Contains:

* Factories for test data
* Builders for synthetic data
* API integration clients

Examples:

```
base.factory.ts
candidate.factory.ts
job.factory.ts
user.factory.ts
```

Used for UI setup replacement.

---

## 📁 **1.4 `src/api/`

(API Clients)**

Contains simple, reusable API clients:

```
api-client.ts
auth.ts
```

These are used by Data Factories.

---

## 📁 **1.5 `src/config/`

(Configuration & Secrets)**

Contains:

```
config.ts
secrets.ts
env/dev.json
env/qa.json
env/staging.json
secrets/.env
```

Provides:

* environment switching
* environment config merging
* secure secrets
* feature toggles (Slack, Teams, LD)

---

## 📁 **1.6 `src/notifications/`**

Contains:

```
slack.notifier.ts
teams.notifier.ts
```

Framework sends alerts ONLY from governance layer.

---

## 📁 **1.7 `src/environment/`

(Customer Environment Replicator)**

Contains utilities for:

* LaunchDarkly replication
* property synchronization
* environment drift detection

Example:

```
env-replicator.ts
```

---

## 📁 **1.8 `src/utils/`

(Shared Utilities)**

Includes:

* logger
* rca engine
* soft assertion engine
* generic assertions
* retry engine
* wait utilities
* evidence collector
* trend engine

Key files:

```
logger.util.ts
assert-soft.util.ts
assert-generic.util.ts
failure.categorizer.ts
failure.trends.ts
evidence.collector.ts
execution-profile.util.ts
wait.util.ts
retry.util.ts
name.util.ts
```

This is the framework’s “toolbox”.

---

# 🧪 **2. `tests/` — Test Suites**

Everything under `tests/` is **test implementation**, not framework code.

---

## 📁 **2.1 `tests/governance/`

(Execution Control Layer)**

Critical folder containing:

### ✔ Global fixtures

### ✔ Pre-checks

### ✔ DoD checks

### ✔ LD integration

### ✔ Logging setup

### ✔ Evidence collector triggers

### ✔ RCA/trend hooks

### ✔ Tab manager fixture

Key files:

```
index.ts
env.check.ts
dod.check.ts
metadata.ts
types.ts
worker-fixtures.ts (optional)
```

All tests must import:

```ts
import { test, expect } from '../../governance';
```

---

## 📁 **2.2 `tests/specs/`

(Actual Business Tests)**

Tests are grouped by business domain, not UI pages.

### Correct:

```
tests/specs/ats/candidate/
tests/specs/ats/job-posting/
tests/specs/ats/offer-management/
```

### Incorrect:

```
tests/specs/pages/
tests/specs/screens/
```

Tests should read like business workflows, not page interactions.

---

# 📁 **3. `docs/` — Documentation**

Contains:

* high-level overview
* architecture docs
* technical deep dives
* best practices
* developer guides
* RCA and evidence docs

Examples:

```
04-framework-overview.md
06-data-factory.md
07-component-architecture.md
09-tab-manager.md
12-rca-engine.md
13-evidence-collector.md
15-execution-profiles.md
18-best-practices.md
21-folder-structure.md
...
```

This is the **public-facing documentation portal** for the framework.

---

# 📁 **4. `test-results/` — Dynamic Output**

Automatically created during test runs.

Contains:

* evidence directory
* trace files
* videos
* screenshots
* trend history
* LD flag dumps
* auth storage state

Structure:

```
test-results/
  <project-name>/
    <test-output>/
      evidence/
    auth-state/
    trends/
```

This folder is **ignored in git**.

---

# 📄 **5. `package.json`**

Defines:

* framework dependencies
* playwright dependencies
* scripts for running tests
* linting rules (optional)

---

# 📄 **6. `playwright.config.ts`**

Defines:

* test directory
* retries
* browser projects
* trace/video/screenshot settings
* CI overrides
* reporting configuration

Governance ensures consistency, while this file controls execution.

---

# 🎛️ **7. `tsconfig.json`**

Defines TypeScript settings:

* path aliases (`@src/*`)
* strictness
* compilation outputs

Important so developers can import:

```ts
import { Logger } from '@src/utils/logger.util';
```

---

# 🎯 **Why This Structure Works**

| Benefit                          | Explanation                                       |
| -------------------------------- | ------------------------------------------------- |
| **Clear separation of concerns** | src = framework engine, tests = usage             |
| **Scalable**                     | Each feature in its own module                    |
| **Discoverability**              | Easy for new devs to locate components/pages      |
| **Reusability**                  | Data factories, utils, components usable anywhere |
| **Governance-ready**             | index.ts controls entire execution lifecycle      |
| **Test clarity**                 | specs folder stays clean and business-oriented    |

---

# 🔮 **Future Folder Enhancements**

Planned improvements:

### ✔ `/flows/`

Reusable business flow layer.

### ✔ `/dashboard/`

React UI for trend & RCA visualization.

### ✔ `/cli/`

Command-line tools for scaffolding.

### ✔ `/plugins/`

Optional plugin system for exporters (Jira, TM4J, CSV, etc.).

### ✔ `/schema/`

Locator + component schema validation.

### ✔ `/benchmark/`

Performance metrics for page load & action timing.

---

# 🏁 **Summary**

The folder structure is designed for:

### ✔ Maintainability

### ✔ Scalability

### ✔ Developer productivity

### ✔ Enterprise governance

### ✔ High visibility (evidence/RCA/trends)

### ✔ Modularity

It is informed by:

* best practices from large-scale Playwright programs
* enterprise test governance
* ATS-specific workflows (multi-tab)
* modern automation architecture

This structure ensures the framework remains clean, future-proof, and easy for any developer to navigate.


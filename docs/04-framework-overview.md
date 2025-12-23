
# **04 – Framework Overview**

Welcome to the **iCIMS Automation Framework** — an enterprise-grade, Playwright-based platform engineered for reliability, scalability, observability, and deep integration with customer environments.

Unlike typical UI automation frameworks, this system is **governed**, **self-healing**, **evidence-rich**, and designed to support real-world enterprise challenges such as:

* multi-environment testing
* LaunchDarkly feature flagging
* customer environment replication
* API + UI blended flows
* tab-heavy ATS workflows
* automated RCA
* trend analytics
* governance and compliance requirements

This document provides a **high-level understanding** of how the framework works and why each part exists.

---

# 🚀 **Vision**

> **To build a stable, intelligent, full-stack test automation ecosystem that not only runs tests but also diagnoses issues, replicates customer states, produces audit-ready evidence, and integrates seamlessly with enterprise workflows.**

The framework is not just a "test runner".
It's a **testing platform**.

---

# 🧱 **Core Architectural Pillars**

The framework is built on **seven major pillars**:

1. **Governed Test Execution**
2. **Component Architecture (UI Abstraction Layer)**
3. **Page & Flow Layer**
4. **Data Factory (API-driven test data creation)**
5. **Soft + Hard Assertion Engines**
6. **Multi-Tab Manager (Window orchestration)**
7. **Evidence, RCA, and Trend Analysis Systems**

Each of these layers is documented deeply in separate sections.

---

# 📐 **High-Level Architecture**

```
src/
  api/                  → API clients for data factories
  components/           → Buttons, Inputs, Modals, Dropdowns (friendly names)
  config/               → Config + Secrets
  data-factory/         → CandidateFactory, JobFactory, UserFactory...
  environment/          → Environment replication (LD/DB/etc.)
  pages/                → Page Objects (UI layer)
  utils/                → Logger, Soft Assert, RCA, Evidence, Tab Manager
  notifications/        → Slack/Teams notifiers

tests/
  governance/           → Governance fixtures + Pre-checks
  specs/                → Organized business test suites
```

---

# 🧭 **1. Governance Layer (Execution Backbone)**

The **Governance Layer** is the heart of the system.

It provides:

### ✔ logger

### ✔ metadata

### ✔ pre-checks (environment + DoD)

### ✔ authenticated context

### ✔ authenticated pages

### ✔ LaunchDarkly integration

### ✔ Tab Manager

### ✔ RCA & Trend recording

### ✔ evidence collection

### ✔ soft assertion cleanup

### ✔ Slack/Teams integration

All of this is injected automatically through governed fixtures.

**Every test runs inside this controlled environment.**

---

# 🎨 **2. Component Architecture**

The component layer provides typed UI abstractions:

* `Button`
* `Input`
* `Dropdown`
* `Modal`
* `Toast`
* `TabManager`

Every component:

* uses friendly names
* wraps interactions in `test.step()`
* logs every action
* applies retries
* waits for visibility/stability
* supports built-in assertions

This eliminates brittle, low-level locators and produces human-readable reports.

---

# 📄 **3. Page Objects / Flow Layer**

Pages contain:

* components
* navigation
* semantic UI behavior

Flows contain:

* reusable business workflows
* multi-page orchestration
* retry-aware sequences

Example:

```ts
await ATSFlows.loginAsRecruiter(page);
await ATSFlows.createJobPosting(page, jobData);
```

This simplifies tests dramatically.

---

# 🧪 **4. Data Factory Layer**

UI data setup is slow and brittle.
Data Factories solve this.

They provide API-driven creation of:

* candidates
* jobs
* users
* roles
* portal postings

Factories:

* authenticate
* generate synthetic test data
* return clean objects
* speed up tests
* avoid UI flakiness in setup

Example:

```ts
const candidate = await candidateFactory.create({ resume: true });
```

---

# ⚙️ **5. Assertion Engines**

Two complementary systems:

### **Hard Assertions (fail-fast)**

Used for critical operations.

### **Soft Assertions (non-blocking)**

Used for validation-heavy flows.

Soft assertions:

* collect failures
* annotate steps
* integrate with RCA
* clean up tabs
* provide summary reports

This gives developers both stability and visibility.

---

# 🧬 **6. Tab Manager (Multi-Window Stability)**

Many ATS flows open:

* PDF previews
* external portals
* offer letters
* resume viewer windows

Tab Manager provides:

* named tabs
* active tab tracking
* wait-for-new-tab
* switching
* cleanup
* tab-level soft assertions

This solves one of the biggest pain points of UI automation.

---

# 📦 **7. Evidence Collector (Unified Evidence Layer)**

Every test produces a complete evidence package:

```
evidence/
  logs/
  screenshots/
  trace.zip
  video/
  meta/
    testinfo.json
    tabs.snapshot.json
    rca.json
    ld.flags.json
```

Evidence is:

* zipped
* archived
* easily shareable
* CI-friendly
* governance-ready

This transforms how failures are reviewed.

---

# 🔬 **8. RCA Engine (Automated Root Cause Analysis)**

The framework automatically determines:

* what failed
* why it failed
* what category it belongs to
* how confident the analysis is
* what action should be taken
* what patterns match common failures

Example:

```json
{
  "category": "UI_ELEMENT_NOT_FOUND",
  "confidence": 89,
  "suggestedAction": "Verify selector or check DOM changes."
}
```

This reduces debugging time dramatically.

---

# 📊 **9. Trend Engine**

Every failure is appended to:

```
test-results/trends/trends.json
```

This enables dashboards for:

* top failing tests
* flaky tests
* failure categories
* environment instability
* release regressions

This makes the framework a *reporting system*, not just a runner.

---

# 🧠 **10. LaunchDarkly Integration**

Tests can:

* snapshot feature flags per test
* detect drift between environments
* store LD metadata
* replicate customer feature flag states

This is critical in feature-flag-heavy applications like iCIMS.

---

# 🔐 **11. Config & Secrets System**

Multi-layered configuration:

```
config/env/dev.json
config/env/qa.json
config/env/staging.json
config/secrets/.env
```

This system enables:

* stable environment switching
* safe secrets handling
* toggleable features (Slack, Teams, LD)
* compatibility with CI/CD

---

# 🔧 **12. Execution Profiles**

Three execution modes:

### FAST

Minimal waits — developer-friendly.

### SAFE

More stability — CI-friendly.

### DEBUG

Extra logs/screenshots/traces — debugging-friendly.

Profiles influence:

* retries
* stability waits
* logging verbosity

---

# 🧩 **13. Best Practices**

Developers are encouraged to follow:

* Data Factory for setup
* Components for UI interaction
* Soft/hard assertions appropriately
* Flow-driven tests
* No raw selectors
* No UI setup steps
* No manual log collection
* No secrets hardcoded

See `18-best-practices.md` for full details.

---

# 🌐 **14. Extensibility & Plugin Architecture**

The framework is built to extend easily:

* add new notifiers
* integrate new APIs
* plug into Jira/TM4J
* add custom evidence exporters
* add new RCA rules
* register custom test metadata
* extend Tab Manager for mobile views
* override environment rules

---

# 🔮 **15. Future Direction**

Major roadmap initiatives include:

* Self-healing selectors
* AI-driven RCA
* Test impact analysis
* Environment Replicator (DB + LD + config sync)
* Trend dashboard UI
* Code-quality governance

See `20-future-roadmap.md`.

---

# 🏁 **Summary**

The iCIMS Automation Framework offers:

### ✔ Component-driven UI abstraction

### ✔ Data Factory for API-driven data

### ✔ Governance and pre-check enforcement

### ✔ Tab Manager for multi-window flows

### ✔ Combined Hard + Soft assertion engines

### ✔ Robust evidence and RCA systems

### ✔ Trend analytics

### ✔ Config + Secrets management

### ✔ Full extensibility

### ✔ Slack/Teams notifications

### ✔ Playwright foundation

It is more than an automation framework —
it is a **complete testing platform** built for enterprise-level reliability, observability, and governance.

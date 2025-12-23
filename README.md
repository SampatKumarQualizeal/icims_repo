
# ✅ **README.md**

### *iCIMS Enterprise Automation Framework (Playwright + API + RCA Platform)*

---

# 🚀 **Overview**

This repository contains a **full-stack, enterprise-grade automation framework** designed specifically for complex ATS workflows, multi-environment execution, feature-flag-driven UIs, and robust CI pipelines.

Unlike typical test suites, this framework is a **governed execution platform**, offering:

* Component-based UI abstraction
* Data Factory for API-driven test data
* Multi-tab orchestration
* Automated RCA (Root Cause Analysis)
* Unified Evidence Collector
* Trends & stability analytics
* LaunchDarkly integration
* Slack/Teams notifications
* Execution Profiles (FAST/SAFE/DEBUG)
* Environment pre-checks and DoD enforcement

This makes it resilient, observable, intelligent, and highly scalable.

---

# 🏛 **Key Features**

### 🔹 **Governance Layer**

Every test runs through a standardized lifecycle:

* Pre-checks (environment + DoD)
* Auth state caching & context creation
* Metadata injection
* Logging bootstrap
* Tab Manager injection
* RCA + Evidence + Trends on teardown
* Optional Slack/Teams notifications

### 🔹 **Component Architecture**

Readable, retry-enabled, stable abstractions:

* `Button`
* `Input`
* `Dropdown`
* `Modal`
* `Toast`
* `TabManager`
  Each component includes:
* Friendly names
* Automatic waits and retries
* Annotated test steps
* Built-in assertions

### 🔹 **Data Factory Layer**

API-based synthetic data creation for:

* Candidates
* Jobs
* Users
  Dramatically reduces UI setup time and flakiness.

### 🔹 **Soft + Hard Assertions**

* Hard assertions → fail-fast for critical steps
* Soft assertions → collect multiple failures for end-of-test RCA

### 🔹 **Evidence Collector**

Automated capture of:

* Trace
* Video
* Screenshots
* Logs
* LD snapshot
* RCA output
* Tab state snapshot

Packaged into an `evidence.zip` file for each test.

### 🔹 **RCA Engine (Automated Root Cause Analysis)**

Categorizes failures automatically:

* UI element issues
* UI timeouts
* Navigation failures
* Network issues
* Data issues
* Assertion failures
* Tab/window issues
* Environment issues

Attaches confidence and suggested actions.

### 🔹 **Trend Engine**

Stores historical RCA + status for:

* Flaky test detection
* Release regression monitoring
* Environment stability graphs

### 🔹 **LaunchDarkly Integration**

Captures feature flag snapshots per test — critical for feature-flag-driven applications.

### 🔹 **Tab Manager**

ATS workflows often open multiple windows.
Tab Manager provides:

* Named tabs
* Automatic tab detection
* Switching
* Cleanup
* Tab-level assertions

### 🔹 **Execution Profiles**

Choose execution behavior:

* `FAST` → Local speed
* `SAFE` → CI stability
* `DEBUG` → Deep diagnostic mode

---

# 📦 **Project Structure**

```
src/
  api/
  components/
  config/
  data-factory/
  environment/
  pages/
  notifications/
  utils/

tests/
  governance/
  specs/

docs/
  (full documentation portal)
```

Detailed explanation:
👉 `docs/21-folder-structure.md`

---

# ⚙️ **Installation**

### 1. Clone the repo

```bash
git clone <repo-url>
cd <repo-name>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Install Playwright browsers

```bash
npx playwright install
```

---

# 🔐 **Environment Setup**

### Create `.env`

```bash
cp src/config/secrets/.env.example src/config/secrets/.env
```

Update values:

```
UI_USER=...
UI_PASS=...
ADMIN_USER=...
ADMIN_PASS=...

SLACK_ENABLED=false
SLACK_WEBHOOK=

TEAMS_ENABLED=false
TEAMS_WEBHOOK=

LD_ENABLED=false
LD_KEY=
```

---

# 🚦 **Running Tests**

### Run all tests:

```bash
npx playwright test
```

### Run one test:

```bash
npx playwright test tests/specs/.../your-test.spec.ts
```

### UI mode:

```bash
npx playwright test --ui
```

### Debug mode:

```bash
npx playwright test --debug
```

---

# 🧪 **Example Test**

```ts
import { test } from '@tests/governance';
import { LoginPage } from '@src/pages/ats/login.page';
import { CandidateFactory } from '@src/data-factory/candidate.factory';

test('ATS CW - Candidate Login Flow', async ({
  authPage,
  runPreChecks,
  logger,
  tabs
}) => {

  await runPreChecks();

  const factory = new CandidateFactory(config.apiBaseUrl);
  await factory.authenticate(config.secrets.adminUser, config.secrets.adminPass);
  const candidate = await factory.create({ resume: true });

  logger.info("Candidate created", candidate);

  const login = new LoginPage(authPage);
  await login.goto();
  await login.login(config.secrets.ats.uiUser, config.secrets.ats.uiPass);

  await tabs.assert.active("Main Tab");
});
```

---

# 🧭 **How to Write Tests**

Learn full authoring patterns:
👉 `docs/16-writing-tests.md`
👉 `docs/18-best-practices.md`

---

# 🧠 **Troubleshooting**

Quick guide:
👉 `docs/22-test-troubleshooting-guide.md`

Use:

* RCA output
* evidence.zip
* trace viewer
* soft assert summaries
* LD snapshots
* tab snapshots

---

# 📚 **Documentation**

Full documentation lives in `/docs/`.

Recommended order:

1. `01-introduction.md`
2. `02-getting-started.md`
3. `04-framework-overview.md`
4. `05-config-and-secrets.md`
5. `06-data-factory.md`
6. `07-component-architecture.md`
7. `08-assertion-engines.md`
8. `09-tab-manager.md`
9. `11-prechecks-and-governance.md`
10. `12-rca-engine.md`
11. `13-evidence-collector.md`
12. `15-execution-profiles.md`
13. `18-best-practices.md`
14. `21-folder-structure.md`
15. `22-test-troubleshooting-guide.md`

---

# 🔮 **Planned Enhancements**

* AI-assisted RCA
* Selector self-healing
* Trend Dashboard UI
* Environment Replicator (DB/LD/settings)
* Plugin system for Jira / TM4J / custom exporters
* PDF evidence reporter

Roadmap document:
👉 `docs/20-future-roadmap.md`

---

# ❤️ **Contributing**

Please follow:

* Component naming conventions
* Page object patterns
* Data factory style
* Governance-based fixtures
* Best practices (see docs/18-best-practices.md)

All PRs must include:

* Clear explanation
* Unit or integration test (if applicable)
* Updated documentation (if needed)

---

# 🙏 **Credits**

Designed and architected by:

### **J (Test Automation Architect)**

Built for the iCIMS project, with enterprise-grade standards and future readiness.


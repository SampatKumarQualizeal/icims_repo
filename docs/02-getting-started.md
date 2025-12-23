
# **02 – Getting Started (Quickstart Guide)**

Welcome to the **iCIMS Enterprise Automation Framework** — a governed, component-driven, API-integrated, Playwright-based automation platform.

This guide helps new developers get set up quickly and run their first test, while understanding how the framework is structured and how to extend it safely.

---

# 🚀 **1. Prerequisites**

Make sure your machine has:

### ✔ Node.js (>= 18.x recommended)

Check with:

```bash
node -v
```

### ✔ npm or yarn

Check with:

```bash
npm -v
```

or

```bash
yarn -v
```

### ✔ Git

For cloning the repository.

---

# 📦 **2. Install Dependencies**

After cloning the repository:

```bash
npm install
```

This installs:

* Playwright
* TypeScript
* linting tools (optional)
* framework dependencies (LaunchDarkly SDK, Axios, etc.)

---

# 🎭 **3. Install Playwright Browsers**

Playwright needs the actual browser binaries:

```bash
npx playwright install
```

Or install only selected browsers:

```bash
npx playwright install chromium
```

---

# 🔐 **4. Set Up Environment & Secrets**

Create your local `.env`:

```bash
cp src/config/secrets/.env.example src/config/secrets/.env
```

Open `.env` and set:

```
UI_USER=<your username>
UI_PASS=<your password>

ADMIN_USER=<api admin>
ADMIN_PASS=<api password>

SLACK_ENABLED=false
TEAMS_ENABLED=false

LD_ENABLED=false
LD_KEY=
```

⚠️ **`.env` must NOT be committed.**
It is already ignored by `.gitignore`.

---

# 🌐 **5. Choose Execution Mode**

Execution profiles determine test stability vs. speed.

Set your desired mode in `.env`:

```
EXECUTION_MODE=FAST
```

Options:

* **FAST** (recommended for dev)
* **SAFE** (recommended for CI)
* **DEBUG** (recommended for debugging failures)

More info: `15-execution-profiles.md`

---

# 🧭 **6. Running Tests**

### Run all tests:

```bash
npx playwright test
```

### Run a single test:

```bash
npx playwright test tests/specs/ats/job-posting/create-job.spec.ts
```

### Run with UI mode (interactive):

```bash
npx playwright test --ui
```

### Run with debug:

```bash
npx playwright test --debug
```

You can also run tests with specific browsers:

```bash
npx playwright test --project=chromium
```

---

# 📁 **7. Understanding the Project Structure**

A simplified view:

```
src/
  components/     → Button, Input, Dropdown, Modal, TabManager
  pages/          → UI page objects
  data-factory/   → API-based test data
  utils/          → Logger, RCA, Evidence, Assertions
  config/         → env configs + secrets
tests/
  governance/     → fixtures, pre-checks, execution engine
  specs/          → actual test cases
docs/             → documentation
```

Full breakdown:
`21-folder-structure.md`

---

# 🔧 **8. Your First Test Example**

Here is the simplest governed test:

```ts
import { test } from '@tests/governance';

test('Example Smoke Test', async ({ authPage, runPreChecks }) => {

  await runPreChecks();

  await authPage.goto('https://example.com');
  await authPage.getByText('Example Domain').waitFor();

});
```

But we usually use Page Objects + Components:

```ts
test('ATS - Login Flow', async ({ authPage, runPreChecks }) => {

  await runPreChecks();

  const login = new LoginPage(authPage);

  await login.goto();
  await login.login(config.secrets.ats.uiUser, config.secrets.ats.uiPass);

});
```

---

# 🧱 **9. Writing a Real Test (Recommended Pattern)**

```ts
import { test } from '@tests/governance';
import { CandidateFactory } from '@src/data-factory/candidate.factory';
import { LoginPage } from '@src/pages/ats/login.page';
import { DashboardPage } from '@src/pages/ats/dashboard.page';

test('ATS CW - Candidate Login Validation', async ({
  authPage,
  runPreChecks,
  logger,
  tabs
}) => {

  await runPreChecks();

  // API setup
  const factory = new CandidateFactory(config.apiBaseUrl);
  await factory.authenticate(config.secrets.adminUser, config.secrets.adminPass);
  const candidate = await factory.create({ resume: true });

  logger.info("Candidate created", candidate);

  // UI flow
  const login = new LoginPage(authPage);
  await login.goto();
  await login.login(config.secrets.ats.uiUser, config.secrets.ats.uiPass);

  const dashboard = new DashboardPage(authPage);
  await dashboard.expectLoaded();

  await tabs.assert.active("Main Tab");
});
```

---

# 🧠 **10. Useful Developer Commands**

### Show trace viewer:

```bash
npx playwright show-trace test-results/.../trace.zip
```

### Generate HTML report:

```bash
npx playwright show-report
```

### Clean test results:

```bash
rm -rf test-results
```

### Update TypeScript declarations:

```bash
npm run build
```

---

# 🔍 **11. What Happens Behind the Scenes?**

Every test runs with:

### ✔ Pre-checks (environment + DoD)

### ✔ Auth reused via storage state

### ✔ Logger initialization

### ✔ Metadata injection

### ✔ Automatic evidence collection

### ✔ TabManager handling

### ✔ RCA categorization

### ✔ Trend logging

### ✔ Optional Slack/Teams alerts

You get enterprise-level execution **without writing extra code**.

---

# 🧩 **12. Common Issues & Fixes**

### ❗ Test cannot find selectors

→ Ensure you are using components, not raw selectors.

### ❗ Environment config missing

→ Check `src/config/env/<env>.json`.

### ❗ Secrets undefined

→ Make sure `.env` is created.

### ❗ New tab not detected

→ Always use `await tabs.waitForNewTab("Friendly Name")`.

### ❗ Tests slow

→ Switch to `FAST` mode locally.

---

# 🛡️ **13. Next Steps**

After completing this Quickstart, explore:

### ✔ `07-component-architecture.md`

Learn UI component structure.

### ✔ `06-data-factory.md`

Accelerate automation using APIs.

### ✔ `16-writing-tests.md`

Best test authoring patterns.

### ✔ `13-evidence-collector.md`

Understand the evidence system.

### ✔ `12-rca-engine.md`

Failure intelligence.

---

# 🏁 **Summary**

You now have everything needed to:

### ✔ Install & configure the framework

### ✔ Run tests

### ✔ Use pre-checks & components

### ✔ Create data via factories

### ✔ Write stable tests

### ✔ Understand folder structure

### ✔ Debug failures with evidence

This quickstart forms the foundation of your work with the iCIMS automation platform.


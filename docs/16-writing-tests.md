
# **16 – Writing Tests (Authoring Guide for Developers)**

This guide explains **how to write tests** using the full capabilities of the framework.
It covers structure, patterns, fixtures, data setup, components, assertions, tabs, reporting, and RCA-friendly writing practices.

This is the single most important document for day-to-day automation developers.

---

# 📚 **1. Test Structure Overview**

Every test in this framework uses the governed `test` exported from:

```
tests/governance/index.ts
```

This provides:

* logger
* pre-checks
* authenticated context
* authenticated page
* tab manager
* metadata
* RCA/Evidence hooks
* LaunchDarkly integration
* soft assertion support

### Minimal Example

```ts
import { test, expect } from '../../governance';

test('Simple Example', async ({ authPage }) => {
  await authPage.goto('https://example.com');
  await expect(authPage).toHaveTitle(/Example Domain/);
});
```

But in real tests, we use **components**, **pages**, and **data factories**.

---

# 🧪 **2. Test Template (Standard Pattern)**

Every test typically follows this structure:

```ts
import { test } from '@tests/governance';
import { LoginPage } from '@src/pages/ats/login.page';
import { DashboardPage } from '@src/pages/ats/dashboard.page';
import { CandidateFactory } from '@src/data-factory/candidate.factory';

test('ATS CW - Candidate Creation + Login Flow', async ({
  authPage,
  runPreChecks,
  logger,
  tabs
}) => {

  // 1 — Pre-checks
  await runPreChecks();

  // 2 — API setup (Data Factory)
  const candidateFactory = new CandidateFactory(config.apiBaseUrl);
  await candidateFactory.authenticate(config.secrets.adminUser, config.secrets.adminPass);
  const candidate = await candidateFactory.create({ resume: true });

  logger.info("Candidate created", candidate);

  // 3 — UI flows
  const login = new LoginPage(authPage);
  await login.goto();
  await login.login(config.secrets.ecrets.uiUser, config.secrets.ats.uiPass);

  const dashboard = new DashboardPage(authPage);
  await dashboard.expectLoaded();

  // 4 — Tab assertions (if needed)
  await tabs.assert.active("Main Tab");
});
```

---

# 🧭 **3. When to Use Each Fixture**

| Fixture                  | When to use                                   |
| ------------------------ | --------------------------------------------- |
| **authPage**             | For UI actions after login is already handled |
| **runPreChecks**         | At the very beginning of every test           |
| **logger**               | For structured messages                       |
| **tabs**                 | Any time dealing with multiple windows        |
| **metadata**             | Mostly internal use                           |
| **authContext**          | Advanced multi-tab flows                      |
| **authStorageStatePath** | Usually not needed in tests                   |
| **ld**                   | For LD flag-specific checks                   |

---

# 🧱 **4. Page Objects – How to Use Them**

A Page Object contains:

* UI components
* semantic business-friendly APIs
* no test data setup
* no business flows

### Example:

```ts
export class LoginPage {
  username = new Input(this.page, '#username', 'Username Field');
  password = new Input(this.page, '#password', 'Password Field');
  loginButton = new Button(this.page, '#btnLogin', 'Login Button');

  constructor(private page: Page) {}

  async goto() {
    await this.page.goto(config.appBaseUrl + '/login');
  }

  async login(user: string, pass: string) {
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.loginButton.click();
  }
}
```

### Usage in tests:

```ts
const login = new LoginPage(authPage);
await login.goto();
await login.login(config.secrets.ats.uiUser, config.secrets.ats.uiPass);
```

---

# 🌈 **5. Using the Component Layer (Recommended)**

DO NOT use raw selectors.

Use components like:

```ts
await page.locator('#btnLogin').click();    // ❌ WRONG
await login.loginButton.click();            // ✔ CORRECT
```

Components provide:

* retries
* stability waits
* friendly names
* annotated steps
* integrated logging
* consistent reporting

---

# 🧪 **6. Using Assertions**

## Hard Assertions (Stops the test)

```ts
await dashboardHeader.verifyVisible();
await statusLabel.verifyTextEquals("Active");
```

Use these for:

* login
* navigation
* page loads
* critical success criteria

## Soft Assertions (Non-blocking)

```ts
const soft = softAssertions();

await soft.component(profileName).textEquals("John Doe");
await soft.component(profileEmail).contains("@icims.com");

await soft.report(tabs);
```

Use these when you want:

* multiple validations
* complete test visibility
* clear RCA classification
* graceful cleanup

---

# 🔁 **7. Using the Data Factory Layer**

Data Factory is for all **test data setup**.

### Example:

```ts
const candidateFactory = new CandidateFactory(config.apiBaseUrl);
await candidateFactory.authenticate(config.secrets.adminUser, config.secrets.adminPass);

const candidate = await candidateFactory.create({
  resume: true
});
```

Use it for:

* job creation
* candidate creation
* user creation
* pre-populating workflow inputs
* test setup via API, not UI

This speeds up tests dramatically.

---

# 🧠 **8. Working With Tabs (TabManager)**

Use tab manager when:

* clicking a link opens a new tab
* PDFs or previews open
* external sites open
* SSO workflows happen
* multiple windows need coordination

### Example:

```ts
await jobPage.openPreviewPDF();

const pdfTab = await tabs.waitForNewTab("PDF Preview");
await tabs.switchTo("PDF Preview");

await pdfTab.getByText("Job Details").waitFor();
await tabs.switchTo("Main Tab");
```

Tab Manager provides:

* named tabs
* cleanup on failure
* correct RCA signals
* better evidence

---

# 🧩 **9. Step Annotation Patterns**

Every important step should be wrapped in:

```ts
await test.step("Action Name", async () => {
  ...
});
```

But since components + BaseComponent do this automatically, tests rarely need to write explicit steps.

---

# 📦 **10. Evidence Collector Integration**

Evidence collection happens automatically:

* logs
* trace
* video
* screenshots
* metadata
* LD snapshot
* tab snapshot
* RCA output
* soft assert summary

Developers do **not** need to do anything.

---

# 🧪 **11. Example: Full ATS E2E Test**

```ts
test('ATS - Recruiter creates and posts a job', async ({
  authPage,
  runPreChecks,
  logger,
  tabs
}) => {

  await runPreChecks();

  // Setup
  const jobFactory = new JobFactory(config.apiBaseUrl);
  await jobFactory.authenticate(config.secrets.adminUser, config.secrets.adminPass);

  const job = await jobFactory.create({
    title: "Automation Engineer",
    location: "NY",
    templateId: 1122
  });

  logger.info("Job created", job);

  // UI Flow
  const login = new LoginPage(authPage);
  await login.goto();
  await login.login(config.secrets.ats.uiUser, config.secrets.ats.uiPass);

  const dashboard = new DashboardPage(authPage);
  await dashboard.expectLoaded();

  const jobPage = new JobPostingPage(authPage);
  await jobPage.searchJob(job.id);
  await jobPage.openJob(job.id);

  // Validate via soft asserts
  const soft = softAssertions();

  await soft.component(jobPage.jobTitle).textEquals("Automation Engineer");
  await soft.component(jobPage.jobStatus).textEquals("Draft");

  await soft.report(tabs);
});
```

This is what a clean, enterprise-grade test looks like.

---

# 🔍 **12. Naming Conventions for Tests**

### Test Titles

Use business-oriented names:

```
ATS - Recruiter Creates Job Posting
ATS - Hiring Manager Approves Offer
ATS - Candidate Applies from LinkedIn
```

### Test Files

```
ats/job-posting/create-job.spec.ts
ats/candidate/apply-linkedIn.spec.ts
ats/offer/approve-offer.spec.ts
```

### Page Classes

```
JobPostingPage
CandidateApplicationPage
OfferApprovalPage
```

---

# 🔒 **13. Using Config & Secrets Correctly**

Always reference:

```ts
config.appBaseUrl
config.apiBaseUrl
secrets.adminUser
secrets.ats.uiPass
```

Never hardcode credentials or URLs.

---

# 😎 **14. Introducing Flows (Optional but Recommended)**

Flows are reusable business actions:

```ts
await ATSFlows.loginAsRecruiter(authPage);
await ATSFlows.createNewJobPosting(authPage, jobData);
await ATSFlows.routeToManager(authPage);
```

Flows improve:

* test readability
* reuse
* consistency
* maintenance

---

# 🧯 **15. Common Anti-Patterns to Avoid**

❌ Using raw selectors
❌ Hardcoding waits (`waitForTimeout`)
❌ Mixing UI and API logic in the same class
❌ Creating data via UI
❌ Not using pre-checks
❌ Not using component-friendly names
❌ Writing technical test titles
❌ Skipping soft assertion cleanup
❌ Writing overly technical tests

Follow the earlier docs for best practices.

---

# 🏁 **Summary**

Writing tests with this framework should be:

### ✔ Simple

### ✔ Readable

### ✔ Business-aligned

### ✔ Stable

### ✔ Evidence-rich

### ✔ RCA-friendly

### ✔ Scalable

### ✔ Component-driven

### ✔ CI-ready

This guide ensures developers produce consistent, high-quality tests.


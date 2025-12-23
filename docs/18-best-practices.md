
# **18 – Best Practices (Guidelines for Writing High-Quality Automation)**

This document outlines the **official best practices** for using and extending the framework.
These practices ensure that:

* automation remains stable
* test suites scale effectively
* developers write consistent, readable tests
* reporting and RCA remain meaningful
* customer environments can be reliably replicated
* business workflows stay accurately modeled

This guide is critical for any team member contributing to the automation platform.

---

# 🏛️ **1. Philosophy of Test Design**

The framework is built on five foundational principles:

### ✔ Stability

Avoid flakiness through components, retries, waits, governance, and pre-checks.

### ✔ Readability

Tests must read like business scenarios, not technical scripts.

### ✔ Isolation

Each test manages its own data, flows, and tabs.

### ✔ Observability

Every action must be traceable — logs, annotations, evidence collector.

### ✔ Maintainability

Structure code so it can evolve without breaking dozens of tests.

---

# 🧱 **2. Use the Component Layer Always**

### ❌ **Do NOT use `page.locator().click()` directly.**

### ✔ Use components:

```ts
await loginPage.username.fill("admin");
await loginPage.loginButton.click();
```

Benefits:

* friendly names
* retries
* stable waits
* annotated actions
* integrated logging
* RCA tagging
* clean reporting

---

# 🧩 **3. Each Page Should Contain Only UI Components**

Bad:

```ts
await page.click('#username');
await page.fill('#password', '123');
```

Good:

```ts
class LoginPage {
  username = new Input(this.page, '#username', 'Username Field');
  password = new Input(this.page, '#password', 'Password Field');
  loginButton = new Button(this.page, '#loginBtn', 'Login Button');
}
```

Keep **business logic out of components** and in **flow/page methods**.

---

# 📄 **4. Use Data Factory for Test Data Setup**

Avoid UI-driven data setup:

```ts
// ❌ very slow and flaky
await newUserUIFlow();
```

Instead:

```ts
const user = await userFactory.create({ role: 'RECRUITER' });
```

This ensures:

### ✔ Speed

### ✔ Clean test data

### ✔ Clear separation of concerns

### ✔ Reduced UI dependency

---

# 🧪 **5. Always Run Pre-Checks**

Every test must include:

```ts
await runPreChecks();
```

This enforces:

* environment health
* DoD compliance
* LD readiness
* network stability

Without this, tests may pass on dev machines but fail in CI.

---

# 🧭 **6. Use Hard Assertions ONLY for Critical Points**

Hard assertions cause immediate failure.

Use them for:

* login validation
* navigation
* existence of critical elements
* API response integrity

Example:

```ts
await dashboardHeader.verifyVisible();
```

---

# 🌈 **7. Use Soft Assertions for Validation-Heavy Steps**

Large flows require multiple validation points.

Example:

```ts
await soft.component(profileName).textEquals("John Doe");
await soft.component(email).contains("@icims.com");

await soft.report(tabs);
```

Soft assertions allow:

* multiple failures
* comprehensive failure reporting
* RCA tracking
* tab cleanup

---

# 📑 **8. Organize Tests by Business Domain, Not UI Screens**

Correct folder structure:

```
tests/specs/ats/job-posting
tests/specs/ats/candidate-management
tests/specs/ats/offer-flow
```

Wrong:

```
tests/specs/pages/login
tests/specs/pages/dashboard
```

Automation should reflect business workflows, not page structure.

---

# 📊 **9. Build Flows (Reusable Business Logic)**

Flows represent business tasks.

Example:

```ts
await ATSFlows.loginAsRecruiter(authPage);
await ATSFlows.createJobPosting(authPage);
await ATSFlows.routeToManager(authPage);
```

Flows can reuse:

* pages
* components
* factories
* assertions

Flows make tests short, readable, and consistent.

---

# 🧼 **10. Keep Page Objects Thin**

Avoid adding:

* business logic
* API calls
* data setup
* orchestration logic
* unrelated helper methods

Pages should primarily handle UI interaction.

---

# 🌐 **11. Tab Manager: Always Register and Switch Tabs Correctly**

When expecting a new tab:

```ts
const pdfTab = await tabs.waitForNewTab("Preview PDF");
await tabs.switchTo("Preview PDF");
```

Why?

* ensures predictable context
* prevents random tab switching
* integrates with RCA + evidence
* handles multi-window flows

---

# 🧠 **12. Use Friendly Names Everywhere**

Friendly names make logs readable:

```
[Username Field] fill("admin")
[Login Button] click()
[Status Label] textEquals("Active")
```

Friendly names appear in:

* Playwright reports
* evidence.zip
* console logs
* RCA categories
* Trend entries

---

# 🔒 **13. Never Hardcode Secrets**

Do NOT:

```ts
await login("admin", "password123");
```

Instead:

```ts
await login(config.secrets.ats.uiUser, config.secrets.ats.uiPass);
```

Secrets must come ONLY from:

* `.env`
* CI/CD environment variables

---

# 🔄 **14. Ensure Idempotent Test Data Creation**

Factories should:

* avoid creating duplicates
* cleanup after themselves
* generate unique test data per execution

Example:

```ts
email: `john.doe+${Date.now()}@test.com`
```

---

# 🕵️ **15. Integrate RCA by Design**

Design tests to support RCA:

* log any unexpected state
* throw errors when assumptions fail
* use friendly names for clarity
* ensure locators and errors are meaningful

RCA engine depends on clear error structures.

---

# 📦 **16. Ensure Evidence Is Always Relevant**

Evidence should reflect:

* what UI was doing
* what data was used
* what LD flags were active
* what tabs were open
* what assertions failed

Don’t produce irrelevant or excessive screenshots.

---

# 📐 **17. Organize Data Factory, Pages, Components Consistently**

Each type must live in its folder:

```
src/pages
src/components
src/data-factory
src/utils
src/api
```

Do not mix categories.

---

# 🧯 **18. Reduce Flakiness by Avoiding Sleep**

❌ Avoid:

```ts
await page.waitForTimeout(2000);
```

✔ Instead:

* wait for stable element
* use `exec()` retry logic
* use `waitForNetworkIdle`
* use Playwright built-in waits

---

# ⏱️ **19. Write Fast Tests by Default**

Tests should:

* avoid UI-heavy setup
* use API factories
* bypass unnecessary flows
* use prewarmed auth context
* reuse main context via fixtures
* rely on component-based interactions

A slow test is a liability.

---

# ⚙️ **20. Use Config & Secrets Properly**

Always use:

```ts
config.appBaseUrl
config.executionMode
secrets.ldKey
```

Do NOT hardcode environment-specific behavior.

---

# 🧬 **21. Prefer ID/ARIA/Role Based Locators Over CSS**

Priority order:

1. `getByRole()`
2. `getByLabel()`
3. `getByText()`
4. IDs
5. ARIA attributes
6. Last resort: CSS

This improves:

* accessibility
* reliability
* readability

---

# 📚 **22. Consistent Naming Conventions**

### Components:

```
Login Button  
Username Field  
Dashboard Header  
```

### Test names:

```
ATS - Recruiter Creates Job Posting
ATS - Candidate Applies via External Portal
```

### Page class names:

```
LoginPage
DashboardPage
CandidateProfilePage
```

---

# 🎯 **23. Fail Fast in Setup, Fail Late in Validation**

* Hard assert for critical steps
* Soft assert for validation-heavy flows

This maximizes information while keeping tests reliable.

---

# 🎨 **24. Keep Tests Business-Oriented**

Tests should read like steps a user would perform:

```ts
test('Hiring Manager approves offer', async ({ authPage }) => {
  await ATSFlows.loginAsHiringManager(authPage);
  await ATSFlows.openPendingOffer(authPage);
  await ATSFlows.approveOffer(authPage);
});
```

Avoid describing technical interactions.

---

# 🎉 Summary

These best practices ensure that the framework and test suite remain:

### ✔ Stable

### ✔ Scalable

### ✔ Reliable

### ✔ Readable

### ✔ Maintainable

### ✔ Enterprise-grade

They help all contributors write tests that:

* align with business workflows
* integrate with framework components
* avoid flakiness
* support RCA + evidence
* remain future-proof


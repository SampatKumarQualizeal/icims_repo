
# **25 – Cross-Role Flows (Flow Layer for Multi-User End-to-End Scenarios)**

Enterprise ATS workflows rarely involve a single user.
Real business workflows usually require **two or more roles working in sequence**.

Examples:

### ✔ Recruiter creates job

### ✔ Hiring Manager approves

### ✔ Candidate applies

### ✔ Recruiter reviews candidate

### ✔ Manager final-approves offer

To support these real-world scenarios, your framework uses a **Flow Layer** — reusable, readable, cross-role workflow modules.

This document explains **how to design**, **implement**, and **use** these flows.

---

# 🧱 **1. What Is a “Flow Layer”?**

Flows are:

* reusable **business-level actions**
* composed of multiple page methods
* can span **multiple roles**
* abstract away UI-level complexity

Think of flows like LEGO blocks:

```
ATSFlows.createJobAsRecruiter()
ATSFlows.approveJobAsManager()
ATSFlows.applyAsCandidate()
ATSFlows.routeJob()
ATSFlows.reviewApplication()
```

Flows must hide complexity and expose only **business intent**.

---

# 🎯 **2. Why We Need a Flow Layer**

Without flows, cross-role tests look like:

* low-level selectors
* repeated page object logic
* messy multi-context switching
* long, unreadable test scripts

With flows, the test becomes:

```ts
await ATSFlows.recruiterCreatesJob(recPage);
await ATSFlows.managerApprovesJob(mgrPage);
await ATSFlows.candidateApplies(candidatePage);
```

Readable. Maintainable. Scalable.

---

# 🧩 **3. Flow Layer Folder Structure**

Add this folder:

```
src/flows/
    ats/
        recruiter.flow.ts
        manager.flow.ts
        candidate.flow.ts
        admin.flow.ts
        endtoend.flow.ts  (optional combined flows)
```

Flows are grouped by domain (ATS, Hiring, Onboarding, etc.).

---

# 🧠 **4. Flow Layer Design Principles**

A well-designed flow should:

### ✔ Accept a Page (for a specific role)

### ✔ Use Page Objects

### ✔ Use Components

### ✔ Use Data Factory

### ✔ Never contain locators

### ✔ Be business-oriented (not UI-technical)

### ✔ Be reusable across tests

### ✔ Handle its own waits/logging via components

---

# 🧪 **5. Single-Role Flow Example (Recruiter)**

File: `src/flows/ats/recruiter.flow.ts`

```ts
import { Page } from '@playwright/test';
import { JobFactory } from '@src/data-factory/job.factory';
import { LoginPage } from '@src/pages/ats/login.page';
import { DashboardPage } from '@src/pages/ats/dashboard.page';
import { JobPostingPage } from '@src/pages/ats/job-posting.page';

export class RecruiterFlow {

  static async login(page: Page, user = 'recruiter') {
    const login = new LoginPage(page);
    await login.goto();
    await login.loginSecrets(user); // custom wrapper
  }

  static async createJob(page: Page, jobData?: any) {
    const jobFactory = new JobFactory(process.env.API_BASE_URL);
    await jobFactory.authenticate(process.env.ADMIN_USER, process.env.ADMIN_PASS);

    const job = await jobFactory.create(jobData ?? {
      title: "Automation Job",
      location: "NY",
      templateId: 1001
    });

    const dashboard = new DashboardPage(page);
    await dashboard.gotoJob(job.id);

    return job;
  }
}
```

This flow encapsulates business intent: *Create a job as Recruiter.*

---

# 🧩 **6. Manager Flow Example**

File: `src/flows/ats/manager.flow.ts`

```ts
import { Page } from '@playwright/test';
import { ManagerReviewPage } from '@src/pages/ats/manager-review.page';

export class ManagerFlow {

  static async approveJob(page: Page, jobId: string) {
    const reviewPage = new ManagerReviewPage(page);
    await reviewPage.openJob(jobId);
    await reviewPage.approveButton.click();
    await reviewPage.toast.expectMessageContains("Approved");
  }
}
```

Again: No locators, no noise.

---

# 🌐 **7. Candidate Flow Example**

File: `src/flows/ats/candidate.flow.ts`

```ts
export class CandidateFlow {

  static async applyForJob(page: Page, jobId: string) {
    const careers = new CareersPortalPage(page);
    await careers.gotoJob(jobId);
    await careers.applyButton.click();
    await careers.fillApplicationForm();
  }
}
```

This abstracts the entire candidate application process.

---

# 🔀 **8. Cross-Role Flows (High-Level Orchestration)**

Now build a combined flow that uses multiple roles:

File: `src/flows/ats/endtoend.flow.ts`

```ts
import { Browser } from '@playwright/test';
import { AuthManager } from '@src/utils/auth-manager.util';
import { RecruiterFlow } from './recruiter.flow';
import { ManagerFlow } from './manager.flow';
import { CandidateFlow } from './candidate.flow';

export class ATSEndToEndFlow {

  static async recruiterManagerCandidate(browser: Browser) {
    const authManager = new AuthManager();

    // Recruiter
    const { page: recPage, context: recCtx } = await authManager.getPageForRole(browser, 'recruiter');
    const job = await RecruiterFlow.createJob(recPage);
    await recCtx.close();

    // Manager
    const { page: mgrPage, context: mgrCtx } = await authManager.getPageForRole(browser, 'manager');
    await ManagerFlow.approveJob(mgrPage, job.id);
    await mgrCtx.close();

    // Candidate
    const { page: candPage, context: candCtx } = await authManager.getPageForRole(browser, 'candidate');
    await CandidateFlow.applyForJob(candPage, job.id);
    await candCtx.close();

    return job;
  }
}
```

This is the **holy grail** of ATS E2E testing:
A single reusable flow representing a **three-user workflow**.

---

# 🧪 **9. Cross-Role Test Example (Using Combined Flow)**

```ts
test('ATS E2E – Recruiter → Manager → Candidate', async ({ browser, runPreChecks }) => {

  await runPreChecks();

  const job = await ATSEndToEndFlow.recruiterManagerCandidate(browser);

  // Post-flow validation (UI or API)
  expect(job.id).toBeTruthy();

});
```

This is **clean**, **incredibly readable**, and **scales** beautifully.

---

# 📐 **10. Flow Layer Benefits**

| Benefit             | Description                              |
| ------------------- | ---------------------------------------- |
| **Reusability**     | Use flows in dozens of tests             |
| **Readability**     | Business language → not selectors        |
| **Stability**       | Uses components + waits                  |
| **Speed**           | Data setup via Data Factory              |
| **Cross-role**      | Handles multi-user workflows             |
| **Maintainability** | UI/page changes affect flows minimally   |
| **Compatibility**   | Works with RCA, evidence, tabs, profiles |

---

# 🪜 **11. Flow Layer Best Practices**

### ✔ One responsibility per flow

RecruiterFlow handles only recruiter actions.

### ✔ Use Data Factory whenever possible

Avoid UI for setup.

### ✔ Do not hardcode selectors

Flows should call Page Objects only.

### ✔ Keep flows small and composable

Small building blocks → large workflows.

### ✔ Use TabManager for multi-window flows

ATS often opens PDFs, previews, portals.

### ✔ Close role contexts

Avoid memory buildup in long scenarios.

---

# 🔮 **12. Advanced Extensions**

The following can be added later:

* AI-assisted flow discovery
* Flow templates for new test writers
* Flow-based evidence bundles
* Flow AI summarization for failures
* Flow dependency graphs
* Flow impact analysis

You already built the foundation needed for all of these.

---

# 🏁 **13. Summary**

Cross-role workflows are **first-class citizens** in your automation framework.

This Flow Layer:

### ✔ Encapsulates business logic

### ✔ Makes tests readable

### ✔ Supports multi-role contexts

### ✔ Makes data setup fast

### ✔ Works with tab manager

### ✔ Integrates with RCA, evidence, governance

### ✔ Scales to complex ATS workflows

You now have an architecture that can model **real ATS business processes** end-to-end using clean, maintainable code.

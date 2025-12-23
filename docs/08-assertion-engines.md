# **08 – Assertion Engines (Hard & Soft Assertions)**

The framework provides **two complementary assertion engines**:

1. **Hard Assertions** – stop execution immediately on failure
2. **Soft Assertions** – record failures but allow execution to continue

Together they provide:

* clear validation semantics
* readable reporting
* stability in long E2E flows
* better RCA visibility
* enhanced evidence logging
* reduced flakiness in large business workflows

Assertions play a central role in both **framework-level reliability** and **test maintainability**.

---

# 🎯 **Why Two Types of Assertions?**

Traditional automation frameworks rely solely on “hard” assertions:

```ts
expect(value).toBe(expected);
```

But this causes:

* premature failure → entire test aborted
* limited visibility → only the first failure noticed
* noisy CI pipelines → harder RCA
* unreadable cascading failures

Large workflows (job posting, onboarding, ATS flows) often need to validate **multiple UI elements** before deciding whether to fail.

The solution:

* **Hard ASSERT** → for critical steps
* **Soft ASSERT** → for validation-heavy sections

This architecture delivers both reliability and completeness.

---

# 🧱 **1. Hard Assertions (Generic)**

Hard assertions are implemented in:

```
src/utils/assert-generic.util.ts
```

They wrap the standard expectations into a clean `assertThat()` API.

### 📌 Example Usage

```ts
assertThat(status).equals("ACTIVE");
assertThat(totalRecords).greaterThan(0);
assertThat(message).contains("Success");
```

### 📌 Hard Assertion Features

| Feature                       | Description                                 |
| ----------------------------- | ------------------------------------------- |
| **Fail Fast**                 | Immediately stops execution                 |
| **Component-Friendly**        | Works inside BaseComponent verify methods   |
| **Consistent Error Messages** | Human-readable output                       |
| **Integrates with RCA**       | Hard failures are categorized in governance |
| **Used for Mandatory Steps**  | Login success, navigation success, etc.     |

### 📌 Available Assertion Methods

* `equals(expected)`
* `notEquals(expected)`
* `truthy()`
* `falsy()`
* `contains(text)`
* `startsWith(prefix)`
* `endsWith(suffix)`
* `greaterThan(n)`
* `lessThan(n)`
* `deepEquals(expected)`

### 📌 Hard Assertion in a Component

```ts
await dashboardHeader.verifyVisible();
await jobStatusLabel.verifyTextEquals("Posted");
```

These automatically:

* log actions
* annotate steps
* retry underlying locators
* provide high signal for RCA

---

# 🧩 **2. Component-Level Assertions**

Every component offers built-in assertion helpers, powered by BaseComponent:

```ts
await component.verifyVisible();
await component.verifyExists();
await component.verifyTextEquals("Manager");
await component.verifyHidden();
await component.verifyNotExists();
```

### ✨ Benefits:

* uniform assertions across all components
* automatic annotations
* readable logs
* retry & stability powered
* integrates with hard & soft assertion engines

These are the recommended way to assert UI state.

---

# 🌈 **3. Soft Assertions (Non-blocking)**

Soft assertions allow tests to **accumulate multiple failures** and report later.

This is implemented in:

```
src/utils/assert-soft.util.ts
```

### ✔ Key Features

| Feature                                  | Description                                          |
| ---------------------------------------- | ---------------------------------------------------- |
| **Does NOT stop execution**              | Continues after failure                              |
| **All failures logged**                  | Collected in an internal array                       |
| **Fully annotated in Playwright report** | Shows step-level soft assert failures                |
| **Friendly messages**                    | `[Soft Assert Failed] Username Field is not visible` |
| **Works with components**                | soft.component(header).textEquals("Dashboard")       |
| **Supports grouping**                    | soft.group("Profile Validation")                     |
| **RCA categorization**                   | Integrated directly                                  |
| **Tab cleanup**                          | Closes leftover tabs when soft asserts fail          |

---

# 📝 **Soft Assertions API**

### Create a soft assert collector:

```ts
const soft = softAssertions();
```

### Soft assertion patterns:

#### A) **Generic Value Assertions**

```ts
await soft.assertThat(total).greaterThan(5);
await soft.assertThat(status).equals("ACTIVE");
await soft.assertThat(response.ok).truthy();
```

#### B) **Component Assertions**

```ts
await soft.component(usernameField).visible();
await soft.component(header).textEquals("Dashboard");
await soft.component(saveButton).exists();
```

#### C) **Tab Assertions**

```ts
await soft.tabs(tabs).exists("Preview PDF");
await soft.tabs(tabs).active("Main Tab");
await soft.tabs(tabs).count(2);
```

#### D) **Grouped Assertions**

```ts
await soft.group("Profile Validation", async (s) => {
  await s.component(profileName).textEquals("John Doe");
  await s.component(profileEmail).textContains("@icims.com");
});
```

This produces readable grouped results:

```
▶ [Soft Assert Group] Profile Validation
   ✔ Component: Profile Name == John Doe
   ❌ Component: Profile Email does not contain "@icims.com"
```

---

# 🧪 **4. Soft Assertion Failure Reporting**

At the end of the test or flow, call:

```ts
await soft.report(tabs);
```

This triggers:

### ✔ Failure summary

Printed and logged:

```
===== SOFT ASSERT FAILURES (2) =====
1. Expected Dashboard Header to be visible
2. Expected Username Field to equal "admin"
=====================================
```

### ✔ RCA Categorization

Your actual soft assert implementation generates:

```
[Soft Assert RCA] Categorizing failure
Category: ASSERTION_FAILURE
Confidence: 80
SuggestedAction: Validate expected test data
```

### ✔ Tab Cleanup

Automatically closes all tabs except Main Tab when soft assertions fail.

---

# 🔥 **5. How Soft Assertions Look in Playwright Step Reports**

Soft assert steps appear **indented and annotated**, for example:

```
▶ [Soft Assert] Assert Text Equals "John Doe": Profile Name
   ❌ [Soft Assert Failed] Profile Name != "John Doe"
```

They are easy to understand and navigate.

---

# 🧩 **6. Hard vs. Soft Assertions — When to Use Which**

| Scenario                               | Recommended         |
| -------------------------------------- | ------------------- |
| Login, Navigation, Authentication      | **Hard**            |
| Verifying business-critical conditions | **Hard**            |
| Verifying multiple UI properties       | **Soft**            |
| Large E2E flows                        | **Soft + Hard Mix** |
| Non-critical cosmetic checks           | **Soft**            |
| Validating 20+ attributes at once      | **Soft Group**      |

---

# ⚠️ **7. Soft Assertions + TabManager**

Soft assertions are fully aware of tab context.

Example:

```ts
await soft.tabs(tabs).opened("PDF Preview");
await soft.tabs(tabs).active("PDF Preview");
await soft.tabs(tabs).count(2);
```

If soft assertions fail:

* leftover tabs are cleaned
* tab listing is logged
* RCA sees it as a TAB_WINDOW_ISSUE if applicable
* evidence collector captures tab snapshot

---

# 🧠 **8. Integration with Evidence Collector & RCA Engine**

Soft assertion failures automatically:

### ✔ Produce `rca.json`

Stored in:

```
evidence/<test-id>/meta/rca.json
```

### ✔ Provide RCA suggestions

For example:

```
"category": "UI_ELEMENT_NOT_FOUND",
"confidence": 89,
"suggestedAction": "Verify selector or DOM changes"
```

This is **next-level intelligence** in automation reporting.

---

# 📦 **9. Example: Using Soft Assertions in a Real Test**

```ts
test('CW - Create Job', async ({ authPage, runPreChecks, tabs }) => {
  await runPreChecks();

  const soft = softAssertions();

  const jobPage = new JobPage(authPage);

  await jobPage.goto();
  await jobPage.createJob("Manager");

  await soft.component(jobPage.header).textEquals("Job Details");
  await soft.component(jobPage.status).textEquals("Draft");
  await soft.tabs(tabs).count(1);

  await soft.report(tabs);     // finalize soft asserts (with RCA)
});
```

### Report trace:

```
✔ Fill(Title Field)
✔ Select(Role Dropdown)
✔ Click(Create Button)

❌ Soft Assert: Expected Job Status == "Draft"
❌ Tab Count == 1 (found 2)

▶ [Soft Assert RCA] Categorizing failure
   Category: ASSERTION_FAILURE
   Confidence: 82%

▶ [Soft Assert Cleanup]
   Closed: Preview PDF
```

---

# 🧭 **10. Design Principles of Assertion Engines**

### ✔ **Readability-first**

Every step generates human-readable messages.

### ✔ **Recoverability**

Soft assertions allow deeper insight during long tests.

### ✔ **Integration-centric**

Assertions interact with:

* logger
* base component
* RCA engine
* trend engine
* evidence collector

### ✔ **Modern UI Testing Philosophy**

Assertions are tied to *business components*, not locators.

---

# 🏁 **Summary**

This framework provides a **state-of-the-art assertion ecosystem**, combining:

* Hard assertions for strict validation
* Soft assertions for exploratory and multi-check validation
* Component assertions for UI semantic stability
* Tab-aware checks for complex multi-window tests
* Automatic RCA + evidence bundling
* Friendly logs and Playwright step annotations

Assertions are the bridge between **business expectations** and **test execution**, and this framework elevates them to an enterprise-grade standard.


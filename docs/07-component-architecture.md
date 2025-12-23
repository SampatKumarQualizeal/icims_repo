
# **07 – Component Architecture**

The Component Architecture is one of the **most important pillars** of your automation framework.
It transforms raw Playwright locators into **semantic, business-readable, maintainable, self-healing UI abstractions**.

This design follows principles from:

* Page Object Model (POM)
* Screenplay / Actor Model
* Component-Based Automation
* Stable execution through adaptive waits & retries
* Observability-first automation

---

# 🎯 **Why a Component Layer?**

Traditionally, UI automation uses raw locators:

```ts
await page.click('#btnLogin');
await page.fill('#txtUser', 'admin');
```

This leads to:

* brittle tests
* low readability
* duplicate logic
* test code tightly coupled to DOM structure
* poor reporting context

The **Component Layer** solves this by introducing typed, semantic, reusable component classes.

For example:

```ts
await loginPage.username.fill("admin");
await loginPage.password.fill("pass");
await loginPage.loginButton.click();
```

Tests become:

* readable
* expressive
* DRY
* traceable in logs and reports
* easier to maintain

---

# 🧱 **1. Component Architecture Overview**

```
src/components/
  base.component.ts
  button.component.ts
  input.component.ts
  dropdown.component.ts
  toast.component.ts
  modal.component.ts
  tab-manager.component.ts
  locator.util.ts
```

Every component:

* Extends **BaseComponent**
* Has its own actions (`click`, `fill`, `select`, etc.)
* Provides assertions (`verifyVisible`, `verifyTextEquals`, etc.)
* Supports **friendly names** (for reporting/logging)
* Uses the unified `exec()` wrapper for:

  * retries
  * stability waits
  * adaptive wait profiles
  * annotation (“Login Button clicked”)
  * soft/hard assertion integration

---

# 🧩 **2. BaseComponent — The Heart of All UI Components**

### Features provided by BaseComponent:

* access to `page`
* typed `Locator`
* friendly component name
* unified execution wrapper
* adaptive waits (`waitForVisibleAndStable`)
* retries (`retryWithBackoff`)
* logs + annotations for each action
* component-level assertions

### Key Responsibilities

```ts
export abstract class BaseComponent {
  protected page: Page;
  protected selector: string | Locator;
  protected friendlyName: string;
  protected logger: Logger;

  // core execution wrapper
  protected async exec(label: string, fn: (loc: Locator) => Promise<T>, options?: {...})
```

**exec()** is responsible for:

* automatic annotation
* logging with friendly name
* retries & backoff
* stability checks
* screenshot/tracing options via execution profile

### Example (auto generated)

Logs become:

```
[Component] Login Button → click()
[Action] Filling Username
[Component] Dropdown (Role) → select("Manager")
```

---

# 🎨 **3. Friendly Names (Human-readable Step Names)**

Instead of:

```
#btnLogin
#username
#password
```

You structure your components like:

```ts
new Button(page, '#btnLogin', 'Login Button');
new Input(page, '#username', 'Username Field');
new Input(page, '#password', 'Password Field');
```

This automatically makes test steps descriptive:

```
[Login Button] click()
[Username Field] fill('admin')
[Password Field] fill('******')
```

These names appear in:

* Playwright HTML Report
* EvidenceCollector artifacts
* Logs
* RCA categorization
* TrendStore
* Slack/Teams notifications

---

# ⚙️ **4. Component Types (Provided By Framework)**

## 📌 **Button Component**

```ts
await loginButton.click();
await submitButton.clickAndWaitForNavigation();
```

Features:

* click
* click with navigation
* retry logic
* stability wait
* annotated steps

---

## 📌 **Input Component**

```ts
await username.fill("john");
await notes.type("Hello", 50);
await search.clear();
```

Features:

* fill
* type with delay
* clear
* supports soft/hard assertions via BaseComponent

---

## 📌 **Dropdown Component**

```ts
await roleDropdown.select("Manager");
await portalDropdown.pickByText("LinkedIn");
```

Supports both:

* value selection
* text-based selection

---

## 📌 **Modal Component**

```ts
await modal.expectOpen();
await modal.close();
```

Handles:

* async visibility
* close buttons (`.close`, `[aria-label=Close]`)
* annotated modal actions

---

## 📌 **Toast Component**

```ts
await toast.expectMessageContains("Saved successfully");
```

Useful for:

* confirmation toasts
* warning banners
* async notifications

---

## 📌 **TabManager Component**

A major innovation of this framework.

```ts
await tabs.switchTo("Candidate Details");
await tabs.waitForNewTab("Preview PDF");
await tabs.assert.active("Main Tab");
```

Manages:

* tab registration
* active tab tracking
* new-tab detection
* cleanup on failure
* tab-level assertions
* integration with evidence collector (tabs.snapshot.json)

---

# 📏 **5. Component-Level Assertions (Built-in)**

Every component inherits:

* `verifyVisible()`
* `verifyHidden()`
* `verifyExists()`
* `verifyNotExists()`
* `verifyTextEquals(value)`
* `verifyTextContains(value)`

Used like:

```ts
await submitButton.verifyVisible();
await dashboardHeader.verifyTextEquals("Dashboard");
```

Or via soft assertions:

```ts
await soft.component(dashboardHeader).visible();
await soft.component(profileNameLabel).textEquals("John Doe");
```

All assertion steps are annotated and logged.

---

# 🌐 **6. Execution Profiles (Fast / Safe / Debug)**

Components use `getExecutionProfile()` inside `exec()`:

### FAST

* minimal waits
* fewer retries
* useful for local runs

### SAFE

* more retries
* more stability waits
* ideal for unstable CI environments

### DEBUG

* verbose logs
* screenshots per step
* trace per action

---

# 🧠 **7. Automatic Step Annotation**

Every action automatically wraps itself in:

```ts
test.step(`[Component] ${friendlyName} - ${action}`, async () => {
   ...
});
```

This produces a **step tree** in Playwright reports:

```
► Login Flow
   ► Username Field : fill
   ► Password Field : fill
   ► Login Button : click
   ► Dashboard Header : verifyVisible
```

This bridges the gap between test code and business flow.

---

# 🛡️ **8. Error Handling & Resilience**

The component architecture provides:

### ✔ Isolated failures

Failures in one component do not affect others.

### ✔ Retried actions

Transient UI flakiness mitigated.

### ✔ Adaptive waits

UI becomes stable before interaction.

### ✔ RCA classification

If interaction fails (timeout, not found, blocked), the failure categorizer identifies the cause (UI_TIMEOUT, UI_ELEMENT_NOT_FOUND).

---

# 📦 **9. Component Definition Pattern (Recommended)**

Every component should follow this pattern:

```ts
export class Button extends BaseComponent {
  constructor(page: Page, selector: string | Locator, friendlyName: string) {
    super(page, selector, friendlyName);
  }

  async click() { ... }
  async clickAndWaitForNavigation() { ... }
}
```

Rules:

* Always take (page, selector, friendlyName)
* Never expose raw locators inside tests
* Keep components thin; heavy logic goes to Pages/Flows

---

# 🏗️ **10. Components in Practice**

### In a Page Object:

```ts
export class LoginPage {
  username = new Input(this.page, '#username', 'Username Field');
  password = new Input(this.page, '#password', 'Password Field');
  loginButton = new Button(this.page, '#btnLogin', 'Login Button');

  async login(u, p) {
    await this.username.fill(u);
    await this.password.fill(p);
    await this.loginButton.click();
  }
}
```

### In a test:

```ts
test('Login flow', async ({ authPage }) => {
  const login = new LoginPage(authPage);

  await login.login("admin", "adminPass");
});
```

Readable, stable, maintainable.

---

# 🔚 **Summary**

The Component Architecture gives your framework:

### ✔ Stability

Retries + stability waits

### ✔ Readability

Human-friendly names

### ✔ Traceability

Step-annotated actions

### ✔ Maintainability

Centralized component logic

### ✔ Business Alignment

Readable component names = clear test reports

### ✔ RCA Intelligence

Component-level failures categorized

### ✔ Enterprise Quality

UI abstraction similar to Workday, Salesforce, ServiceNow internal frameworks

This architecture is the foundation for:

* Flow objects
* Higher-level business workflows
* Auto-doc generation
* Dashboard-level analytics
* AI-driven self-healing

# 🤖 AI Guidelines for Framework Code Generation

**Version**: 2.2  
**Last Updated**: December 19, 2025  
**Purpose**: Enable any LLM to convert Playwright codegen output to framework-compliant code with ZERO refactoring

**Recent Updates (v2.2)**:
- ✅ Added **Rule 10**: Handle Backend Async Operations with Conditional Retry (Component Layer Refactoring)
- ✅ Added **Anti-Pattern 13**: Unnecessary Waits When Operation Succeeds Early
- ✅ Enhanced Component Layer: Eliminated direct Playwright calls in Dropdown, NavDrawer, Tree components
- ✅ Centralized Timeout Configuration: All components now use execution profile timeouts
- ✅ Added Stability Waits: Dropdown overlays now wait for animation completion
- 📚 Based on lessons learned from component layer analysis (3 components fixed, 15+ hardcoded timeouts eliminated)

**Previous Updates (v2.1)**:
- ✅ Added **Rule 4**: Flow Classes MUST Extend BaseFlow (Phase 3 Refactoring)
- ✅ Added **Rule 6**: NO Raw Locators in Flow Methods (Phase 2 Refactoring)
- ✅ Enhanced **Rule 2**: NO Hard Waits with detailed guidance on `waitForLoadState()` (Phase 1 Refactoring)
- ✅ Added **Anti-Pattern 9**: Using Raw Locators in Flow Methods
- ✅ Added **Anti-Pattern 10**: Constructor Boilerplate Duplication
- ✅ Added **Anti-Pattern 11**: Unnecessary `waitForLoadState('networkidle')`
- 📚 Based on lessons learned from production refactoring (52 LOC removed, 13 hard waits eliminated, 6 violations fixed)

---

## 📋 Table of Contents

1. [Critical Rules](#critical-rules)
2. [Quick Reference: Common Mistakes](#quick-reference-common-mistakes)
3. [Framework Architecture](#framework-architecture)
4. [Page Object Generation](#page-object-generation)
5. [Flow Generation](#flow-generation)
6. [Test Spec Generation](#test-spec-generation)
7. [Component Library](#component-library)
8. [Iframe Handling](#iframe-handling)
9. [Common Codegen Patterns → Framework Patterns](#common-codegen-patterns--framework-patterns)
10. [Anti-Patterns (NEVER DO THIS)](#anti-patterns-never-do-this)
11. [Complete Examples](#complete-examples)
12. [Validation Checklist](#validation-checklist)

---

## 🚀 Quick Reference: Common Mistakes

**Based on production refactoring of 35+ files, here are the most common anti-patterns to avoid:**

### **1. Hard Waits** ❌
```typescript
// ❌ NEVER DO THIS
await page.waitForTimeout(2000);

// ✅ DO THIS INSTEAD
await button.click(); // Component auto-waits
```

### **2. Unnecessary `waitForLoadState('networkidle')`** ❌
```typescript
// ❌ NOT NEEDED - Button click doesn't navigate
await this.submitBtn.click();
await this.page.waitForLoadState('networkidle');

// ✅ ONLY after actual navigation
await this.navLink.click(); // Changes URL
await this.page.waitForLoadState('networkidle');
```

### **3. Raw Locators in Flows** ❌
```typescript
// ❌ NEVER DO THIS in flow methods
await this.page.getByRole('button').click();

// ✅ DO THIS INSTEAD - use page object methods
await this.portalPage.clickApply();
```

### **4. Constructor Boilerplate** ❌
```typescript
// ❌ DON'T REPEAT THIS in every flow
export class MyFlow {
  private base: BaseTest;
  private page: Page;
  constructor(baseTest: BaseTest, page: Page) {
    this.base = baseTest;
    this.page = page;
  }
}

// ✅ DO THIS INSTEAD - extend BaseFlow
import { BaseFlow } from '@src/utils/base-flow.util';

export class MyFlow extends BaseFlow {
  constructor(baseTest: BaseTest, page: Page) {
    super(baseTest, page);
    // this.base and this.page inherited automatically
  }
}
```

### **5. Direct Locators in Page Object Methods** ❌
```typescript
// ❌ DON'T use raw locators in methods
async clickSubmit() {
  await this.page.locator('#submit').click();
}

// ✅ DO declare components in constructor
readonly submitBtn: Button;

constructor(page: Page) {
  super(page, page.locator('body'), 'Page');
  this.submitBtn = new Button(page, page.locator('#submit'), 'Submit');
}

async clickSubmit() {
  await this.section('Click submit', async () => {
    await this.submitBtn.click();
  });
}
```

### **Refactoring Stats:**
- **Phase 1**: 13 hard waits removed → 9 files
- **Phase 2**: 6 raw locator violations fixed → 1 file
- **Phase 3**: 52 lines of constructor boilerplate removed → 26 files
- **Total Impact**: 71 LOC eliminated, zero flakiness introduced

---

## 🚨 CRITICAL RULES

### **Rule 1: NO `resolveLocator()` Method**
```typescript
// ❌ WRONG - resolveLocator was removed
const buttonLoc = this.resolveLocator('#submit');

// ✅ CORRECT - Use frame locators directly
this.submitBtn = new Button(page, frameLocator.locator('#submit'), 'Submit');
```

### **Rule 2: NO Hard Waits**
```typescript
// ❌ WRONG - Hard waits are NEVER acceptable
await page.waitForTimeout(2000);
await page.waitForTimeout(1500);
await this.page.waitForTimeout(500);

// ✅ CORRECT - Let components auto-wait
await button.click(); // Button component handles waiting
await input.fill('value'); // Input component handles waiting
await dropdown.selectOption('option'); // Dropdown handles waiting

// ✅ CORRECT - Use waitForLoadState only after ACTUAL navigation
await this.navLink.click(); // Navigates to new page
await page.waitForLoadState('networkidle'); // OK - real navigation occurred

// ❌ WRONG - Unnecessary networkidle after non-navigation clicks
await this.submitBtn.click(); // Just submits form via AJAX
await page.waitForLoadState('networkidle'); // Unnecessary!

// ✅ CORRECT - Use component expectations for synchronization
await this.successMessage.expectVisible(); // Waits for specific element
await this.loadingSpinner.expectHidden(); // Waits for loading to finish
```

**STRICT RULES:**
- ❌ **NEVER** use `page.waitForTimeout()` or `this.page.waitForTimeout()`
- ❌ **AVOID** `waitForLoadState('networkidle')` unless actual page navigation occurs
- ✅ **ALWAYS** rely on component auto-wait behavior
- ✅ **USE** component expectations for specific conditions (`expectVisible()`, `expectHidden()`, etc.)

**When `waitForLoadState('networkidle')` is acceptable:**
- After clicking links that navigate to new URL
- After form submission that causes page redirect
- After login that navigates to dashboard
- After clicking "Back" or "Next" in multi-page wizards

**When `waitForLoadState('networkidle')` is NOT needed:**
- After button clicks in single-page apps (React, Angular, Vue)
- After dropdown selections
- After filling input fields
- After opening/closing modals
- After AJAX requests (use component expectations instead)

**Phase 1 Refactoring Results:**
- Removed 13 hard waits across 9 files
- Tests became faster and more reliable
- Zero flakiness introduced

### **Rule 3: Single Locator Per Component**
```typescript
// ❌ WRONG - Multiple selectors chained with .or()
const button = new Button(
  page,
  frame.locator('#btn').or(frame.getByRole('button')).or(frame.locator('.btn')),
  'Button'
);

// ✅ CORRECT - Single, simple locator + TODO if needed
const button = new Button(
  page,
  frame.locator('#submit-btn'), // TODO: Verify actual selector
  'Submit Button'
);
```

### **Rule 4: Flow Classes MUST Extend BaseFlow**
```typescript
// ❌ WRONG - Repetitive constructor boilerplate
export class JobFlow {
  private base: BaseTest;
  private page: Page;
  
  constructor(baseTest: BaseTest, page: Page) {
    this.base = baseTest;
    this.page = page;
    // ... instantiate page objects
  }
}

// ✅ CORRECT - Extend BaseFlow to eliminate boilerplate
import { BaseFlow } from '@src/utils/base-flow.util';

export class JobFlow extends BaseFlow {
  constructor(baseTest: BaseTest, page: Page) {
    super(baseTest, page);
    // this.base and this.page available automatically via inheritance
    this.jobSearchPage = new JobSearchPage(page);
    this.jobCreatePage = new JobCreatePage(page);
  }
  
  async createJob(data: any) {
    // Access this.base and this.page from BaseFlow
    await this.base.logger.section('Create job', async () => {
      await this.jobCreatePage.fill(data);
    });
  }
}
```

**STRICT RULES:**
- ✅ **ALL** flow classes MUST extend `BaseFlow`
- ✅ **ALWAYS** call `super(baseTest, page)` in constructor
- ✅ **NEVER** declare `private base: BaseTest` or `private page: Page` (inherited from BaseFlow)
- ✅ **ACCESS** `this.base` and `this.page` directly in flow methods
- ✅ **IMPORT** both `BaseTest` and `BaseFlow` in flow files

**BaseFlow provides:**
- `protected readonly base: BaseTest` - Test utilities and logger
- `protected readonly page: Page` - Playwright page instance
- Consistent pattern across all flows
- Single place to add common flow functionality

**Exception:**
- Flows that only use `Page` (no `BaseTest`) should NOT extend BaseFlow
- Example: Simple search/utility flows that don't need test context

**Phase 3 Refactoring Results:**
- 26 flows migrated to extend BaseFlow
- 52 lines of duplicate code eliminated
- All flows follow consistent inheritance pattern

### **Rule 5: 4-Step Constructor Pattern**
```typescript
constructor(page: Page) {
  // STEP 1: Resolve iframe/frame context (if needed)
  const frame = page.frameLocator('[data-testid="main-body-iframe"]');
  
  // STEP 2: Call super with frame root
  super(page, frame.locator('body'), 'Page Name');
  
  // STEP 3: Store frameLocator for later use (SKIP - no intermediate vars)
  this.frameLocator = frame;
  
  // STEP 4: Instantiate components with direct frame locators
  this.button = new Button(page, frame.locator('#btn'), 'Button Name');
}
```

### **Rule 5: 4-Step Constructor Pattern**
```typescript
constructor(page: Page) {
  // STEP 1: Resolve iframe/frame context (if needed)
  const frame = page.frameLocator('[data-testid="main-body-iframe"]');
  
  // STEP 2: Call super with frame root
  super(page, frame.locator('body'), 'Page Name');
  
  // STEP 3: Store frameLocator for later use (SKIP - no intermediate vars)
  this.frameLocator = frame;
  
  // STEP 4: Instantiate components with direct frame locators
  this.button = new Button(page, frame.locator('#btn'), 'Button Name');
}
```

### **Rule 6: NO Raw Locators in Flow Methods**
```typescript
// ❌ WRONG - Using page.locator() or page.getByRole() directly in flows
export class ApplicationFlow extends BaseFlow {
  async applyToJob() {
    // Direct locator usage - VIOLATES SEPARATION OF CONCERNS
    await this.page.getByRole('button', { name: 'Apply' }).click();
    await this.page.locator('#application-form').fill('data');
  }
}

// ✅ CORRECT - Flows call page object methods ONLY
export class ApplicationFlow extends BaseFlow {
  private careerPortalPage: CareerPortalPage;
  private applicationPage: ApplicationPage;
  
  constructor(baseTest: BaseTest, page: Page) {
    super(baseTest, page);
    this.careerPortalPage = new CareerPortalPage(page);
    this.applicationPage = new ApplicationPage(page);
  }
  
  async applyToJob() {
    await this.base.logger.section('Apply to job', async () => {
      await this.careerPortalPage.clickApply(); // Page object method
      await this.applicationPage.waitForLoad(); // Page object method
    });
  }
}
```

**STRICT RULES:**
- ❌ **NEVER** use `page.locator()` in flow methods
- ❌ **NEVER** use `page.getByRole()`, `page.getByText()`, etc. in flow methods
- ❌ **NEVER** use `frameLocator.locator()` in flow methods
- ✅ **ALWAYS** instantiate page objects in flow constructor
- ✅ **ALWAYS** call page object methods from flow methods
- ✅ **ONLY EXCEPTION**: Dynamic locators based on runtime parameters (must be documented)

**Why this rule exists:**
- **Separation of Concerns**: Locators belong in page objects, business logic in flows
- **Maintainability**: Locator changes only affect page objects, not flows
- **Reusability**: Page object methods can be used by multiple flows
- **Testability**: Page objects can be mocked/stubbed for flow testing
- **Auto-wait**: Components in page objects provide automatic waiting

**Phase 2 Refactoring Results:**
- Found 6 violations in portal-application.flow.ts
- Created `CareerPortalPage.clickApply()` method
- All flows now use page object methods exclusively

**Governance Check:**
- Automated check scans all `*.flow.ts` files
- Fails if `page.locator(`, `page.getByRole(`, `frameLocator.locator(` found
- Enforced via pre-commit hook

### **Rule 7: NO Business Logic in Page Objects**
```typescript
// ❌ WRONG - Multi-step workflow in page object
async submitAndVerify() {
  await this.fillForm();
  await this.submit();
  await this.verifySuccess();
}

// ✅ CORRECT - Only single-page operations
async submit() {
  await this.submitBtn.click();
}

// ✅ Put workflows in FLOWS
// src/flows/feature.flow.ts
async completeFormSubmission() {
  await page.fillForm();
  await page.submit();
  await page.verifySuccess();
}
```

### **Rule 8: Wrap All Operations in `section()`**
```typescript
// ❌ WRONG
async login(username: string, password: string) {
  await this.usernameInput.fill(username);
  await this.passwordInput.fill(password);
  await this.submitBtn.click();
}

// ✅ CORRECT
async login(username: string, password: string) {
  await this.section('Perform login', async () => {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitBtn.click();
  });
}
```

### **Rule 9: Assertions Belong in Flows or Page Objects, NOT Tests**
```typescript
// ❌ WRONG - Direct Playwright expect() in test
import { test, expect } from '@playwright/test';
test('my test', async ({ page }) => {
  await expect(page.locator('#msg')).toBeVisible();
});

// ❌ WRONG - baseTest.expect() does not exist
test('my test', async ({ baseTest }) => {
  await baseTest.expect(element).toBeVisible();
});

// ✅ CORRECT - Use component methods in Flow
async verifySuccess() {
  await this.base.logger.section('Verify success', async () => {
    const msg = new Div(this.page, locator, 'Success Message');
    await msg.expectVisible();
  });
}

// ✅ CORRECT - Use baseTest.assertThat() for value assertions
test('my test', async ({ baseTest, flow }) => {
  const result = await flow.getResult();
  baseTest.assertThat(result).equals('expected');
});
```

### **Rule 10: NO Direct Locators in Page Object Methods (Use Components)**
```typescript
// ❌ WRONG - Using page.locator() or page.getByRole() directly in methods
async clickSubmit() {
  await this.section('Click submit', async () => {
    await this.page.getByRole('button', { name: 'Submit' }).click();
  });
}

async fillForm(name: string) {
  await this.section('Fill form', async () => {
    await this.frameLocator.locator('#name').fill(name);
  });
}

// ✅ CORRECT - Declare components in constructor, use in methods
readonly submitBtn: Button;
readonly nameInput: Input;

constructor(page: Page) {
  const frame = page.frameLocator('[data-testid="main-body-iframe"]');
  super(page, frame.locator('body'), 'Page Name');
  
  this.submitBtn = new Button(page, frame.getByRole('button', { name: 'Submit' }), 'Submit');
  this.nameInput = new Input(page, frame.locator('#name'), 'Name Input');
}

async clickSubmit() {
  await this.section('Click submit', async () => {
    await this.submitBtn.click();
  });
}

async fillForm(name: string) {
  await this.section('Fill form', async () => {
    await this.nameInput.fill(name);
  });
}

// ✅ EXCEPTION - Dynamic locators based on runtime parameters
async selectStatus(statusName: string) {
  await this.section(`Select status: ${statusName}`, async () => {
    // OK: Locator depends on parameter
    const statusBtn = new Button(
      this.page,
      this.frameLocator!.getByRole('button', { name: statusName }),
      `Status: ${statusName}`
    );
    await statusBtn.click();
  });
}
```

**Why this rule?**
- **Maintainability**: All locators in one place (constructor)
- **Reusability**: Components can be used in multiple methods
- **Readability**: Clear what elements exist on the page
- **Testability**: Easy to mock/stub components
- **Auto-wait**: Components handle waiting automatically

### **Rule 11: Handle Backend Async Operations with Conditional Retry**
```typescript
// ❌ WRONG - Always waits 15s even when operation succeeds early
await resumeUploadFlow.searchForCandidate(email);
await page.waitForTimeout(15000); // Unnecessary if found on first try!
await resumeUploadFlow.searchForCandidate(email);
await resumeUploadFlow.openCandidateProfile(fullName);

// ✅ CORRECT - Only retry if first attempt fails
const fullName = `${testData.expectedData.firstName} ${testData.expectedData.lastName}`;
await resumeUploadFlow.searchForCandidate(testData.expectedData.email);

try {
  // Attempt to open candidate profile immediately
  await resumeUploadFlow.openCandidateProfile(fullName);
} catch (error) {
  // If not found, wait for backend indexing and retry
  await page.waitForTimeout(15000);
  await resumeUploadFlow.searchForCandidate(testData.expectedData.email);
  await resumeUploadFlow.openCandidateProfile(fullName);
}
```

**When to use this pattern:**
- ✅ Resume upload → wait for parsing → search for candidate
- ✅ Create record → wait for indexing → search/verify record appears
- ✅ Submit form → wait for processing → verify result in listing
- ✅ Delete record → wait for propagation → verify record removed
- ❌ NOT for UI element visibility (use component auto-wait instead)
- ❌ NOT for page navigation (use `waitForLoadState()` instead)

**Why this pattern is critical:**
- **Performance**: Saves 15+ seconds when operation succeeds on first try
- **Reliability**: Handles slow backend operations that take longer than expected
- **Smart Retry**: Only waits when necessary, not on every test run
- **Verification**: Uses actual operation failure to trigger retry, not guessing

**Backend Async Operations (requires this pattern):**
- Search indexing (Elasticsearch, Solr, database replication)
- Resume/document parsing (OCR, NLP, text extraction)
- Email/notification delivery
- Report generation
- File uploads with virus scanning
- Workflow state transitions
- Cross-system data sync

**Component Layer Can't Fix This:**
- Components wait for **UI elements** to appear (DOM rendering)
- They can't detect **data availability** (backend processing complete)
- This is an **application-level timing gap** that needs explicit handling

### **Rule 12: Test Import Pattern - Use Governance Fixtures**
```typescript
// ❌ WRONG - Importing baseTest directly, importing testData
import { baseTest } from '@src/utils/base-test.util';
import testData from '@src/data-factory/test-data/ATS-T179.json';

baseTest.describe('Test Suite', () => {
  baseTest('Test Name', async ({ page, authPage }) => {
    const flow = new MyFlow(page);
  });
});

// ✅ CORRECT - Import test from governance, use fixtures
import { test } from '@tests/governance';
import { MyFlow } from '@src/flows/my.flow';

test.describe('Test Suite', () => {
  test('Test Name', async ({ baseTest, authPage, testData }) => {
    const page = baseTest.page;
    const flow = new MyFlow(page);
    
    // testData automatically loaded from ATS-T179.json (matches spec filename)
    await flow.doSomething(testData.value);
  });
});
```

**Key Points**:
- ✅ Import `test` from `@tests/governance` (NOT `baseTest` from utils)
- ✅ `baseTest`, `testData`, `authPage`, `tabs` all come as **fixtures**
- ✅ Extract `page` from `baseTest.page`
- ✅ `testData` auto-loads from matching JSON file (e.g., `ATS-T179.json` for `ATS-T179.spec.ts`)
- ❌ Never import baseTest or testData directly

### **Rule 13: Test Data File Placement - STRICT**
```typescript
// ❌ WRONG - Test data alongside spec file
tests/specs/ats/ATS-T29971.spec.ts
tests/specs/ats/ATS-T29971.json  ❌

// ❌ WRONG - Test data in root specs folder
tests/specs/ATS-T29971.spec.ts
tests/specs/ATS-T29971.json  ❌

// ❌ WRONG - Test data in data-factory folder (OLD LOCATION)
src/data-factory/test-data/ATS-T29971.json  ❌

// ✅ CORRECT - Test data in scenarios folder by module
tests/specs/ats/ATS-T29971.spec.ts  ✅
tests/data/scenarios/ats/ATS-T29971.json  ✅

// Import path MUST use @tests alias (NOT @src or relative imports)
import testData from '@tests/data/scenarios/ats/ATS-T29971.json';  ✅
```

**STRICT RULE**: 
- **Test specs**: `tests/specs/<module>/<TEST-ID>.spec.ts`
- **Test data**: `tests/data/scenarios/<module>/<TEST-ID>.json`
- **NEVER** place JSON files in `tests/specs/` folder
- **NEVER** place JSON files in `src/data-factory/test-data/` folder (deprecated location)
- **ALWAYS** use `tests/data/scenarios/<module>/` path
- **ALWAYS** use `@tests/data/scenarios/<module>/` for imports (NOT `@src`)
- The `testData` fixture automatically loads from matching JSON file based on test ID

**Why this structure?**
- Clear separation: test specs vs test data
- Module organization: easy to find related data
- Fixture auto-loading: `testData` fixture matches spec name to JSON file
- Import alias: `@tests` clearly indicates test-related resources

### **Rule 13: Component Locator Access for Nested Scoping**
```typescript
// ✅ Components expose public locator getter for nested searches
const templateRow = new Div(
  page,
  this.root.locator('tr').filter({ hasText: templateName }),
  'Template Row'
);

// Scope nested button within the row component
const editBtn = new Button(
  page,
  templateRow.locator.getByRole('button', { name: 'Edit' }),
  'Edit Button for template'
);

await editBtn.click();
```

**BaseComponent Implementation**:
```typescript
// In BaseComponent class
get locator(): Locator {  // PUBLIC getter (not protected)
  return typeof this.selector === 'string'
    ? this.page.locator(this.selector)
    : this.selector;
}
```

**Why**: Enables scoping nested searches within container components (rows, cards, modals) while maintaining component infrastructure.

### **Rule 14: File Structure and Placement - STRICT**

#### **Test Spec Files**
```typescript
// ❌ WRONG - Test in root specs folder
tests/specs/ATS-T29971.spec.ts  ❌

// ❌ WRONG - Test in wrong module folder
tests/specs/crm/ATS-T29971.spec.ts  ❌

// ✅ CORRECT - Test in module folder matching product
tests/specs/ats/ATS-T29971.spec.ts  ✅
tests/specs/crm/CRM-T226.spec.ts  ✅
tests/specs/cst/CST-T204.spec.ts  ✅
```

**STRICT RULES**:
- **Pattern**: `tests/specs/<module>/<TEST-ID>.spec.ts`
- **Module** must match test ID prefix (ATS-T → ats/, CRM-T → crm/, CST-T → cst/)
- **NEVER** place specs in root `tests/specs/` folder
- **ALWAYS** use kebab-case for module folders (ats, crm, cst)

### **Rule 15: Single Test Case per Spec - NO TEST SPLITTING**

```typescript
// ❌ WRONG - Multiple test cases sharing state
test.describe('ATS-T29971: Workflow Actions', () => {
  let page: any;
  
  test('Login as Admin', async ({ baseTest }) => {
    page = baseTest.page;
    await loginFlow.login(creds);
  });
  
  test('Action 1', async ({ baseTest }) => {
    // Uses page from previous test - BAD!
    await flow.action1();
  });
  
  test('Action 2', async ({ baseTest }) => {
    // More shared state - BAD!
    await flow.action2();
  });
});

// ❌ WRONG - Redundant section calls in spec wrapping flow methods
test.describe('ATS-T29971: Workflow Actions', () => {
  test('ATS-T29971: All workflow actions', async ({ baseTest }) => {
    const page = baseTest.page;
    
    await baseTest.logger.section('Login as Admin', async () => {
      await loginFlow.login(creds); // Login flow already has sections inside
    });
    
    // DON'T wrap every flow method call with section
    await baseTest.logger.section('Submit to workflow', async () => {
      await flow.submitToWorkflow(); // Flow method already has sections inside - redundant!
    });
    
    await baseTest.logger.section('Send email', async () => {
      await flow.sendEmail(); // Flow method already has sections - redundant!
    });
  });
});

// ✅ CORRECT - Section calls in FLOWS, minimal sections in spec
test.describe('ATS-T29971: Workflow Actions', () => {
  test('ATS-T29971: All workflow actions', async ({ baseTest }) => {
    const page = baseTest.page;
    
    // Only section for major test phase (Login)
    await baseTest.logger.section('Login as Admin', async () => {
      const loginFlow = new ATSLoginFlow(page, baseTest.logger);
      await loginFlow.login(creds); // Login flow uses sections internally
    });
    
    const flow = new WorkflowActionsFlow(baseTest, page);
    
    // Direct flow method calls - they handle sections internally
    await flow.navigateAndSearchWorkflows();
    await flow.selectCandidate(testData.candidateName);
    await flow.submitToWorkflow(page.context(), testData.submitFilter);
    await flow.sendEmail(page.context(), testData);
    await flow.shareProfile(page.context(), testData);
    await flow.bulkPrintDocuments(page.context(), testData.printDocument);
  });
});
```

```typescript
// ✅ CORRECT - Section calls in FLOW for business operations
export class WorkflowActionsFlow {
  async submitToWorkflow(context: BrowserContext, jobFilter: string) {
    return await this.base.logger.section('Submit to Workflow', async () => {
      // Click toolbar button
      await this.searchPage.clickToolbarButton('Submit to Workflow');
      
      // Wait for popup and interact
      const popupPage = await context.waitForEvent('page');
      const popup = new SubmitToWorkflowPopup(popupPage);
      await popup.searchAndSelectJob(jobFilter);
      const jobName = await popup.getSelectedJobName();
      await popup.submit();
      
      return jobName;
    });
  }
  
  async sendEmail(context: BrowserContext, testData: any) {
    return await this.base.logger.section('Send Email', async () => {
      await this.searchPage.clickToolbarButton('Email');
      
      const emailPage = await context.waitForEvent('page');
      const composePage = new ComposeEmailPage(emailPage);
      await composePage.fillSubject(testData.emailSubject);
      await composePage.fillBody(testData.emailBody);
      await composePage.send();
    });
  }
}
```

**STRICT RULES**:
- **ONE test case per spec file** (inside test.describe)
- **NO test splitting** across multiple test() calls
- **Section calls belong in FLOWS** for meaningful business operations
- **Minimal sections in spec** - only for major test phases (Login, Setup, Cleanup)
- **DON'T wrap flow method calls** with redundant sections in spec
- **Include login** in the same test if needed
- **Avoid serial mode** - not reliable with fixture cleanup
- **All actions in sequence** - easier to debug, no state sharing issues

**Why**:
- Avoids context/browser closure issues between tests
- No complex fixture caching or serial mode needed
- Clear linear execution flow with business-meaningful sections
- Evidence collection works properly
- Simpler debugging - one test, one failure point
- Section hierarchy: Flow sections show business operations, spec sections show test phases

---

### **Rule 16: Use TabManager for ALL Tab/Popup Operations - NO Direct Context Usage**

```typescript
// ❌ WRONG - Using context.waitForEvent('page') directly
async addNote(testData) {
  const [newTab] = await Promise.all([
    this.context.waitForEvent('page'),
    this.notesPage.clickAddNote()
  ]);
  const formPage = new NoteFormPage(newTab);
  // ... manual tracking, no evidence collection ❌
}

// ❌ WRONG - Passing BrowserContext to flows
export class MyFlow {
  constructor(baseTest: BaseTest, page: Page, context: BrowserContext) {
    this.context = context; // ❌
  }
  
  async openEmail(context: BrowserContext) { // ❌
    const emailTab = await context.waitForEvent('page');
  }
}

// ✅ CORRECT - Using TabManager exclusively
async addNote(testData) {
  await this.notesPage.clickAddNote();
  await this.base.tabs.waitForNewTab('Note Form');
  
  const formPage = this.base.tabs.as(NoteFormPage, 'Note Form');
  await formPage.fillTopic(testData.topic);
  await formPage.clickSave();
  
  await this.base.tabs.close('Note Form');
  await this.base.tabs.switchTo('Main Tab');
}

// ✅ CORRECT - Flow constructor WITHOUT context
export class MyFlow {
  constructor(
    private base: BaseTest,
    private page: Page
    // NO context parameter ✅
  ) {}
  
  async openEmail() {
    await this.page.clickEmailBtn();
    await this.base.tabs.waitForNewTab('Compose Email');
    const emailPage = this.base.tabs.as(ComposeEmailPage, 'Compose Email');
    // TabManager handles lifecycle ✅
  }
}
```

**STRICT RULES**:
- ✅ **ALWAYS use `baseTest.tabs`** for tab/popup operations
- ❌ **NEVER use `context.waitForEvent('page')`** in flows or tests
- ❌ **NEVER pass `BrowserContext`** to flow constructors or methods
- ✅ **Name all tabs** meaningfully: 'Note Form', 'Compose Email', 'Submit to Workflow'
- ✅ **Use `tabs.as(PageClass, 'TabName')`** for page object factory pattern
- ✅ **Explicitly close tabs** when done: `await tabs.close('TabName')`
- ✅ **Switch back to main**: `await tabs.switchTo('Main Tab')`

**TabManager API**:
```typescript
// Wait for new tab (after click that opens tab)
await tabs.waitForNewTab('Descriptive Name');

// Get page object for a tab
const page = tabs.as(PageObjectClass, 'Tab Name');

// Access current tab's page directly
const currentPage = tabs.current;

// Switch between tabs
await tabs.switchTo('Tab Name');

// Close specific tab
await tabs.close('Tab Name');

// List all open tabs
const tabNames = tabs.listTabs();

// Debug current state
tabs.debugState();
```

**Why TabManager is Mandatory**:
1. **Evidence Collection**: All tabs automatically captured on test failure
2. **Automatic Cleanup**: Fixture handles cleanup even on errors
3. **Named Tabs**: Clear debugging with meaningful tab names in logs
4. **Centralized State**: Framework tracks all tabs, pages, contexts
5. **Race Condition Handling**: Built-in handling for timing issues
6. **Consistent Pattern**: One way to handle tabs enterprise-wide

**Migration Pattern**:
```typescript
// OLD:
const [popup] = await Promise.all([
  context.waitForEvent('page'),
  button.click()
]);
await popup.close();

// NEW:
await button.click();
await tabs.waitForNewTab('Popup Name');
const page = tabs.as(PopupPage, 'Popup Name');
// ... work with page
await tabs.close('Popup Name');
```

---

#### **Page Object Files**
```typescript
// ❌ WRONG - Page in root pages folder
src/pages/recruiting-workflow-search.page.ts  ❌

// ❌ WRONG - Missing module subfolder
src/pages/person-profile.page.ts  ❌

// ✅ CORRECT - Page in module folder
src/pages/ats/recruiting-workflow-search.page.ts  ✅
src/pages/ats/person-profile.page.ts  ✅
src/pages/ats/compose-email.page.ts  ✅
src/pages/crm/campaign-builder.page.ts  ✅
```

**STRICT RULES**:
- **Pattern**: `src/pages/<module>/<feature-name>.page.ts`
- **Module** matches product area (ats, crm, cst, common)
- **Naming**: kebab-case with `.page.ts` suffix
- **NEVER** place pages in root `src/pages/` folder (except base.page.ts)
- **Import path**: `@src/pages/<module>/<name>.page`

#### **Flow Files**
```typescript
// ❌ WRONG - Flow in root flows folder
src/flows/recruiting-workflow.flow.ts  ❌

// ❌ WRONG - Missing module subfolder
src/flows/candidate-submission.flow.ts  ❌

// ✅ CORRECT - Flow in module folder
src/flows/ats/recruiting-workflow.flow.ts  ✅
src/flows/ats/workflow-actions.flow.ts  ✅
src/flows/crm/campaign-management.flow.ts  ✅
```

**STRICT RULES**:
- **Pattern**: `src/flows/<module>/<feature-name>.flow.ts`
- **Module** matches product area (ats, crm, cst)
- **Naming**: kebab-case with `.flow.ts` suffix
- **NEVER** place flows in root `src/flows/` folder
- **Import path**: `@src/flows/<module>/<name>.flow`

#### **Test Data Files**
```typescript
// ❌ WRONG - Data alongside spec
tests/specs/ats/ATS-T29971.json  ❌

// ❌ WRONG - Data in root specs
tests/specs/ATS-T29971.json  ❌

// ✅ CORRECT - Data in scenarios folder
tests/data/scenarios/ats/ATS-T29971.json  ✅
tests/data/scenarios/crm/CRM-T226.json  ✅
```

**STRICT RULES**:
- **Pattern**: `tests/data/scenarios/<module>/<TEST-ID>.json`
- **Module** must match test spec module
- **NEVER** place JSON in `tests/specs/` folder
- **Import path**: `@tests/data/scenarios/<module>/<TEST-ID>.json`

#### **Summary Table**
| File Type | Location Pattern | Example |
|-----------|------------------|---------|
| **Test Spec** | `tests/specs/<module>/<TEST-ID>.spec.ts` | `tests/specs/ats/ATS-T29971.spec.ts` |
| **Test Data** | `tests/data/scenarios/<module>/<TEST-ID>.json` | `tests/data/scenarios/ats/ATS-T29971.json` |
| **Page Object** | `src/pages/<module>/<name>.page.ts` | `src/pages/ats/recruiting-workflow-search.page.ts` |
| **Flow** | `src/flows/<module>/<name>.flow.ts` | `src/flows/ats/workflow-actions.flow.ts` |
| **Component** | `src/components/<name>.component.ts` | `src/components/button.component.ts` |

**Module Naming**: Always use lowercase, kebab-case matching product abbreviation
- ✅ `ats/` (Applicant Tracking System)
- ✅ `crm/` (Candidate Relationship Management)
- ✅ `cst/` (Customer Success Tools)
- ✅ `common/` (Shared/reusable components)
- ❌ `ATS/`, `Ats/`, `applicant-tracking/`

---

## 🏗️ Framework Architecture

### **Layer Structure**
```
Tests (specs/) 
  ↓ uses
Flows (src/flows/)
  ↓ uses
Page Objects (src/pages/)
  ↓ uses
Components (src/components/)
```

### **Responsibilities**

| Layer | Responsibility | Contains |
|-------|---------------|----------|
| **Test Spec** | Test orchestration, value assertions | `flow.method()`, `baseTest.assertThat(value).equals()` |
| **Flow** | Business logic, multi-page workflows, visibility verifications | Page composition, component `.expectVisible()` |
| **Page Object** | Page structure, element location | Component instances, simple methods |
| **Component** | UI element interaction, auto-wait | Click, fill, select, auto-retry |

---

## 📄 Page Object Generation

### **Template Structure**

```typescript
// src/pages/[product]/[feature]/page-name.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';
// ... import other components as needed

/**
 * [PageName]Page
 * Description: Brief description of page purpose
 */
export class PageNamePage extends BasePage {
  // Declare all components as readonly
  readonly componentName: ComponentType;
  readonly anotherComponent: ComponentType;

  constructor(page: Page) {
    // STEP 1: Resolve frame context (if applicable)
    // See Iframe Handling section for patterns
    
    // STEP 2: Call super
    // STEP 3: Store frameLocator (optional)
    // STEP 4: Instantiate components
  }

  async expectLoaded() {
    await this.section('PageName - verify loaded', async () => {
      await this.primaryComponent.expectVisible();
    });
  }

  // Add simple methods that operate on THIS page only
}
```

### **Naming Conventions**

| Item | Convention | Example |
|------|------------|---------|
| File | `kebab-case.page.ts` | `job-create.page.ts` |
| Class | `PascalCasePage` | `JobCreatePage` |
| Component Field | `camelCase` | `submitBtn`, `firstNameInput` |
| Method | `camelCase` | `fillJobDetails()`, `clickSave()` |

### **Import Order**
```typescript
// 1. Playwright imports
import { Page, FrameLocator } from '@playwright/test';

// 2. Framework imports (BasePage)
import { BasePage } from '@src/pages/base.page';

// 3. Component imports (alphabetical)
import { Button } from '@src/components/button.component';
import { Dropdown } from '@src/components/dropdown.component';
import { Input } from '@src/components/input.component';

// 4. Other page imports (if needed)
import { ModalPage } from '@src/pages/common/modal.page';
```

---

## 🔄 Flow Generation

### **Template Structure**

```typescript
// src/flows/[product]/[feature]/feature-name.flow.ts
import { Page } from '@playwright/test';
import { BaseTest } from '@src/utils/base-test.util';
import { PageOnePage } from '@src/pages/product/page-one.page';
import { PageTwoPage } from '@src/pages/product/page-two.page';

export class FeatureNameFlow {
  private readonly base: BaseTest;
  private readonly page: Page;
  
  // Declare page objects as public readonly for test access
  readonly pageOne: PageOnePage;
  readonly pageTwo: PageTwoPage;

  constructor(baseTest: BaseTest, page: Page) {
    this.base = baseTest;
    this.page = page;
    
    // Eager load page objects
    this.pageOne = new PageOnePage(page);
    this.pageTwo = new PageTwoPage(page);
  }

  async completeWorkflow(data: WorkflowData) {
    await this.base.logger.section('Complete workflow', async () => {
      // Orchestrate multiple pages
      await this.pageOne.fillForm(data);
      await this.pageOne.submit();
      await this.pageTwo.verifySuccess();
    });
  }
}
```

### **Flow Best Practices**

✅ **DO**:
- Use `this.base.logger.section()` for meaningful business reusable workflow steps. Not for each step but for group of steps
- Compose multiple page objects
- Accept `testData` object directly (avoid multiple individual params)
- Return useful data (IDs, status, etc.)
- Handle page transitions
- Extract values from testData internally with defaults

❌ **DON'T**:
- Put UI element locators in flows
- Use `page.locator()` directly
- Duplicate page object methods
- Put assertions in flows (use assertions in tests)
- Pass many individual parameters when testData object is available

**Example - Good Flow Method:**
```typescript
// ✅ GOOD - Accept testData object
async advanceWithAutoLaunch(testData: any) {
  await this.base.logger.section('Advance with auto-launch', async () => {
    const status = testData.portalStatus || 'External Portal';
    const jobFolder = testData.jobFolder || 'Default';
    const subject = testData.emailSubject || 'Default Subject';
    
    await this.profilePage.selectAdvanceStatus(status);
    await this.modal.configureJobFolder(jobFolder);
    // ... rest of logic
  });
}

// ❌ BAD - Too many individual parameters
async advanceWithAutoLaunch(
  statusName: string,
  jobFolder: string,
  candidateFolder: boolean,
  createEmployee: boolean,
  category: string,
  emailSubject: string,
  emailBody: string
) {
  // This becomes unwieldy and hard to maintain
}
```

---

## 🧪 Test Spec Generation

### **Template Structure**

```typescript
// tests/specs/[product]/TEST-ID.spec.ts
import { test } from '@tests/governance';
import { FeatureFlow } from '@src/flows/product/feature.flow';

test.describe('Feature Name - Test Suite', () => {
  
  test('TEST-ID Description of test', async ({
    baseTest,
    logger,
    testData,
    authPage,
    tabs
  }) => {
    const page = authPage; // Already authenticated
    const flow = new FeatureFlow(baseTest, page);
    
    // Test steps using flow methods
    await flow.stepOne(testData.param1);
    await flow.stepTwo(testData.param2);
    
    // Assertions
    baseTest.assertThat(actualValue).equals(expectedValue);
  });
});
```

### **Fixture Usage**

| Fixture | Type | Purpose | Example |
|---------|------|---------|---------|
| `baseTest` | `BaseTest` | Assertions, logging, API | `baseTest.assertThat()` |
| `logger` | `Logger` | Logging | `logger.info('message')` |
| `testData` | `any` | Test data from JSON | `testData.jobId` |
| `authPage` | `Page` | Authenticated page | Use as main page |
| `tabs` | `TabManager` | Multi-tab/window management | `tabs.switchTo('Tab Name')` |

---

## 🧩 Component Library

### **Available Components**

| Component | Import | Constructor | Key Methods |
|-----------|--------|-------------|-------------|
| `Button` | `@src/components/button.component` | `new Button(page, locator, name)` | `click()`, `expectVisible()` |
| `Input` | `@src/components/input.component` | `new Input(page, locator, name)` | `fill()`, `clear()`, `inputValue()` |
| `Dropdown` | `@src/components/dropdown.component` | `new Dropdown(page, locator, name)` | `select()`, `pickByText()` |
| `Checkbox` | `@src/components/checkbox.component` | `new Checkbox(page, locator, name)` | `check()`, `uncheck()`, `isChecked()` |
| `Link` | `@src/components/link.component` | `new Link(page, locator, name)` | `click()`, `href()` |
| `Div` | `@src/components/div.component` | `new Div(page, locator, name)` | `getText()`, `click()` |
| `Modal` | `@src/components/modal.component` | `new Modal(page, locator, name)` | `expectVisible()`, `expectHidden()` |
| `Table` | `@src/components/table.component` | `new Table(page, locator, name)` | `getRowByText()`, `getCellValue()` |

### **Component Pattern**

```typescript
// All components follow this pattern:
this.componentName = new ComponentType(
  page,           // Always the Page object
  locator,        // Frame-aware locator
  'Friendly Name' // Human-readable name for logs/traces
);

// Example:
this.submitBtn = new Button(
  page,
  frameLocator.getByRole('button', { name: 'Submit' }),
  'Submit Button'
);
```

### **Common Component Methods**

```typescript
// All components inherit from BaseComponent
await component.click();              // Click element
await component.dblclick();           // Double-click element
await component.expectVisible();      // Assert visible
await component.expectHidden();       // Assert hidden
await component.isVisible();          // Check visibility (boolean)
await component.getText();            // Get text content
await component.waitFor('visible');   // Wait for state
await component.dblclick();           // Double-click element

// Input-specific methods
await input.inputValue();             // Get input value (use inputValue(), NOT getValue())
```

---

## 🖼️ Iframe Handling

### **Pattern 1: No Iframe (Simple Page)**

```typescript
constructor(page: Page) {
  // STEP 1: No iframe needed
  
  // STEP 2: Use page directly
  super(page, page.locator('body'), 'Login Page');
  
  // STEP 4: Components use page.locator() or page.getByRole()
  this.username = new Input(
    page,
    page.getByRole('textbox', { name: 'Username' }),
    'Username Input'
  );
}
```

### **Pattern 2: Single Iframe (Most Common)**

```typescript
constructor(page: Page) {
  // STEP 1: Resolve main iframe
  const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
  
  // STEP 2: Use frame root
  super(page, mainFrame.locator('body'), 'Dashboard Page');
  
  // STEP 3: Store for component use
  this.frameLocator = mainFrame;
  
  // STEP 4: Components use mainFrame.locator()
  this.createBtn = new Button(
    page,
    mainFrame.getByRole('button', { name: 'Create' }),
    'Create Button'
  );
}
```

### **Pattern 3: Nested Iframes**

```typescript
constructor(page: Page) {
  // STEP 1: Resolve nested iframes
  const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
  const profileFrame = mainFrame.locator('iframe').last().contentFrame();
  
  // STEP 2: Use innermost frame
  super(page, profileFrame.locator('body'), 'Profile Page');
  
  // STEP 3: Store innermost frame
  this.frameLocator = profileFrame;
  
  // STEP 4: Use profileFrame for components
  this.advanceBtn = new Button(
    page,
    profileFrame.getByRole('button', { name: 'Advance' }),
    'Advance Button'
  );
}
```

### **Pattern 4: Modal (No Iframe)**

```typescript
constructor(page: Page) {
  // STEP 1: Modal is on main page, not in iframe
  const modalLoc = page.locator('.ui-dialog').first();
  
  // STEP 2: Use modal locator as root
  super(page, modalLoc, 'Confirmation Modal');
  
  // STEP 4: Components scoped to modal
  this.confirmBtn = new Button(
    page,
    modalLoc.getByRole('button', { name: 'Confirm' }),
    'Confirm Button'
  );
}
```

---

## 🔄 Common Codegen Patterns → Framework Patterns

### **Pattern 1: Hard Waits**

```typescript
// ❌ CODEGEN
await page.waitForTimeout(2000);
await page.getByRole('button').click();

// ✅ FRAMEWORK
const button = new Button(page, frame.getByRole('button'), 'Button');
await button.click(); // Component auto-waits
```

### **Pattern 2: Inline Assertions**

```typescript
// ❌ CODEGEN
await expect(page.getByText('Success')).toBeVisible();

// ✅ FRAMEWORK - In Page Object
async verifySuccess() {
  await this.section('Verify success message', async () => {
    await this.successMessage.expectVisible();
  });
}

// ✅ FRAMEWORK - In Test
baseTest.assertThat(await page.getSuccessText()).contains('Success');
```

### **Pattern 3: Direct Page Locators**

```typescript
// ❌ CODEGEN
await page.getByRole('button', { name: 'Submit' }).click();
await page.locator('#username').fill('admin');

// ✅ FRAMEWORK - Page Object
readonly submitBtn: Button;
readonly usernameInput: Input;

constructor(page: Page) {
  super(page, page.locator('body'), 'Login Page');
  
  this.submitBtn = new Button(
    page,
    page.getByRole('button', { name: 'Submit' }),
    'Submit Button'
  );
  
  this.usernameInput = new Input(
    page,
    page.locator('#username'),
    'Username Input'
  );
}
```

### **Pattern 4: Conditional Clicks**

```typescript
// ❌ CODEGEN
if (await page.getByText('Show more').isVisible({ timeout: 2000 }).catch(() => false)) {
  await page.getByText('Show more').click();
}

// ✅ FRAMEWORK
readonly showMoreBtn: Button;

async expandIfNeeded() {
  await this.section('Expand if needed', async () => {
    const isVisible = await this.showMoreBtn.isVisible().catch(() => false);
    if (isVisible) {
      await this.showMoreBtn.click();
    }
  });
}
```

### **Pattern 5: Dynamic Locators**

```typescript
// ❌ CODEGEN
await page.locator(`text=${statusName}`).click();

// ✅ FRAMEWORK
async selectStatus(statusName: string) {
  await this.section(`Select status: ${statusName}`, async () => {
    // TODO: Verify actual selector for status options
    const statusBtn = new Button(
      this.page,
      this.frameLocator.locator(`text=${statusName}`).first(),
      `Status: ${statusName}`
    );
    await statusBtn.click();
  });
}
```

### **Pattern 6: Navigation**

```typescript
// ❌ CODEGEN
await page.goto('https://app.example.com/login');
await page.waitForLoadState('networkidle');

// ✅ FRAMEWORK - Page Object
async navigateTo() {
  await this.goto(config.appBaseUrl + '/login');
  await this.expectLoaded();
}

// ✅ FRAMEWORK - Test (Use authPage fixture instead)
const page = authPage; // Already authenticated and navigated
```

---

## ⚙️ Component Layer Best Practices

### **Understanding Component Auto-Wait & Retry**

The framework's component layer provides **automatic retry with exponential backoff** for all actions. Understanding how this works helps you write robust tests.

#### **What Components Provide:**

1. **Automatic Visibility Wait** - Before every action, components wait for elements to be visible
2. **Exponential Backoff Retry** - Failed actions retry 0-2 times (based on execution profile)
3. **Stability Checks** - Animated elements wait for position to stabilize
4. **Friendly Error Messages** - Component names instead of raw locator strings
5. **Automatic Logging** - Every action logged with test.step() annotation

#### **Execution Profiles:**

| Profile | Retries | Component Timeout | Use Case |
|---------|---------|-------------------|----------|
| **FAST** | 0 | 2s | Quick smoke tests |
| **SAFE** (default) | 1 | 4s | Standard CI/CD runs |
| **DEBUG** | 2 | 8s | Troubleshooting flaky tests |

**Configuration:** Set in `config/environment/base.env.ts`:
```typescript
executionMode: 'DEBUG' // FAST | SAFE | DEBUG
```

#### **What Component Layer CAN Handle:**

✅ **Element visibility delays** - Waits for DOM elements to render  
✅ **Element actionability** - Waits for elements to become clickable  
✅ **Stale elements** - Retries when element detaches during action  
✅ **Animation/transitions** - Stability waits for moving elements  
✅ **Temporary overlays** - Retries when element temporarily obscured

#### **What Component Layer CANNOT Handle:**

❌ **Backend data processing** - Component sees empty search results (not a UI issue)  
❌ **Search indexing delays** - Results aren't in DB yet (not a rendering issue)  
❌ **Cross-system sync** - Data not replicated to search service yet  
❌ **Async workflows** - State machine hasn't transitioned yet  
❌ **File processing** - Resume parsing, virus scanning, OCR not complete

**For these cases, use conditional retry pattern (see Rule 11)**

#### **Component Layer Implementation Details:**

**All actions go through `exec()` wrapper:**
```typescript
// src/components/base.component.ts
async exec<T>(
  label: string,
  fn: (loc: Locator) => Promise<T>,
  options?: { retries?: number; skipVisibilityCheck?: boolean }
): Promise<T> {
  // 1. Wait for element visibility
  if (!skipVisibilityCheck) {
    await waitForVisible(loc, profile.timeouts.component);
  }
  
  // 2. Execute action with retry
  return await retryWithBackoff(
    () => fn(loc),
    profile.retries,
    profile.timeouts.retryInterval
  );
}
```

**Retry logic:**
```typescript
// src/utils/retry.util.ts
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  attempts = 3,
  initialDelay = 200
): Promise<T> {
  // Exponential backoff: 200ms → 400ms → 800ms
  // Handles transient failures gracefully
}
```

#### **Best Practices:**

✅ **Trust component auto-wait** - Don't add `page.waitForTimeout()` before component actions  
✅ **Use execution profiles** - Switch to DEBUG mode for troubleshooting  
✅ **Import getExecutionProfile()** - Use `profile.timeouts.component` instead of hardcoded values  
✅ **Add stability waits for animations** - Use `waitForElementStable()` for moving elements  
✅ **Wrap page-level operations properly** - Don't bypass `exec()` wrapper in private methods

❌ **Don't make direct Playwright calls** - Use component methods, not `page.locator().click()`  
❌ **Don't hardcode timeouts** - Use execution profile configuration  
❌ **Don't skip visibility checks** - Unless you're specifically checking hidden elements  
❌ **Don't confuse UI waits with data waits** - Backend async operations need explicit handling

#### **Component Layer Refactoring (v2.2):**

**Fixed Issues:**
- ✅ Eliminated direct Playwright calls in Dropdown, NavDrawer, Tree components
- ✅ Replaced 15+ hardcoded timeouts with execution profile references
- ✅ Added stability waits to animated dropdowns

**Impact:**
- All component actions now benefit from retry/logging
- Timeout behavior consistent across FAST/SAFE/DEBUG modes
- Animated overlays no longer cause intermittent click failures

---

## 🚫 Anti-Patterns (NEVER DO THIS)

### **1. ❌ Using `resolveLocator()`**
```typescript
// This method was REMOVED from the framework
const loc = this.resolveLocator('#button');
```

### **2. ❌ Multiple Selectors in One Component**
```typescript
// Don't chain selectors with .or()
new Button(page, loc1.or(loc2).or(loc3), 'Button');

// Use single selector + TODO
new Button(page, loc1, 'Button'); // TODO: Verify selector
```

### **3. ❌ Hard Waits**
```typescript
// NEVER use waitForTimeout for synchronization
await page.waitForTimeout(1000); // ❌
await page.waitForTimeout(2000); // ❌
await this.page.waitForTimeout(500); // ❌

// ✅ Use component methods that auto-wait
await button.click(); // Waits for element automatically
await input.fill('value'); // Waits for element automatically
await dropdown.selectOption('value'); // Waits for element automatically

// ✅ For navigation, use waitForLoadState (sparingly)
await page.waitForLoadState('networkidle'); // OK after navigation

// ✅ For specific conditions, use component expectations
await element.expectVisible(); // Waits until visible
await element.expectHidden(); // Waits until hidden
await element.expectText('expected'); // Waits for text to match
```

**Why hard waits are bad:**
- Tests become slower (fixed time regardless of actual load time)
- Tests become flaky (sometimes too short, sometimes too long)
- Hides real synchronization issues that should be fixed
- Makes tests non-deterministic

**Removed during Phase 1 Refactoring:**
- 13 hard waits eliminated across 9 files
- Replaced with component auto-wait behavior
- Tests now faster and more reliable

### **4. ❌ Direct Assertions in Tests**
```typescript
// Tests should NOT use Playwright's expect() directly
import { expect } from '@playwright/test';
await expect(page.locator('#msg')).toBeVisible();

// Tests should NOT use baseTest.expect() - it doesn't exist
await baseTest.expect(element).toBeVisible();

// ✅ Use component methods in Flow
async verifyMessage() {
  await this.base.logger.section('Verify message', async () => {
    const msg = new Div(this.page, locator, 'Message');
    await msg.expectVisible();
  });
}

// ✅ Or use baseTest.assertThat() for value comparisons
baseTest.assertThat(actualValue).equals(expectedValue);
```

### **5. ❌ Business Logic in Page Objects**
```typescript
// Multi-page workflows belong in FLOWS
async createAndVerifyJob() {
  await this.navigateToCreate();
  await this.fillForm();
  await this.submit();
  await this.verifyOnDashboard(); // Different page!
}
```

### **6. ❌ Not Using `section()`**
```typescript
// All page methods MUST use section()
async submit() {
  await this.submitBtn.click(); // Missing section wrapper
}
```

### **7. ❌ Hardcoded Values**
```typescript
// Use testData fixture
await input.fill('admin'); // ❌
await input.fill(testData.username); // ✅
```

### **8. ❌ Creating Page Instances in Tests**
```typescript
// Tests should use FLOWS
const page = new JobCreatePage(baseTest.page); // ❌
const flow = new JobFlow(baseTest, page); // ✅
```

### **9. ❌ Using Raw Locators in Flow Methods**
```typescript
// ❌ WRONG - Direct locator usage in flows
async applyToJob() {
  await this.page.getByRole('button', { name: 'Apply' }).click();
  await this.page.locator('#application-form').waitFor();
}

async fillField(value: string) {
  await this.page.locator('#field-input').fill(value);
}

// ✅ CORRECT - Use page object methods that use components
async applyToJob() {
  await this.careerPortalPage.clickApply(); // Page object method
  await this.applicationPage.waitForLoad(); // Page object method
}

async fillField(value: string) {
  await this.formPage.fillField(value); // Page object method
}
```

**Why raw locators in flows are bad:**
- Violates separation of concerns (locators belong in page objects)
- Duplicates locator knowledge across multiple flows
- Makes refactoring harder (locator changes require updating flows)
- Bypasses component auto-wait behavior
- No component-level logging/evidence collection

**Governance Rule:**
- Flows should ONLY call page object methods
- Page objects should ONLY use component instances
- Zero raw locators (`page.locator()`, `page.getByRole()`) in flows

**Fixed during Phase 2 Refactoring:**
- 6 violations found in portal-application.flow.ts
- Created `CareerPortalPage.clickApply()` method
- All flows now use page object methods exclusively

### **10. ❌ Constructor Boilerplate Duplication**
```typescript
// ❌ WRONG - Repetitive constructor pattern in every flow
export class MyFlow {
  private base: BaseTest;
  private page: Page;
  
  constructor(baseTest: BaseTest, page: Page) {
    this.base = baseTest;
    this.page = page;
    // ... instantiate page objects
  }
}

// ✅ CORRECT - Extend BaseFlow to eliminate boilerplate
import { BaseFlow } from '@src/utils/base-flow.util';

export class MyFlow extends BaseFlow {
  constructor(baseTest: BaseTest, page: Page) {
    super(baseTest, page);
    // this.base and this.page available automatically
    // ... instantiate page objects
  }
}
```

**Why constructor boilerplate is bad:**
- Violates DRY principle (Don't Repeat Yourself)
- Every flow has identical 2 lines of code
- Error-prone (easy to forget one line)
- Makes code reviews tedious
- Harder to add common flow functionality

**BaseFlow Benefits:**
- **Centralized**: One place to add common flow functionality
- **Consistent**: All flows follow same pattern
- **Protected Access**: `this.base` and `this.page` available to child classes
- **Type-Safe**: TypeScript enforces correct inheritance
- **Reduced LOC**: Saves 2 lines per flow × 26 flows = 52 lines removed

**Implemented during Phase 3 Refactoring:**
- Created `BaseFlow` abstract class
- Migrated 26 flows to extend BaseFlow
- 52 lines of duplication eliminated
- All flows now follow consistent pattern

### **11. ❌ Unnecessary `waitForLoadState('networkidle')`**
```typescript
// ❌ WRONG - Excessive networkidle waits after component interactions
async clickButton() {
  await this.button.click();
  await this.page.waitForLoadState('networkidle'); // Unnecessary after button click
}

async selectDropdown(value: string) {
  await this.dropdown.selectOption(value);
  await this.page.waitForLoadState('networkidle'); // Unnecessary after dropdown
}

// ✅ CORRECT - Only use networkidle after actual navigation
async navigateToPage() {
  await this.navLink.click(); // This navigates to new page
  await this.page.waitForLoadState('networkidle'); // OK - actual navigation occurred
}

// ✅ CORRECT - Let component auto-wait handle element-level waiting
async clickButton() {
  await this.button.click(); // Component handles waiting
  // No waitForLoadState needed
}

async fillForm(data: any) {
  await this.input1.fill(data.value1); // Auto-waits
  await this.input2.fill(data.value2); // Auto-waits
  await this.dropdown.selectOption(data.option); // Auto-waits
  // No waitForLoadState needed
}
```

**When to use `waitForLoadState('networkidle')`:**
- ✅ After full page navigation (URL change)
- ✅ After clicking links that load new pages
- ✅ After form submission that redirects to new page
- ❌ After button clicks that don't navigate
- ❌ After dropdown selections
- ❌ After filling inputs
- ❌ After modal interactions

**Why networkidle is often unnecessary:**
- Components already wait for elements to be actionable
- Adds unnecessary delay to test execution
- Masks real timing issues that should be fixed
- Not needed for SPA interactions (AJAX, React updates)

**Found during Duplication Analysis:**
- 20+ instances of unnecessary `waitForLoadState('networkidle')`
- Most after button clicks, dropdown changes, input fills
- Should be evaluated case-by-case for removal

### **12. ❌ Creating Page Instances in Tests**

### **13. ❌ Unnecessary Waits When Operation Succeeds Early**
```typescript
// ❌ WRONG - Always waits even when first attempt succeeds
async uploadAndVerify() {
  await this.uploadFile(file);
  await this.page.waitForTimeout(5000); // Always waits!
  await this.searchForFile(filename);
  
  await this.createRecord(data);
  await this.page.waitForTimeout(10000); // Always waits!
  await this.verifyRecordExists(data.id);
}

// ✅ CORRECT - Only wait/retry on failure
async uploadAndVerify() {
  await this.uploadFile(file);
  
  try {
    await this.searchForFile(filename);
  } catch (error) {
    // Only wait if first search fails
    await this.page.waitForTimeout(5000);
    await this.searchForFile(filename);
  }
}

// ✅ BETTER - Encapsulate retry logic in reusable method
async searchWithRetry(searchFn: () => Promise<void>, maxWait = 5000) {
  try {
    await searchFn();
  } catch (error) {
    await this.page.waitForTimeout(maxWait);
    await searchFn();
  }
}

async uploadAndVerify() {
  await this.uploadFile(file);
  await this.searchWithRetry(() => this.searchForFile(filename));
}
```

**Why unconditional waits are bad:**
- **Performance penalty**: Adds fixed delay to every test run, even when not needed
- **False sense of reliability**: Masks real timing issues instead of handling them properly
- **Inflated test duration**: A 10-second wait on every test = hours wasted in CI/CD
- **Not adaptive**: Some operations complete in 1s, others need 15s - fixed wait satisfies neither

**When backend operations complete quickly:**
- First search attempt succeeds immediately
- Unconditional wait adds 5-15 seconds of unnecessary delay
- Test takes 3x-10x longer than needed

**Conditional retry advantages:**
- **Fast path**: When operation succeeds early, no delay penalty
- **Slow path**: When operation needs time, retry mechanism kicks in
- **Explicit failure handling**: Know exactly why retry was triggered
- **Better debugging**: Logs show "retry triggered" vs silent wait

**Real-world impact:**
- Test suite with 50 upload/create tests
- Each has 10s unconditional wait = 500s (8.3 min) total wait time
- With conditional retry: ~50s (only ~10% need retry) = 7.5 min saved
- Across hundreds of test runs per day = hours saved

## 📚 Complete Examples

### **Example 1: Simple Page (No Iframe)**

**Codegen Output:**
```typescript
await page.goto('https://app.com/login');
await page.getByLabel('Username').fill('admin');
await page.getByLabel('Password').fill('pass123');
await page.getByRole('button', { name: 'Log In' }).click();
await page.waitForLoadState('networkidle');
```

**Framework Code:**

```typescript
// src/pages/auth/login.page.ts
import { Page } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Input } from '@src/components/input.component';
import { Button } from '@src/components/button.component';

export class LoginPage extends BasePage {
  readonly usernameInput: Input;
  readonly passwordInput: Input;
  readonly loginBtn: Button;

  constructor(page: Page) {
    super(page, page.locator('form#login'), 'Login Page');
    
    this.usernameInput = new Input(
      page,
      page.getByLabel('Username'),
      'Username Input'
    );
    
    this.passwordInput = new Input(
      page,
      page.getByLabel('Password'),
      'Password Input'
    );
    
    this.loginBtn = new Button(
      page,
      page.getByRole('button', { name: 'Log In' }),
      'Login Button'
    );
  }

  async expectLoaded() {
    await this.section('Login Page - verify loaded', async () => {
      await this.usernameInput.expectVisible();
    });
  }

  async performLogin(username: string, password: string) {
    await this.section('Perform login', async () => {
      await this.usernameInput.fill(username);
      await this.passwordInput.fill(password);
      await this.loginBtn.click();
      await this.page.waitForLoadState('networkidle');
    });
  }
}
```

### **Example 2: Page with Iframe**

**Codegen Output:**
```typescript
const iframe = page.frameLocator('[data-testid="main-body-iframe"]');
await iframe.getByRole('button', { name: 'Create' }).click();
await iframe.getByLabel('Job Title').fill('Engineer');
await iframe.getByRole('button', { name: 'Save' }).click();
```

**Framework Code:**

```typescript
// src/pages/ats/job-create.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';

export class JobCreatePage extends BasePage {
  readonly createBtn: Button;
  readonly jobTitleInput: Input;
  readonly saveBtn: Button;

  constructor(page: Page) {
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    super(page, mainFrame.locator('body'), 'Job Create Page');
    
    this.frameLocator = mainFrame;
    
    this.createBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: 'Create' }),
      'Create Button'
    );
    
    this.jobTitleInput = new Input(
      page,
      mainFrame.getByLabel('Job Title'),
      'Job Title Input'
    );
    
    this.saveBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: 'Save' }),
      'Save Button'
    );
  }

  async expectLoaded() {
    await this.section('Job Create - verify loaded', async () => {
      await this.createBtn.expectVisible();
    });
  }

  async fillJobTitle(title: string) {
    await this.section(`Fill job title: ${title}`, async () => {
      await this.jobTitleInput.fill(title);
    });
  }

  async clickSave() {
    await this.saveBtn.click();
  }
}
```

### **Example 3: Flow + Test**

**Framework Code:**

```typescript
// src/flows/ats/job.flow.ts
import { Page } from '@playwright/test';
import { BaseTest } from '@src/utils/base-test.util';
import { JobCreatePage } from '@src/pages/ats/job-create.page';
import { JobListPage } from '@src/pages/ats/job-list.page';

export class JobFlow {
  private readonly base: BaseTest;
  private readonly page: Page;
  readonly createPage: JobCreatePage;
  readonly listPage: JobListPage;

  constructor(baseTest: BaseTest, page: Page) {
    this.base = baseTest;
    this.page = page;
    this.createPage = new JobCreatePage(page);
    this.listPage = new JobListPage(page);
  }

  async createJob(title: string) {
    await this.base.logger.section('Create new job', async () => {
      await this.createPage.expectLoaded();
      await this.createPage.fillJobTitle(title);
      await this.createPage.clickSave();
      await this.listPage.expectLoaded();
    });
  }

  async verifyJobExists(title: string) {
    await this.base.logger.section('Verify job exists', async () => {
      const exists = await this.listPage.hasJobWithTitle(title);
      this.base.assertThat(exists).truthy();
    });
  }
}

// tests/specs/ats/ATS-T001.spec.ts
import { test } from '@tests/governance';
import { JobFlow } from '@src/flows/ats/job.flow';

test('ATS-T001 Create job and verify', async ({
  baseTest,
  testData,
  authPage
}) => {
  const page = authPage;
  const flow = new JobFlow(baseTest, page);
  
  await flow.createJob(testData.jobTitle);
  await flow.verifyJobExists(testData.jobTitle);
});
});
```

---

## ✅ Validation Checklist

Before committing generated code, verify:

### **Page Object Checklist**
- [ ] Extends `BasePage`
- [ ] All component fields are `readonly`
- [ ] Constructor uses 4-step pattern (no resolveLocator)
- [ ] All locators are single/simple (no `.or()` chains)
- [ ] Components receive frame-aware locators
- [ ] Has `expectLoaded()` method
- [ ] All operations wrapped in `this.section()`
- [ ] Correct `@src/` imports
- [ ] File in correct folder: `src/pages/[product]/[feature]/`
- [ ] NO assertions (`expect()` or `baseTest.assertThat()`)
- [ ] NO multi-page workflows
- [ ] NO hard waits (`waitForTimeout()`)

### **Flow Checklist**
- [ ] Constructor accepts `BaseTest` and `Page`
- [ ] Page objects declared as `readonly`
- [ ] Methods wrapped in `this.base.logger.section()`
- [ ] Uses typed parameter objects
- [ ] NO direct locators (`page.locator()`)
- [ ] NO hard waits
- [ ] File in correct folder: `src/flows/[product]/[feature]/`

### **Test Spec Checklist**
- [ ] Imports `test` from `@tests/governance`
- [ ] Uses fixtures: `baseTest`, `logger`, `testData`, `authPage`
- [ ] Creates flow instance
- [ ] Uses `logger.info()` for test milestones
- [ ] Assertions use `baseTest.assertThat()`
- [ ] NO page objects instantiated directly
- [ ] File in correct folder: `tests/specs/[product]/`

---

## 🎯 Quick Reference: Codegen → Framework

| Codegen Pattern | Framework Pattern |
|----------------|-------------------|
| `await page.waitForTimeout(2000)` | Remove (component auto-waits) |
| `await expect(el).toBeVisible()` | `await component.expectVisible()` |
| `await page.locator('#btn').click()` | `await this.btn.click()` (in page object) |
| `await page.getByRole('button').click()` | `await this.button.click()` |
| Inline navigation | Use `authPage` fixture or page object method |
| Multi-step workflow | Create Flow class |
| Hardcoded values | Use `testData` fixture |
| Direct assertions in test | Keep in test, use `baseTest.assertThat()` |
| `.or()` selector chains | Single selector + TODO comment |

---

## 🔍 Critical Codegen Analysis Checklist

### **Before Creating Pages - Extract These from Codegen:**

#### **1. Component Types from getByRole()**
```typescript
// ❌ WRONG - Guessing component type
await page.getByRole('button', { name: 'Admin' }).click();
const adminLink = new Link(page, locator, 'Admin'); // Wrong!

// ✅ CORRECT - Match the role
await page.getByRole('button', { name: 'Admin' }).click();
const adminBtn = new Button(page, locator, 'Admin Button'); // Correct!
```

**Rule**: Always use component type that matches codegen's `getByRole()`:
- `getByRole('button')` → `Button` component
- `getByRole('link')` → `Link` component  
- `getByRole('textbox')` → `Input` component
- `getByRole('checkbox')` → `Checkbox` component
- `getByRole('combobox')` → `Dropdown` component

#### **2. Exact Selectors (IDs, Names, XPaths)**
```typescript
// ❌ WRONG - Generic guessed selectors
await iframe.locator('#defaultVisible_1').click(); // Codegen doesn't show this!

// ✅ CORRECT - Extract exact selectors from codegen
await iframe.locator('#iform_public').click(); // Matches codegen exactly
```

**Rule**: Copy exact selector strings from codegen - never guess or use generic patterns.

#### **3. URL Patterns (Actions and Hash Values)**
```typescript
// ❌ WRONG - Guessed URL pattern
const url = `${baseUrl}/icims2?module=AppForm&action=editFormMaintenance&hashed=-867465855&form=${id}`;

// ✅ CORRECT - Exact URL from codegen
const url = `${baseUrl}/platform/icims2?module=AppForm&action=manageForm&hashed=629601670&form=${id}`;
```

**Rule**: Copy complete URL patterns including:
- Path prefix (`/platform`)
- Module and action names
- Hash values (even if they look random)
- Query parameter names

**IMPORTANT**: Avoid using hardcoded URLs in flow methods - prefer UI-based navigation instead (see next section).

#### **3.1. Navigation: UI-Based vs URL-Based**

**Critical Learning**: Hash values in URLs (`hashed=629601670`) are **unstable** and change between environments. Use UI-based navigation whenever possible.

```typescript
// ❌ WRONG - Hardcoded URL with hash values (UNSTABLE)
async navigateToIFormViews(iFormId: string) {
  const url = `${config.appBaseUrl}/platform/icims2?module=AppForm&action=editFormViews&hashed=-867465855&form=${iFormId}`;
  await this.page.goto(url); // Hash values may differ per environment!
}

async navigateToIFormQuestions(iFormId: string) {
  const url = `${config.appBaseUrl}/platform/icims2?module=AppForm&action=editFormQuestions&hashed=319681824&form=${iFormId}`;
  await this.page.goto(url);
}

// ✅ CORRECT - UI-based navigation (STABLE)
async navigateToIFormViews(iFormId: string) {
  await this.listPage.navigateTo(); // Menu → Admin → iForms → Create/Manage
  await this.listPage.expectLoaded();
  const mainFrame = this.page.frameLocator('[data-testid="main-body-iframe"]');
  await mainFrame.getByRole('link', { name: iFormId }).click(); // Click iForm name
  await this.viewsPage.expectLoaded();
}

async navigateToIFormQuestions(iFormId: string) {
  // If already on iForm page, use tab navigation
  await this.viewsPage.navigateToQuestions(); // Click "Questions" tab
  await this.questionsPage.expectLoaded();
}
```

**Navigation Strategy**:
1. **Initial Page Load**: Use `page.goto(config.appBaseUrl + '/module')` for first navigation
2. **Within Module**: Use tab/link clicks instead of URLs
3. **Between Modules**: Use menu navigation (hamburger → category → item)
4. **Same Module Tabs**: Add `navigateToX()` methods to page objects

**Page Object Pattern - Add Tab Navigation**:
```typescript
// Each tab page should have links to other tabs
export class IFormViewsPage extends BasePage {
  readonly questionsTab: Link;
  readonly maintenanceTab: Link;
  
  async navigateToQuestions() {
    await this.questionsTab.click();
    await this.page.waitForLoadState('networkidle');
  }
  
  async navigateToMaintenance() {
    await this.maintenanceTab.click();
    await this.page.waitForLoadState('networkidle');
  }
}
```

**Flow Pattern - Smart Navigation with Fallback**:
```typescript
async navigateToMaintenance(iFormId: string) {
  // Try to use tab navigation if already on iForm page
  try {
    await this.viewsPage.navigateToMaintenance();
  } catch {
    try {
      await this.questionsPage.navigateToMaintenance();
    } catch {
      // Not on iForm page, navigate there first
      await this.navigateToIFormViews(iFormId);
      await this.viewsPage.navigateToMaintenance();
    }
  }
  await this.maintenancePage.expectLoaded();
}
```

**When URL Navigation is OK**:
- ✅ Initial application entry: `page.goto(config.appBaseUrl)`
- ✅ Login page: `page.goto(config.appBaseUrl + '/login')`
- ✅ Direct API routes without hash parameters
- ❌ Any URL with `hashed=` parameter
- ❌ Navigation between related pages/tabs

#### **5. Input Field Types**
```typescript
// ❌ WRONG - Wrong component for text input
await page.locator('#year').click();
await page.keyboard.type('2025');
const yearDiv = new Div(page, locator, 'Year');

// ✅ CORRECT - Use Input component with fill()
await page.locator('#year').fill('2025');
const yearInput = new Input(page, locator, 'Year Input');
```

**Rule**: Textboxes always use `Input` component with `fill()` method:
- `<input type="text">` → `Input` with `fill()`
- `<textarea>` → `Input` with `fill()`
- NOT `Div` with `click() + keyboard.type()`

#### **6. Radio Buttons vs Checkboxes**
```typescript
// Codegen shows:
await iframe.locator('#iform_public').click(); // Radio button
await iframe.locator('#IFormObject_formtype').check(); // Checkbox

// ✅ CORRECT - Both use Checkbox component (Playwright treats radio as checkable)
this.publicRadio = new Checkbox(page, iframe.locator('#iform_public'), 'Public Radio');
this.personCheckbox = new Checkbox(page, iframe.locator('#IFormObject_formtype'), 'Person Checkbox');
```

**Rule**: Both radio buttons and checkboxes use `Checkbox` component in framework.

#### **7. Navigation Element Hierarchy**
```typescript
// Codegen shows sequence:
await page.getByRole('button', { name: 'Navigator Menu' }).click();
await page.getByRole('button', { name: 'Admin' }).click(); // BUTTON not link!
await page.getByRole('button', { name: 'iForms' }).click(); // BUTTON not link!
await page.getByRole('link', { name: 'Create/Manage iForms' }).click(); // Now a LINK

// ✅ CORRECT - Match each element's actual type
this.navigatorBtn = new Button(..., 'Navigator Menu');
this.adminBtn = new Button(..., 'Admin Button'); // Not Link!
this.iFormsBtn = new Button(..., 'iForms Button'); // Not Link!
this.createManageLink = new Link(..., 'Create/Manage iForms');
```

**Rule**: Don't assume navigation elements are Links - verify each one's role in codegen.

### **Codegen Analysis Workflow**

1. **Read codegen top to bottom** - Note every `getByRole()`, `locator()`, `goto()` call
2. **Extract all selectors** - Create a selector map: `elementName → selector string`
3. **Map roles to components** - `getByRole('X')` → Framework component type
4. **Note all URLs** - Copy exact URLs with all parameters
5. **Identify input types** - Text fields = Input, not Div
6. **Create pages** - Use extracted selectors exactly as found
7. **Verify** - Compare created page against codegen line-by-line

---

## 📝 TODO Template

When uncertain about selectors, use this pattern:

```typescript
// TODO: Verify actual selector for [element description]
// Current selector is best guess from codegen
// May need to inspect actual DOM to confirm
this.element = new ComponentType(
  page,
  frame.locator('[data-testid="TODO-element-name"]'),
  'Element Name'
);
```

---

## 🚀 Generation Workflow

1. **Analyze Codegen**: Identify pages, flows, and test steps
2. **Extract Locators**: Pull all unique locators
3. **Create Page Objects**: One per distinct page/modal
4. **Create Flow**: Orchestrate page objects
5. **Create Test Spec**: Use flow + assertions
6. **Validate**: Run through checklist
7. **Add TODOs**: Mark uncertain selectors
8. **Test**: Run and refine selectors as needed

---

## 🔍 Debugging Tips

### **Issue: Element Not Found**
- Check iframe context (is `frameLocator` correct?)
- Verify locator selector (inspect actual DOM)
- Ensure component auto-wait is working
- Check if element is in a different frame

### **Issue: Test Timing Out**
- Remove any `waitForTimeout()` calls
- Ensure `expectLoaded()` is called on pages
- Check `waitForLoadState('networkidle')` on navigation
- Verify component auto-wait isn't stuck

### **Issue: Assertion Failing**
- Ensure assertion is in TEST, not page object
- Use `baseTest.assertThat()`, not `expect()`
- Check test data is loaded correctly

---

## 🪟 TabManager (Multi-Window/Popup Handling)

### **When to Use TabManager**
- Test opens new windows/tabs (target="_blank")
- Test opens popups
- Test navigates between multiple browser contexts
- Need to verify content in external links

### **TabManager Pattern**

```typescript
// tests/specs/ats/ATS-T999.spec.ts
test('Test with popup handling', async ({
  baseTest,
  logger,
  authPage,
  tabs // TabManager fixture
}) => {
  const page = authPage;
  const flow = new FeatureFlow(baseTest, page);
  
  // Register main tab
  tabs.registerMain(page, 'Main Tab');
  
  // Click button that opens popup
  const popup = await tabs.openPopupByClick(
    page,
    flow.page.externalLinkBtn, // Component that triggers popup
    'External Portal', // Friendly name for popup
    { timeout: 20000 }
  );
  
  // Switch focus to popup
  await tabs.switchTo('External Portal');
  
  // Interact with popup (create page object for popup content)
  const portalPage = new PortalViewPage(popup);
  await portalPage.expectLoaded();
  await portalPage.verifyJobListing();
  
  // Close popup
  await tabs.close('External Portal');
  
  // ALWAYS switch back to main tab
  await tabs.switchTo('Main Tab');
  
  logger.info('Popup interaction completed');
});
```

### **TabManager Key Methods**

| Method | Purpose | Example |
|--------|---------|---------|
| `registerMain(page, name)` | Register main tab | `tabs.registerMain(page, 'Main Tab')` |
| `openPopupByClick(page, component, name)` | Click and capture popup | `await tabs.openPopupByClick(page, btn, 'Popup')` |
| `switchTo(name)` | Switch active tab | `await tabs.switchTo('Main Tab')` |
| `close(name)` | Close specific tab | `await tabs.close('Popup')` |
| `listTabs()` | Get all tab names | `const tabs = tabs.listTabs()` |

### **TabManager Best Practices**

✅ **DO**:
- Register main tab at test start
- Switch back to "Main Tab" after popup interaction
- Use descriptive tab names
- Close popups when done

❌ **DON'T**:
- Forget to switch back to main tab
- Leave tabs open
- Assume tab order remains constant

### **Example: Popup Page Object**

```typescript
// src/pages/ats/portal-job-view.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';

/**
 * PortalJobViewPage
 * Represents external job portal opened in popup window
 * Note: Popup may have its own iframe structure
 */
export class PortalJobViewPage extends BasePage {
  readonly applyBtn: Button;
  readonly jobTitle: Div;

  constructor(page: Page) {
    // Check if popup has iframe
    const contentFrame = page.frameLocator('iframe[name="icims_content_iframe"]');
    
    super(page, contentFrame.locator('body'), 'Portal Job View');
    
    this.applyBtn = new Button(
      page,
      contentFrame.getByRole('button', { name: 'Apply' }),
      'Apply Button'
    );
    
    this.jobTitle = new Div(
      page,
      contentFrame.locator('h1.job-title'),
      'Job Title'
    );
  }

  async expectLoaded() {
    await this.section('Portal - verify loaded', async () => {
      await this.jobTitle.expectVisible();
    });
  }

  async verifyJobListing() {
    await this.section('Verify job listing visible', async () => {
      await this.applyBtn.expectVisible();
    });
  }
}
```

---

## 🔌 API Client (Data Setup in Flows)

### **Why Use API for Data Setup**
- **Speed**: 10-100x faster than UI
- **Reliability**: No UI flakiness
- **Isolation**: Fresh data per test
- **Reusability**: Same factories across tests

### **API Client Pattern in Flows**

```typescript
// src/flows/ats/candidate.flow.ts
import { Page } from '@playwright/test';
import { BaseTest } from '@src/utils/base-test.util';
import { CandidateFactory } from '@src/data-factory/candidate.factory';
import { CandidateProfilePage } from '@src/pages/ats/candidate-profile.page';

export class CandidateFlow {
  private readonly base: BaseTest;
  private readonly page: Page;
  private readonly factory: CandidateFactory;
  readonly profilePage: CandidateProfilePage;

  constructor(baseTest: BaseTest, page: Page) {
    this.base = baseTest;
    this.page = page;
    this.factory = new CandidateFactory();
    this.profilePage = new CandidateProfilePage(page);
  }

  /**
   * Create candidate via API, then verify in UI
   */
  async createCandidateViaAPI(data: Partial<Candidate>) {
    return await this.base.logger.section('Create candidate via API', async () => {
      // Use API client from baseTest
      const candidate = await this.factory.create(this.base.api!, data);
      
      this.base.logger.info('Candidate created', { 
        id: candidate.id,
        email: candidate.email 
      });
      
      return candidate;
    });
  }

  /**
   * Navigate to candidate profile and verify data
   */
  async verifyCandidate(candidateId: string) {
    await this.base.logger.section('Verify candidate in UI', async () => {
      await this.profilePage.navigateToProfile(candidateId);
      await this.profilePage.expectLoaded();
    });
  }
}
```

### **Using API Client in Tests**

```typescript
// tests/specs/ats/ATS-T888.spec.ts
test('ATS-T888 Create candidate via API and verify', async ({
  baseTest,
  logger,
  testData,
  authPage,
  apiClient // API client fixture
}) => {
  const page = authPage;
  const flow = new CandidateFlow(baseTest, page);
  
  // Setup data via API
  const candidate = await flow.createCandidateViaAPI({
    firstName: testData.firstName,
    lastName: testData.lastName,
    email: testData.email
  });
  
  // Verify in UI
  await flow.verifyCandidate(candidate.id);
  
  // Assert
  const displayedName = await flow.profilePage.getCandidateName();
  baseTest.assertThat(displayedName).contains(testData.firstName);
  
  logger.info('Test completed');
});
```

### **API Response Assertions**

```typescript
// In flow method
const response = await this.base.api!.get(`/candidates/${candidateId}`);

// Attach to Playwright report
await response.attach();

// Assert status
this.base.assertThat(response.statusCode()).equals(200);

// Assert response data
const data = response.as<Candidate>();
this.base.assertThat(data.email).equals(expectedEmail);
```

---

## 🎯 Component Methods Reference

### **Button Component**

```typescript
await button.click();                  // Standard click
await button.click({ force: true });   // Force click (bypass actionability)
await button.expectVisible();          // Assert visible
await button.expectHidden();           // Assert hidden
await button.isEnabled();              // Check enabled state (boolean)
await button.isVisible();              // Check visibility (boolean)
await button.getText();                // Get button text
```

### **Input Component**

```typescript
await input.fill('value');             // Fill input (auto-sanitized in logs)
await input.type('text', 50);          // Type with delay (ms)
await input.clear();                   // Clear input
const value = await input.inputValue(); // Get current value
```

### **Dropdown Component**

```typescript
await dropdown.select('Option Text');   // Select by visible text
await dropdown.select('value');         // Select by value
await dropdown.pickByText('Text');      // Explicit text selection
await dropdown.pickByIndex(2);          // Select by index
await dropdown.pickByValue('val');      // Select by value attribute
```

### **Checkbox Component**

```typescript
await checkbox.check();                // Check checkbox
await checkbox.uncheck();              // Uncheck checkbox
const isChecked = await checkbox.isChecked(); // Get checked state
```

### **Table Component**

```typescript
const row = await table.getRowByText('search text');
const cellValue = await table.getCellValue(rowIndex, columnIndex);
const rowCount = await table.getRowCount();
```

### **Div Component** (Generic Container)

```typescript
const text = await div.getText();       // Get text content
await div.click();                      // Click container
await div.dblclick();                   // Double-click container
await div.expectVisible();              // Assert visible
```

### **Link Component**

```typescript
await link.click();                     // Click link
const url = await link.href();          // Get href attribute
```

---

## ⚠️ Common Error Patterns & Solutions

### **Error 1: "locator.resolveLocator is not a function"**

```typescript
// ❌ WRONG - Method removed
const loc = this.resolveLocator('#button');

// ✅ FIX - Use direct frame locator
this.button = new Button(page, frame.locator('#button'), 'Button');
```

### **Error 2: "Timeout waiting for element"**

```typescript
// ❌ WRONG - Element in different iframe
const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
const button = new Button(page, page.locator('#btn'), 'Button'); // Wrong context!

// ✅ FIX - Use correct frame context
const button = new Button(page, mainFrame.locator('#btn'), 'Button');
```

### **Error 3: "Element is not actionable"**

```typescript
// ❌ WRONG - Component not auto-waiting properly
await button.click({ timeout: 1000 }); // Too short

// ✅ FIX - Remove timeout, let component auto-wait
await button.click(); // Uses framework default timeout
```

### **Error 4: "Cannot read property 'page' of undefined"**

```typescript
// ❌ WRONG - Not passing BaseTest to flow
const flow = new JobFlow(page);

// ✅ FIX - Pass baseTest fixture
const flow = new JobFlow(baseTest, page);
```

### **Error 5: "expect is not defined"**

```typescript
// ❌ WRONG - Using Playwright expect in page object
await expect(this.element).toBeVisible();

// ✅ FIX - Use component methods
await this.element.expectVisible();

// OR in test, use baseTest.assertThat()
baseTest.assertThat(value).equals(expected);
```

### **Error 6: "Multiple elements found"**

```typescript
// ❌ WRONG - Locator too broad
const button = new Button(page, frame.locator('button'), 'Button');

// ✅ FIX - Make locator more specific
const button = new Button(
  page, 
  frame.getByRole('button', { name: 'Submit' }),
  'Submit Button'
);
// OR add .first()
const button = new Button(page, frame.locator('button').first(), 'First Button');
```

### **Error 7: "Page closed/destroyed"**

```typescript
// ❌ WRONG - Not switching back to main tab
await tabs.close('Popup');
// Continue using closed tab context

// ✅ FIX - Always switch back
await tabs.close('Popup');
await tabs.switchTo('Main Tab');
```

---

## 📊 Test Data Loading Strategy

### **Data Merging Hierarchy**

```
Final Test Data = Common Defaults + Environment Overrides + Scenario Data
```

### **File Structure**

```
tests/data/
├── common/
│   ├── defaults.global.json      # Universal defaults
│   ├── defaults.phone.json       # Phone number patterns
│   └── defaults.address.json     # Address patterns
├── env/
│   ├── dev/
│   │   └── env-overrides.json    # Dev-specific values
│   ├── qa/
│   │   └── env-overrides.json    # QA-specific values
│   └── staging/
│       └── env-overrides.json    # Staging-specific values
└── scenarios/
    └── ats/
        ├── ATS-T001.json         # Test-specific data
        ├── ATS-T002.json
        └── ATS-T124.json
```

### **Example Data Files**

**defaults.global.json**
```json
{
  "candidateDefaults": {
    "firstName": "Auto",
    "lastName": "Generated",
    "currency": "USD",
    "salary": "50000"
  },
  "jobDefaults": {
    "status": "Open",
    "type": "Full-Time"
  }
}
```

**env/qa/env-overrides.json**
```json
{
  "baseUrl": "https://test720.icims.com",
  "apiUrl": "https://api-test720.icims.com",
  "candidateDefaults": {
    "folder": "QA Test Candidates"
  }
}
```

**scenarios/ats/ATS-T124.json**
```json
{
  "workflowId": "12345",
  "advanceStatus": "Initial Review: Reviewed",
  "rejectStatus": "Not Selected",
  "portalName": "External Portal"
}
```

### **Using Test Data in Tests**

```typescript
test('ATS-T124 Test', async ({ baseTest, testData }) => {
  // testData is automatically merged
  
  // Access scenario-specific data
  const workflowId = testData.workflowId;
  
  // Access common defaults (merged)
  const firstName = testData.candidateDefaults.firstName;
  
  // Access env-specific overrides (merged)
  const folder = testData.candidateDefaults.folder; // "QA Test Candidates"
});
```

### **Data Loading Implementation**

```typescript
// src/config/data-loader.util.ts (already exists in framework)
export function loadTestData(testId: string, env: string = 'qa') {
  const commonDefaults = deepMerge(
    readJSON('tests/data/common/defaults.global.json'),
    readJSON('tests/data/common/defaults.phone.json'),
    readJSON('tests/data/common/defaults.address.json')
  );

  const envOverrides = readJSON(`tests/data/env/${env}/env-overrides.json`);
  const scenario = readJSON(`tests/data/scenarios/ats/${testId}.json`);

  // Merge priority: scenario > env > common
  return deepMerge(commonDefaults, envOverrides, scenario);
}
```

---

## 🔐 Authentication Patterns

### **Pattern 1: Use `authPage` Fixture (RECOMMENDED)**

```typescript
// ✅ BEST - Use pre-authenticated page
test('Test with auth', async ({ baseTest, authPage, tabs }) => {
  const page = authPage; // Already logged in as default role
  
  tabs.registerMain(page, 'Main Tab');
  
  const flow = new FeatureFlow(baseTest, page);
  await flow.performAction();
});
```

**When to use:**
- 95% of tests
- Default role (recruiter/admin) is sufficient
- Want fastest test execution

### **Pattern 2: Manual Login in Test (RARE)**

```typescript
// ⚠️ USE SPARINGLY - Only when auth fixture can't be used
test('Test with manual login', async ({ baseTest, logger }) => {
  const page = baseTest.page; // Unauthenticated page
  
  const loginFlow = new ATSLoginFlow(page, logger);
  const creds = config.secrets.ats.roleCredentials.recruiter;
  
  await loginFlow.login({
    username: creds.username,
    password: creds.password
  }, 'Recruiter');
  
  const flow = new FeatureFlow(baseTest, page);
  await flow.performAction();
});
```

**When to use:**
- Testing login functionality itself
- Need specific role not in auth cache
- Testing authentication failure scenarios

### **Pattern 3: Multi-Role Switching**

```typescript
// ✅ BEST - Use baseTest.as() for role switching
test('Test with multiple roles', async ({ baseTest, authPage, tabs }) => {
  const page = authPage; // Default role
  tabs.registerMain(page, 'Main Tab');
  
  const flow = new WorkflowFlow(baseTest, page);
  
  // Perform action as default role
  await flow.createWorkflow();
  
  // Switch to admin role
  const { base: adminBase, dispose } = await baseTest.as('admin');
  const adminFlow = new WorkflowFlow(adminBase, adminBase.page);
  
  // Perform action as admin
  await adminFlow.approveWorkflow();
  
  // Cleanup admin session
  await dispose();
  
  // Back to default role
  await tabs.switchTo('Main Tab');
});
```

**When to use:**
- Workflow requires different permission levels
- Testing role-based access control
- Multi-user collaboration scenarios

### **Authentication Decision Tree**

```
Need authentication?
├─ Testing login flow?
│  └─ Use Pattern 2 (Manual Login)
├─ Need multiple roles?
│  └─ Use Pattern 3 (baseTest.as())
└─ Standard test?
   └─ Use Pattern 1 (authPage fixture) ✅
```

---

## 🎨 Advanced Patterns

### **Pattern: Conditional Element Handling**

```typescript
// Handle optional elements gracefully
async closeModalIfPresent() {
  await this.section('Close modal if present', async () => {
    const isVisible = await this.closeBtn.isVisible().catch(() => false);
    if (isVisible) {
      await this.closeBtn.click();
    }
  });
}
```

### **Pattern: Dynamic Component Creation**

```typescript
// Create components dynamically based on runtime data
async selectOptionByName(optionName: string) {
  await this.section(`Select option: ${optionName}`, async () => {
    // TODO: Verify selector pattern for dynamic options
    const option = new Button(
      this.page,
      this.frameLocator.locator(`text=${optionName}`).first(),
      `Option: ${optionName}`
    );
    await option.click();
  });
}
```

### **Pattern: Reusable Verification Methods**

```typescript
// In page object
async verifyFieldValue(fieldName: string, expectedValue: string) {
  await this.section(`Verify ${fieldName} = ${expectedValue}`, async () => {
    // TODO: Replace with actual field selector pattern
    const field = new Div(
      this.page,
      this.frameLocator.locator(`[data-field="${fieldName}"]`),
      `Field: ${fieldName}`
    );
    const actualValue = await field.getText();
    
    // Don't assert in page object - return value for test to assert
    return actualValue;
  });
}

// In test
const value = await page.verifyFieldValue('Status', 'Active');
baseTest.assertThat(value).equals('Active');
```

---

## 📱 Mobile/Responsive Testing (Future)

```typescript
// Pattern for future mobile support
test('Test on mobile viewport', async ({ baseTest, authPage }) => {
  await authPage.setViewportSize({ width: 375, height: 667 }); // iPhone SE
  
  const flow = new MobileFlow(baseTest, authPage);
  await flow.performMobileAction();
});
```

---

**Document Version**: 2.2  
**Last Updated**: December 12, 2025  
**Maintained By**: QA Automation Team

**Changelog**:
- v2.2: Added Rules 9-10 (test import pattern, component locator access), updated component methods (dblclick, inputValue)
- v2.1: Added TabManager, API Client, Component Methods, Error Patterns, Test Data, Authentication patterns
- v2.0: Initial comprehensive guidelines

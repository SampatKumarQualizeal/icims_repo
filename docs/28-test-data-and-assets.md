
# 📘 **TEST DATA & ASSETS HANDLING GUIDE**

This document defines **how test data and assets are stored, loaded, and used** inside the automated test framework.

It ensures:

* **Consistent multi-environment data loading**
* **Zero hard-coding inside tests**
* **Full DRY principles**
* **Spec readability**
* **Reusability across ATS, CRM, CST, CMS, TXTE**
* **Separation of responsibilities**

---

# 🎯 **1. Types of Test Data**

Your framework supports **three categories** of data:

---

## **1.1 Scenario-Specific Data**

Stored per test case ID:

```
tests/test-data/scenarios/<product>/<TEST-ID>.json
```

Example:

```
tests/test-data/scenarios/ats/ATS-T113.json
```

This contains only **data needed for this specific test**:

```json
{
  "firstName": "AutoBrian",
  "salary": "1000",
  "address": {...}
}
```

Loaded into `baseTest.testData`.

---

## **1.2 Environment Overrides**

Used to override common data across environments:

```
tests/test-data/env/qa.json
tests/test-data/env/stage.json
tests/test-data/env/dev.json
```

Example:

```json
{
  "baseUrl": "https://qa.icims.com",
  "candidateDefaults": { "source": "Company Website" }
}
```

---

## **1.3 Common Defaults**

Shared across ALL tests and ALL environments:

```
tests/test-data/common/defaults.json
tests/test-data/common/candidate-defaults.json
tests/test-data/common/job-defaults.json
```

Used to avoid repeating:

* default salary
* default phone number
* default folder
* default address
* default resume file path

---

# 🎯 **2. Loading Priority (Top → Bottom)**

Your `loadTestData` function merges data in this order:

```
1. DEFAULTS
2. ENV overrides
3. SCENARIO data
```

Meaning:

* Defaults → always included
* Environment → overrides defaults
* Scenario → overrides everything

### Example merge:

```
defaults     { resumePath: "default.docx" }
env          { resumePath: "qa.docx" }
scenario     { resumePath: "custom.docx" }
------------------------------------------
FINAL        { resumePath: "custom.docx" }
```

This ensures **maximum flexibility** and **minimum duplication**.

---

# 🎯 **3. Where Test Data Lives at Runtime**

Inside the test, you get:

```ts
baseTest.testData
```

Inside flows:

```ts
const data = base.testData;
```

Inside role-switch sessions:

```ts
const admin = await baseTest.as('admin');
console.log(admin.base.testData);
```

All use the exact same merged object.

---

# 🎯 **4. Using testId to Locate Scenario Data**

Your governance fixture extracts it automatically:

```ts
const id = baseTest.getTestId(testInfo);   // ATS-T113
```

This allows the loader to find:

```
scenarios/ats/ATS-T113.json
```

You NEVER type test IDs manually inside code.

---

# 🎯 **5. Assets Handling**

Assets (attachments, resumes, PDFs, videos, etc.) must be stored under:

```
tests/assets/<category>/
```

Recommended structure:

```
tests/assets/
  resumes/
    brian-farley.docx
    sample-qa.docx
  documents/
  pdf/
  videos/
  screenshots/
```

### Referencing Assets in Tests

**NEVER use relative paths in specs.**
Always reference via testData:

```json
{
  "resumePath": "tests/assets/resumes/brian-farley.docx"
}
```

Then in flows:

```ts
await page.setInputFiles('#resumeUpload', base.testData.resumePath);
```

This keeps **specs clean** and **centralizes path management**.

---

# 🎯 **6. Multi-Environment Asset Overrides**

Environment files can reference different assets:

```
env/qa.json
```

```json
{
  "resumePath": "tests/assets/resumes/qa-default.docx"
}
```

```
env/stage.json
```

```json
{
  "resumePath": "tests/assets/resumes/staging-candidate.docx"
}
```

Works automatically with no extra logic.

---

# 🎯 **7. Best Practices**

### ✔ Put test-specific data ONLY in scenario files

Scenario files should contain the **minimum required data**.

### ✔ Everything else goes in defaults

Common reusable constants belong in defaults.

### ✔ NEVER hardcode values inside tests

Specs should only call:

```ts
baseTest.testData
```

### ✔ NEVER hardcode selectors inside test data

Selectors are part of Page Objects, not test data.

### ✔ Use assets via testData paths

Flows should never reference assets directly.

### ✔ Scenario files use camelCase

E.g., `firstName`, `lastName`, `resumePath`.

---

# 🎯 **8. How Governance Delivers Test Data**

Governance fixture:

```ts
testData: async ({ testId }, use) => {
  const env = process.env.ENV || 'qa';
  const merged = loadTestData(testId, env);
  await use(merged);
}
```

BaseTest receives:

```ts
new BaseTest(page, logger, tabs, {
  testId,
  testData
});
```

Flow usage:

```ts
async completeCandidateWizard(base: BaseTest) {
  const data = base.testData;
  ...
}
```

✔ No passing data around
✔ No manual loading
✔ Specs stay clean

---

# 🎯 **9. Example Folder Structure**

```
tests/
  test-data/
    common/
      defaults.json
      candidate-defaults.json
    env/
      qa.json
      stage.json
      dev.json
    scenarios/
      ats/
        ATS-T113.json
        ATS-T118.json
      crm/
        CRM-T22.json

  assets/
    resumes/
    documents/
    pdf/
    videos/

  governance/
    index.ts
    metadata.ts
    env.check.ts
    dod.check.ts
```

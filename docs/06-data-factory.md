
# **06 – Data Factory Layer (Test Data Generation & API Integration)**

The **Data Factory** layer is responsible for generating, manipulating, and retrieving **test data** using APIs or synthetic builders.
It ensures that every automated test begins with **clean, reliable, reproducible, and isolated data**, without relying on pre-existing UI or manual setup.

This subsystem dramatically reduces test flakiness, speeds up execution, and allows complex workflows to operate without UI-heavy preparation steps.

---

# 🎯 **Why a Data Factory?**

Large enterprise test suites face recurring issues:

* Slow UI-driven setup steps
* Flaky flows caused by partial UI state
* Reluctance to re-use stale data
* Difficulty replicating customer flows
* Inconsistent environments
* API/UI mismatch
* No control over dependent workflows

The Data Factory layer solves these by providing:

### ✔ Rapid data creation

### ✔ API-based setup

### ✔ Synthetic + randomized data

### ✔ Ability to bypass UI setup

### ✔ Creation of isolated test data per run

### ✔ Strong logging + traceability

### ✔ Consistent patterns across all data types

### ✔ Support for customer-specific test data

---

# 📁 **Folder Structure**

```
src/data-factory/
  base.factory.ts
  candidate.factory.ts
  job.factory.ts
  user.factory.ts
```

This structure is deliberately modular so each type of data object gets its own factory.

---

# 🧱 **1. BaseFactory (Parent Class)**

All factories extend from:

```
src/data-factory/base.factory.ts
```

This class provides common capabilities:

### ✔ Authentication via API

### ✔ Persistent API client

### ✔ Logging integration

### ✔ Error handling

### ✔ Data transformation utilities

### ✔ Random data builder helpers

### ✔ Consistent base URL handling

### Example interface:

```ts
export abstract class BaseFactory {
  protected apiClient: ApiClient;
  protected logger: Logger;

  constructor(baseUrl: string, logger?: Logger) {
    this.apiClient = new ApiClient(baseUrl);
    this.logger = logger ?? (globalThis as any).__TEST_LOGGER__;
  }

  async authenticate(username: string, password: string) {
    await this.apiClient.login(username, password);
    this.logger.info("Factory authenticated", { username });
  }
}
```

---

# 🧩 **2. CandidateFactory**

Handles creation of candidates for ATS workflows.

Functions:

* `create()`
* `delete()`
* `attachResume()`
* `updateCandidate()`
* `searchCandidate()`
* `generateCandidateData()`

### Example usage:

```ts
const candidateFactory = new CandidateFactory(config.apiBaseUrl);

await candidateFactory.authenticate(
  secrets.adminUser,
  secrets.adminPass
);

const candidate = await candidateFactory.create({
  resume: true,
  tags: ["automation"]
});

logger.info("Candidate created", candidate);
```

### Example output:

```json
{
  "id": 824822,
  "firstName": "John",
  "lastName": "Robinson",
  "email": "john.robinson+822@icims.com",
  "resumeAttached": true
}
```

---

# 📌 **3. JobFactory**

Handles job posting flows.

Capabilities:

* `create()`
* `publish()`
* `close()`
* `addHiringManager()`
* `assignRecruiters()`
* `generateJobData()`

### Example:

```ts
const jobFactory = new JobFactory(config.apiBaseUrl);
await jobFactory.authenticate(config.secrets.adminUser, config.secrets.adminPass);

const job = await jobFactory.create({
  title: "QA Manager",
  location: "New York",
  templateId: 1234
});
```

---

# 🧩 **4. UserFactory**

Creates and configures users.

Capabilities:

* `createUser()`
* `assignRoles()`
* `activate()`
* `lock()`
* `getUser()`

### Example:

```ts
const user = await userFactory.create({
  email: "testuser@example.com",
  role: "RECRUITER"
});
```

---

# 🧱 **5. Data Builder Pattern (Synthetic Test Data)**

Factories use **synthetic builders** to generate randomized yet structured data.

Example:

```ts
generateCandidateData() {
  return {
    firstName: name.first(),
    lastName: name.last(),
    email: email.random("@test.com"),
    phone: randomPhone(),
    experience: faker.number(),
    resume: true
  }
}
```

This ensures each test receives:

### ✔ Unique

### ✔ Valid

### ✔ Well-formatted

test data without risk of collisions.

---

# 🔁 **6. API + UI Blended Flows**

The framework encourages creating data via API, then verifying it via UI.

### Example:

```ts
const candidate = await candidateFactory.create({ resume: true });
await loginPage.login(config.secrets.ats.uiUser, config.secrets.ats.uiPass);
await dashboardPage.searchCandidate(candidate.email);
await candidatePage.expectLoaded();
```

This offers:

* speed (API creation)
* accuracy (UI validation)
* reliability (data always valid before UI runs)

---

# 🧠 **7. Integration with Logger**

Every factory logs actions using the global logger:

```
[Factory] Candidate created { id: 122 }
[Factory] Resume attached
[Factory] Authentication successful
```

This allows evidence collector to ingest logs automatically.

---

# 📄 **8. Integration with Execution Profiles**

Factories can respect execution profiles (FAST / SAFE / DEBUG):

* DEBUG → verbose logging, API payload dumps
* SAFE → retries on flaky endpoints
* FAST → minimal logging

---

# 🔍 **9. Integration with RCA Engine**

Failures inside data factories can produce:

* API timeouts → `NETWORK_FAILURE`
* 400/422 errors → `DATA_ISSUE`
* 500/503 → `BACKEND_5XX`
* Missing required fields → `ASSERTION_FAILURE`

Output stored in `rca.json` for quick triage.

---

# 📊 **10. Integration with Trend Engine**

Every API/data failure contributes to:

```
trends.json
```

Enabling dashboards to show:

* Regressions in API quality
* Frequent backend failures
* Which workflows rely most on data factories
* Test readiness health

---

# 🧩 **11. Example: End-to-End Test Using Data Factory**

```ts
test('ATS CW using Data Factory + Login', async ({ authPage, runPreChecks, logger }) => {

  await runPreChecks();

  const candidateFactory = new CandidateFactory(config.apiBaseUrl);
  await candidateFactory.authenticate(config.secrets.adminUser, config.secrets.adminPass);

  const candidate = await candidateFactory.create({ resume: true });
  logger.info("Candidate created for test", candidate);

  const login = new LoginPage(authPage);
  await login.goto();
  await login.login(config.secrets.ats.uiUser, config.secrets.ats.uiPass);

  const dashboard = new DashboardPage(authPage);
  await dashboard.expectLoaded();

});
```

---

# 🧭 **12. Best Practices**

### ✔ Always authenticate once

### ✔ Use builders for synthetic data

### ✔ Pass friendly logging names where possible

### ✔ Do not hardcode IDs—let factories create data

### ✔ Use API for setup, UI for validation

### ✔ Return minimal, clean objects from factories

### ✔ Avoid mixing UI and API in the same class

### ✔ Keep factories focused on *data*, not business flows

---

# 🔮 **13. Future Scope**

The Data Factory is designed to expand:

### ➤ Environment Replicator Integration

Factories can detect/test/replicate DB-level flags for customer environments.

### ➤ Random Scenario Generators

Auto-create test scenarios with multiple entities.

### ➤ Bulk Factories

Mass creation of jobs/candidates for load testing.

### ➤ Schema Validators

Validate API contracts before generating data.

### ➤ ML-assisted Data Generators

Generate edge-case data automatically.

---

# 🔚 **Summary**

The Data Factory subsystem provides:

### ✔ Fast

### ✔ Reliable

### ✔ Repeatable

### ✔ Scalable

### ✔ API-integrated

### ✔ Log-integrated

### ✔ RCA-aware

### ✔ Evidence-aware

test data generation that eliminates the biggest sources of flakiness and reduces test creation time drastically.

It is a cornerstone feature enabling the framework’s enterprise maturity.


# **11 – Pre-Checks & Governance Controls**

The **Pre-Checks and Governance Layer** ensures that every automated test runs under **strict, auditable, and predictable rules**.
It is designed to prevent false failures, enforce quality standards, and guarantee that tests only run when the environment is healthy.

This layer is essential in enterprise contexts where:

* multiple environments exist (dev/qa/staging/customer sandboxes)
* infrastructure instability can skew results
* compliance & governance require proof of validation
* teams want early detection of systemic issues
* failures must be attributable to the correct root cause

This documentation describes how the framework enforces these mandatory controls.

---

# 🧱 **What are Pre-Checks?**

Pre-Checks are a set of **non-negotiable system validations** that run **before ANY test executes**.

They validate:

### ✔ Environment stability

### ✔ Application readiness

### ✔ System configuration

### ✔ UI Definition of Done standards

### ✔ Network readiness

### ✔ LaunchDarkly (or feature flag) consistency

### ✔ Authentication readiness

Their primary function is to ensure:

> **“Do not run tests on a broken environment.”**

This massively reduces flaky failures and wasted debug time.

---

# 📁 **Location**

```
tests/governance/env.check.ts
tests/governance/dod.check.ts
tests/governance/index.ts   (fixture integration)
```

Integrated into governance fixture:

```ts
runPreChecks: async ({ page, logger }, use, testInfo) => { ... }
```

---

# 🚦 **1. Why Pre-Checks Are Mandatory**

Without pre-checks, your automation is vulnerable to:

* environment outages
* bad deployments
* missing services
* API failures
* invalid login pages
* broken UI due to partial releases
* network flakiness
* inconsistent UI load times

These lead to:

* false positives
* non-actionable failures
* wasted engineering hours

Pre-Checks transform your framework into a **gated execution platform**.

---

# 🔍 **2. Pre-Check Workflow**

When a test begins, this is the sequence:

### 1. Network Stabilization

Waits until the browser reaches **network idle** to avoid premature checks.

### 2. Environment Health Check (`env.check.ts`)

Validates readiness of:

* Application URL accessibility
* Key API endpoints
* Branding and login elements
* Environment version text (if applicable)
* Basic navigation path availability

### 3. Definition of Done Check (`dod.check.ts`)

Validates high-level product standards such as:

* Page contains necessary accessibility attributes
* Required headers/footers present
* Feature-flag dependent UI elements are stable
* Language/locale settings
* Performance thresholds (optional)

### 4. Attachment to Test Artifacts

Results of both checks get attached to the Playwright report and archived via EvidenceCollector.

If pre-checks fail → **test is aborted early**, and results are stored for RCA and governance review.

---

# 📄 **3. Environment Health Check (env.check.ts)**

This module runs a series of low-level checks to ensure:

* App is reachable
* Login page loads correctly
* Required DOM elements exist
* APIs are responsive

Example check:

```ts
{
  name: "Application reachable",
  ok: response.status() === 200
}
```

### Output example:

```json
[
  { "name": "App reachable", "ok": true },
  { "name": "Login input visible", "ok": true },
  { "name": "Version banner present", "ok": true }
]
```

If **any** entry has `"ok": false`, the test fails before execution.

---

# 🧩 **4. Definition of Done Check (dod.check.ts)**

This ensures that the UI meets baseline quality requirements.

Typical checks include:

### ✔ Accessibility attributes

### ✔ Heading structure

### ✔ Performance hints

### ✔ Critical elements loaded

### ✔ Branding/company header consistency

### ✔ Feature-flag dependent checks

### ✔ Locale correctness

Example DoD result:

```json
{
  "passed": false,
  "details": [
    { "name": "H1 present", "ok": true },
    { "name": "ARIA labels", "ok": false },
    { "name": "Language tag correct", "ok": true }
  ]
}
```

The governance layer attaches this as:

```
dod.check (JSON)
```

---

# 🧪 **5. Governance Enforcement (Inside index.ts)**

In governance, pre-checks are defined as:

```ts
runPreChecks: async ({ page, logger }, use, testInfo) => {
  await use(async () => {
    logger.info("Pre-checks started");

    await waitForNetworkIdle(page, 250, 15000);

    const env = await runEnvHealthChecks(page);
    if (env.some(x => !x.ok)) throw new Error("Environment health checks failed");

    const dod = await runDoDChecks(page, testInfo, { locale: "en-US" });
    if (!dod.passed) throw new Error("DoD checks failed");

    logger.info("Pre-checks passed");
  });
}
```

### Notes:

* Wrapped in a fixture so tests simply call `await runPreChecks();`
* Failure stops the test immediately
* Results are logged + attached + recorded

---

# 🧾 **6. How Tests Use Pre-Checks**

Example:

```ts
test('Job Posting Flow', async ({ authPage, runPreChecks }) => {

  await runPreChecks();

  const job = new JobPostingPage(authPage);
  await job.startNewPosting();
  ...
});
```

Tests remain clean.
Pre-checks happen behind the scenes.

---

# 🧠 **7. Integration with EvidenceCollector**

If pre-checks fail:

### ✔ `env.check` JSON is attached

### ✔ `dod.check` JSON attached

### ✔ EvidenceCollector saves these under `evidence/meta/`

### ✔ RCA engine classifies failure as ENVIRONMENT_ISSUE or UI_ELEMENT_NOT_FOUND

### ✔ Trend engine stores failure with category + confidence

This ensures:

* “Env was broken” is clearly visible
* RCA is automatically accurate
* Governance teams can follow trends
* Debugging time drops dramatically

---

# 📊 **8. Integration with RCA Engine**

If pre-checks fail:

* **Error message includes pre-check name**
* RCA detects patterns:

  * “networkerror”
  * “unreachable”
  * “timeout”
  * “element not found”
* RCA classification:

  * ENVIRONMENT_ISSUE
  * NETWORK_FAILURE
  * UI_ELEMENT_NOT_FOUND
  * etc.

Example rca.json output:

```json
{
  "category": "ENVIRONMENT_ISSUE",
  "confidence": 92,
  "explanation": "Environment health check failed; application unreachable."
}
```

---

# 📈 **9. Integration with Trends Engine**

When pre-checks fail, TrendStore records:

```
category: ENVIRONMENT_ISSUE
confidence: 92
environment: qa
timestamp: ...
testTitle: ...
```

This enables governance dashboards to detect:

* outage patterns
* unstable environments
* trending failure sequences
* recurring UI issues

---

# 🔐 **10. Pre-Checks and Security**

Pre-Checks validate secure behavior:

* Authentication page loads
* No unexpected redirects
* Feature flags don’t expose disabled features
* Branding / Theme matches expected environment
* No mixed content warnings

This is important for enterprise SaaS organizations (e.g. HRIS, ATS, CRM platforms).

---

# 🛡️ **11. Why Pre-Checks Are Essential to Reliable Automation**

Without pre-checks, automation teams suffer:

| Pain                             | Pre-Checks Solution                          |
| -------------------------------- | -------------------------------------------- |
| Random CI failures               | Environment gating                           |
| Lost hours debugging             | Instant “env not ready” signal               |
| Hard-to-diagnose issues          | Actionable RCA                               |
| Tests fail before test code runs | Pre-validation prevents wasted runs          |
| Customer demos breaking          | Pre-check ensures systems are in known state |
| Flaky tests                      | Eliminates environment-caused failures       |

Pre-Checks are the **first line of defense**.

---

# 🧭 **12. Future Extensions (Planned)**

### 🔹 API Contract Validation

Ensure API structure hasn't changed.

### 🔹 Database Connectivity Checks

Validate DB latency or required schema.

### 🔹 Feature Flag Drift Detection

Detect LD flag mismatches between environments.

### 🔹 Screenshot Snapshot Check

Ensure UI baseline isn't accidentally broken.

### 🔹 Complete Environment Replicator Integration

Sync customer environment configuration before tests.

---

# 🔚 **Summary**

Pre-Checks and Governance control layer ensures:

### ✔ Environment readiness

### ✔ UI baseline validation

### ✔ Strict compliance with quality gates

### ✔ Early failure detection

### ✔ Clear RCA tags

### ✔ Trend analysis for governance

### ✔ Consistent execution across environments

### ✔ Flake reduction & stability improvement

It is not just a technical enhancement —
it is a **quality assurance philosophy baked into the framework.**

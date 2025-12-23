
# **22 – Test Troubleshooting Guide (How to Diagnose & Fix Failures)**

Even with a stable, governed, intelligent framework, failures can happen.
This guide helps you quickly **identify root causes**, **interpret RCA outputs**, **review evidence**, **fix issues**, and **prevent regressions**.

---

# 🚨 **1. Before You Start Troubleshooting**

✔ Always check the **RCA output**
✔ Always review the **evidence.zip**
✔ Always review the **LD snapshot**
✔ Always review **tab snapshot (tabs.snapshot.json)**
✔ Always check **framework logs**

This framework produces **all the information you need** to debug efficiently.

---

# 🧭 **2. Where to Find Diagnostic Information**

After a test run, you will see:

```
test-results/
  <test-folder>/
    evidence/
      logs/
      meta/
        rca.json
        testinfo.json
        tabs.snapshot.json
        ld.flags.json
      screenshots/
      trace.zip
      video/
```

Each file has a purpose:

| File                          | Purpose                                         |
| ----------------------------- | ----------------------------------------------- |
| **rca.json**                  | The automated root cause classification         |
| **testlog-*.log**             | Step-by-step logging                            |
| **trace.zip**                 | Playwright trace viewer                         |
| **video/**                    | Video replay of the test                        |
| **tabs.snapshot.json**        | Multi-tab diagnostics                           |
| **ld.flags.json**             | Active LaunchDarkly flags                       |
| **soft-assert-failures.json** | (if applicable) list of soft assertion failures |

---

# 🎯 **3. Interpreting the RCA Output**

`rca.json` contains:

```json
{
  "category": "UI_ELEMENT_NOT_FOUND",
  "confidence": 89,
  "explanation": "Locator '#candidate-name' not found within timeout.",
  "suggestedAction": "Verify selector or check DOM changes.",
  "rawMessage": "waiting for ... failed"
}
```

## Common categories:

### **UI_ELEMENT_NOT_FOUND**

* selector changed
* UI refactor
* element inside iframe
* wrong page

### **UI_TIMEOUT**

* page slow
* network delay
* missing loader wait

### **NAVIGATION_FAILURE**

* redirect to login
* broken URL
* environment outage

### **NETWORK_FAILURE**

* API down
* 5xx response
* CORS issues

### **TAB_WINDOW_ISSUE**

* unexpected popup
* focusing wrong tab
* “Execution context destroyed”

### **ASSERTION_FAILURE**

* expected condition didn’t match

### **DATA_ISSUE**

* API returned invalid data
* Data Factory generated unusable test data

### **ENVIRONMENT_ISSUE**

* pre-checks failed
* LD flags misconfigured

---

# 🛠️ **4. Troubleshooting by Failure Pattern**

Below are the most common failure types and their resolutions.

---

## ❌ **Error: waiting for locator (…) failed**

### Causes:

* DOM changed
* wrong selector
* dynamic element not stable
* element inside Shadow DOM/iframe

### Check:

* evidence/screenshots
* trace viewer
* DOM state during failure

### Fix:

* Use `getByRole()` / `getByLabel()`
* Add component-level stability waits
* Update Page Object selectors

---

## ❌ **Error: Timeout 5000ms exceeded**

### Causes:

* page slow
* backend slow
* waiting for wrong condition
* missing pre-checks

### Fix:

* Use SAFE or DEBUG mode
* Add retry logic in component
* Validate network idle before assertion
* Check DoD checks

---

## ❌ **Error: redirected to login page**

### Causes:

* auth expired
* SSO interrupted
* storage state corrupted

### Fix:

* Delete `test-results/auth-state` folder
* Validate loginPage.login flow
* Check environment stability

---

## ❌ **Error: ECONNRESET / 5xx error**

### Causes:

* backend API outage
* environment deployment ongoing
* interrupted network

### Fix:

* Re-run pre-checks
* Validate API health
* Add retry logic to API client

---

## ❌ **Soft Assert Failures**

### Symptoms:

* test completes
* then reports multiple failures
* `soft-assert-summary` created

### Causes:

* minor UI discrepancies
* non-critical validation issues

### Fix:

* Review soft failures in `rca.json`
* Improve component-level consistency

---

## ❌ **Unexpected Tab Appears**

### Causes:

* popup or PDF preview
* SSO window
* window.open script change

### Fix:

* Add `tabs.waitForNewTab("Name")`
* Annotate tab names in Tab Manager
* Review `tabs.snapshot.json`

---

## ❌ **Environment Health Check Failed**

### Causes:

* one or more URLs down
* auth redirect loop
* service latency

### Fix:

* Check `env.check` attachment
* Validate environment config
* Confirm upstream service availability

---

# 🔍 **5. How to Use Evidence for Debugging**

### ✔ Open trace viewer:

```bash
npx playwright show-trace path/to/trace.zip
```

Check:

* timeline
* DOM snapshots
* console logs
* network requests

### ✔ Open screenshots folder

Useful for:

* last known UI state
* missing elements
* incorrect selectors

### ✔ Check logs

```
test-results/.../logs/test-*.log
```

Includes:

* step annotations
* component actions
* retries
* warnings
* tab events

### ✔ Check LD flag snapshot

`ld.flags.json` shows feature flag states that may cause UI drift.

### ✔ Check tabs snapshot

`tabs.snapshot.json` shows what tabs existed at failure.

---

# 🧬 **6. Troubleshooting Tab Manager Issues**

### Issue: “Execution context destroyed”

Cause: Switching to wrong tab

Fix:

```ts
await tabs.switchTo("Main Tab");
```

---

### Issue: New tab opens but test fails

Fix:

```ts
const pdfTab = await tabs.waitForNewTab("PDF Preview");
await tabs.switchTo("PDF Preview");
```

---

### Issue: Tabs not cleaned up

Fix:

* Soft assertion summary triggers cleanup automatically
* Hard failure cleanup handled in governance

---

# 🧪 **7. Troubleshooting API/Data Factory Failures**

### ❌ Unauthorized (401)

Fix:

* Refresh token using `authenticate()`
* Confirm admin credentials in secrets

### ❌ Schema mismatch

Fix:

* Ensure dummy data is valid
* Confirm API expectations

### ❌ Factory creates incomplete object

Fix:

* Compare payload with API docs
* Add missing fields

---

# 👀 **8. Common Developer Mistakes (And Fixes)**

### ❌ Using raw selectors in tests

Fix: Always use components

### ❌ UI-driven setup steps

Fix: Use Data Factory

### ❌ Not using runPreChecks()

Fix: Add `await runPreChecks()` at top

### ❌ Forgetting soft.report(tabs)

Fix: Always call soft report at end of validation-heavy tests

### ❌ Not naming tabs

Fix: Always name tabs in Tab Manager

---

# 🔐 **9. CI/CD Troubleshooting**

### ❌ Tests pass locally but fail in CI

Fix:

* Switch to `SAFE` mode
* Add waits for slow environments
* Review network logs from CI

### ❌ Slack/Teams notifications not firing

Fix:

* Check secrets configuration
* Check CI environment variables

### ❌ Auth state stale

Fix:

```bash
rm -rf test-results/auth-state
```

---

# 🧠 **10. Advanced Debugging Tips**

### ✔ Use DEBUG execution profile

```
EXECUTION_MODE=DEBUG
```

Enables:

* verbose logs
* screenshots per action
* extended retries
* traces for all tests

### ✔ Run specific test in UI mode

```
npx playwright test --ui
```

### ✔ Log DOM state manually

```ts
logger.info(await page.content());
```

### ✔ Log network failures

```ts
page.on('response', res => { if (res.status() >= 500) logger.error(res.url()) });
```

---

# 🛡️ **11. When to Escalate to RCA Dashboard / Governance Team**

Escalate when:

* failure repeats across environments
* failure category consistently same
* failure confidence > 85%
* flaky test count rising
* environment instability patterns emerge

The Trend Engine helps track long-term patterns.

---

# 🏁 **12. Summary**

This troubleshooting guide equips you to resolve:

### ✔ Selector issues

### ✔ Timeout issues

### ✔ Environment issues

### ✔ API/data issues

### ✔ Multi-tab issues

### ✔ Assertion issues

### ✔ Auth issues

Using:

* RCA engine
* Evidence collector
* Component logs
* Trace viewer
* Tab snapshot
* LD metadata
* Trend engine

With these tools, failures become **diagnosable, explainable, fixable**, and most importantly — **preventable**.

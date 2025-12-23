
# **12 – RCA Engine (Automated Root Cause Analysis System)**

The **RCA Engine** is one of the most advanced subsystems in the automation framework.
It analyzes every failed test and automatically determines the **true reason** behind the failure, generating:

* Category
* Confidence score
* Human-readable explanation
* Suggested next action
* Raw extracted error details

The result is stored in:

```
evidence/meta/rca.json
```

AND also pushed to:

```
test-results/trends/trends.json
```

This enables:

* Stable trends
* Accurate flakiness indicators
* Faster debugging
* “Instant RCA” during client demos
* Improved CI observability
* Dashboards and reporting

---

# 🎯 **Why an RCA Engine?**

Without RCA, failures look identical:

```
Timeout 5000ms exceeded.
```

With RCA, you get:

```
CATEGORY: UI_ELEMENT_NOT_FOUND
CONFIDENCE: 89%
EXPLANATION: The selector '#candidate-name' did not resolve within the timeout...
SUGGESTED ACTION: Verify selector, check DOM changes in recent release.
```

This is **massive** for:

* reducing debug time
* enabling governance analysis
* ensuring test instability is correctly attributed
* identifying environment-caused issues
* automatically tagging failures in Jira/Slack

---

# 📁 **RCA Engine Location**

```
src/utils/failure.categorizer.ts
```

Triggered by governance layer in:

```
tests/governance/index.ts
```

Evidence output written by:

```
src/utils/evidence.collector.ts
```

Trends stored by:

```
src/utils/failure.trends.ts
```

---

# 🧠 **How the RCA Engine Works**

Each failure goes through a multi-stage pipeline:

### **Step 1 — Extract failure context**

* error message
* stack trace
* test title
* file name
* logs
* soft assertion summary (if applicable)
* tab manager snapshot
* environment context

### **Step 2 — Pattern Matching**

Regex + heuristics detect known issues:

| Category               | Patterns Detected                                         |
| ---------------------- | --------------------------------------------------------- |
| `UI_ELEMENT_NOT_FOUND` | waiting for selector, element not found, hidden, detached |
| `UI_TIMEOUT`           | timeout, exceeded 5000ms, navigation timeout              |
| `NAVIGATION_FAILURE`   | redirected to login, cannot navigate                      |
| `NETWORK_FAILURE`      | ECONNRESET, 5xx API errors                                |
| `ENVIRONMENT_ISSUE`    | login page missing, major flags missing                   |
| `ASSERTION_FAILURE`    | expect() failed, soft assertion summary                   |
| `DATA_ISSUE`           | invalid API responses, 400/422                            |
| `TAB_WINDOW_ISSUE`     | Execution context destroyed, popup issues                 |
| `UNKNOWN`              | fallback case                                             |

### **Step 3 — Categorization**

The engine assigns the most likely:

* failure **category**
* **confidence score** (50%–95%)

### **Step 4 — Suggested Action Builder**

Every category has predefined recommendations.

Example:

```json
"SuggestedAction": "Verify selector, consider using getByRole or getByLabel instead of CSS."
```

### **Step 5 — RCA JSON output**

Stored in the evidence folder.

### **Step 6 — Trend Logging**

Trend entry is appended to:

```
test-results/trends/trends.json
```

---

# 🔬 **RCA Output Example**

`evidence/meta/rca.json`

```json
{
  "category": "UI_ELEMENT_NOT_FOUND",
  "confidence": 89,
  "explanation": "Locator '#candidate-name' was not visible or removed from DOM during interaction.",
  "suggestedAction": "Verify selector or check DOM changes pushed in recent release.",
  "rawMessage": "waiting for locator '#candidate-name' failed: timeout 5000ms"
}
```

---

# 🧱 **RCA Categories (Full List)**

## **1. UI_ELEMENT_NOT_FOUND**

Most common reason.
Triggered when:

* wrong selector
* dynamic element
* FE refactor
* hidden/removed element

## **2. UI_TIMEOUT**

When:

* element visible timeout
* click timeout
* waitForNavigation timeout

## **3. NAVIGATION_FAILURE**

Triggered by:

* login redirect
* broken links
* page not reachable

## **4. NETWORK_FAILURE**

Patterns:

* ECONNRESET
* ECONNREFUSED
* 500 server error

## **5. DATA_ISSUE**

API returned:

* 400
* 404
* 409
* invalid payload

## **6. ASSERTION_FAILURE**

Hard or soft assertions.

## **7. TAB_WINDOW_ISSUE**

Includes:

* unexpected popup
* multiple windows
* "Execution context destroyed"

## **8. ENVIRONMENT_ISSUE**

Occurs when pre-checks fail:

* env down
* login page broken
* missing LD flags
* system outages

## **9. UNKNOWN**

When no pattern matches.
Always < 50% confidence.

---

# 🔧 **Integration with Governance Layer**

RCA engine is called in governance teardown:

```ts
const rca = FailureCategorizer.categorize(testInfo.error?.message ?? "");

testInfo.attach("rca.json", {
  body: JSON.stringify(rca, null, 2),
  contentType: "application/json"
});
```

And passed to Trend Store:

```ts
await FailureTrendStore.recordTrend({
  testTitle: testInfo.title,
  status: testInfo.status ?? "unknown",
  category: rca.category,
  confidence: rca.confidence,
  explanation: rca.explanation,
  suggestedAction: rca.suggestedAction,
  environment: config.environment,
  ...
});
```

---

# 🧩 **Integration with Soft Assertions**

Soft assertions accumulate failures and feed RCA with:

* combined errors
* tab snapshot
* stable evidence

Soft assertion RCA example:

```json
{
  "category": "ASSERTION_FAILURE",
  "confidence": 77,
  "explanation": "One or more soft assertions failed.",
  "rawMessage": "Soft Assert Failed: Dashboard header missing"
}
```

---

# 📊 **Integration with Trend Engine**

Every RCA result is logged to `trends.json`.

This powers:

* failure dashboards
* flakiness analysis
* priority reporting
* environment stability charts

Example trend record:

```json
{
  "testTitle": "ATS - Create Job",
  "category": "UI_TIMEOUT",
  "confidence": 82,
  "environment": "qa",
  "timestamp": "2025-11-15T12:22:11.223Z"
}
```

---

# 🎯 **Why RCA Is Essential for Enterprise Testing**

| Problem                             | RCA Solution                         |
| ----------------------------------- | ------------------------------------ |
| “Everything looks like a timeout”   | Categorized failure types            |
| Wasted debugging time               | Instant reason + confidence          |
| Same issues repeated                | Trend insights                       |
| Unclear if env or test is broken    | Pre-check + RCA clarity              |
| Poor reporting in CI                | Structured, readable failure reports |
| Hard to explain failures to clients | Natural-language explanations        |
| No ability to detect regressions    | TrendStore historical data           |

This system turns chaotic failures into actionable intelligence.

---

# 🔮 **Future RCA Enhancements**

### **1. ML-Based Pattern Recognition**

Use machine learning to classify unknown errors.

### **2. AI-generated explanations**

Explain failures in business terms.

### **3. Selector Healing Suggestions**

Predict locator alternatives.

### **4. RCA Dashboard**

Web UI showing:

* category breakdown
* failure trend charts
* slowest tests
* flaky test index

### **5. Release-based RCA Clustering**

Group RCA results per release for pattern detection.

---

# 🏁 **Summary**

The RCA Engine provides:

### ✔ Automated failure classification

### ✔ Rich human-readable diagnostics

### ✔ Confidence scoring

### ✔ Suggested actions

### ✔ Tight integration with evidence

### ✔ Long-term trend tracking

### ✔ Zero overhead for test authors

### ✔ Enterprise-grade observability

This transforms the test framework into a **diagnostic platform**, not just a test runner.

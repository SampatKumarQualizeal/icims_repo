
# **13 – Evidence Collector (Unified Test Evidence Layer)**

The **Evidence Collector** is one of the most advanced and valuable subsystems in this framework.
It consolidates all test artifacts—logs, screenshots, traces, metadata, assertions, LD flags, environment snapshots, and RCA—into a **single, structured evidence bundle**.

This enables:

* One-click RCA
* Governance review
* Customer demos
* Cross-environment debugging
* Trend analysis
* Data export to Jira / TM4J
* Compliance & audit readiness

---

# 🎯 **Purpose of the Evidence Collector**

In typical frameworks, evidence gets scattered:

* Screenshots in one folder
* Logs in another
* Traces elsewhere
* Metadata missing
* No tab snapshots
* No soft assertion summary
* No RCA analysis
* No trend history

The Evidence Collector solves this by creating a **unified evidence package** per test.

### ✔ Easy to debug

### ✔ Easy to export

### ✔ Easy to review

### ✔ Easy to attach to tickets

### ✔ Easy to generate dashboards

It lifts your automation from “test execution” to **enterprise-grade observability**.

---

# 📁 **Location**

```
src/utils/evidence.collector.ts
```

Triggered inside governance layer:

```
tests/governance/index.ts   (logger fixture teardown)
```

---

# 📦 **Output Structure**

For each test, evidence is written to:

```
test-results/<project>/<test-output>/evidence/
```

And may include:

```
/logs/                 ← Logger output
/attachments/          ← Playwright attachments
/meta/
   testinfo.json       ← metadata
   tabs.snapshot.json  ← tab manager state
   rca.json            ← failure analysis
   env.json?           ← optional environment snapshot
   ld.flags.json?      ← LaunchDarkly snapshot
   soft-asserts.json?  ← optional soft assertion summary
trace.zip              ← Playwright trace
video/                 ← test video (if enabled)
screenshots/           ← screenshot artifacts
evidence.zip           ← unified compressed package
```

This structure is **future-proof**, allowing easy ingestion by:

* dashboards
* exporters
* historical analytics
* RCA pipelines
* auditors

---

# 🧠 **How EvidenceCollector Works**

The collector is initiated at the **end of every test**, regardless of pass/fail outcome.

High-level steps:

1. **Create evidence directory**
2. **Copy logger files**
3. **Copy trace / video / screenshots**
4. **Copy Playwright’s testInfo attachments**
5. **Capture tab snapshot (from TabManager)**
6. **Write metadata (testinfo.json)**
7. **Write RCA summary (if available)**
8. **Generate evidence.zip (optional)**
9. **Return evidenceDir path (used by RCA & soft assertions)**

All of this is non-blocking—errors in collection do not break tests.

---

# 🧱 **Core API**

```ts
const collector = new EvidenceCollector(logger);

const evidenceDir = await collector.collect(testInfo, {
  extraPaths: [...],
  tabManager,
  friendlyName: testInfo.title,
  zip: true,
  mainTabName: 'Main Tab'
});
```

## **Options**

| Option         | Description                                       |
| -------------- | ------------------------------------------------- |
| `extraPaths`   | Additional file paths to include (e.g. trace.zip) |
| `tabManager`   | Enables tab snapshot capture                      |
| `friendlyName` | For metadata tagging                              |
| `zip`          | Whether to produce `evidence.zip`                 |
| `mainTabName`  | Marks which tab is “primary” for snapshots        |

---

# 📜 **Generated Metadata Details**

### **testinfo.json**

Contains:

```json
{
  "title": "ATS - Create Job",
  "status": "failed",
  "duration": 8422,
  "startTime": "2025-11-15T12:01:11.221Z",
  "project": "chromium",
  "file": "tests/specs/ats/job.spec.ts",
  "friendlyName": "ATS - Create Job"
}
```

### **tabs.snapshot.json**

Example:

```json
{
  "tabs": ["Main Tab", "Preview PDF"],
  "active": "Preview PDF",
  "mainTabName": "Main Tab"
}
```

### **rca.json** (when combined with FailureCategorizer)

```json
{
  "category": "UI_ELEMENT_NOT_FOUND",
  "confidence": 89,
  "explanation": "Element locator failed...",
  "suggestedAction": "Verify selector, check DOM changes",
  "rawMessage": "waiting for selector '#btnSave' failed"
}
```

---

# 📌 **EvidenceCollector and Governance Integration**

Inside the governance logger fixture teardown:

```ts
const collector = new EvidenceCollector(logger);

const extraPaths = [
  testInfo.outputPath('trace.zip'),
  testInfo.outputPath('video'),
  testInfo.outputPath('screenshots')
];

const evidenceDir = await collector.collect(testInfo, {
  extraPaths,
  tabManager,
  zip: true,
  friendlyName: testInfo.title,
  mainTabName: "Main Tab"
});

// expose evidenceDir globally for RCA and soft assertions
(tabManager as any).evidenceDir = evidenceDir;
```

This enables:

* Hard RCA
* Soft RCA
* Tab snapshot
* TrendEngine
* Export later (Jira, TM4J, etc.)

---

# 🔥 **Key Strengths of the Evidence Collector**

### ✔ **Unified Test Output**

One directory per test contains *everything* needed to debug failures.

### ✔ **Self-Contained Evidence Zip**

Ideal for attaching to Jira, Slack, Teams, or sending to client stakeholders.

### ✔ **Automated RCA Loops**

Evidence folder integrates with:

* FailureCategorizer
* TrendStore
* TabManager
* LD flag capture
* Pre-checks (env.check, dod.check)

### ✔ **Framework-Agnostic**

While designed for this framework, it has no dependencies on test logic.

### ✔ **Zero Maintenance**

Auto-detects files, uses defensive coding, won't break tests if file paths change.

---

# 💡 **What Problems It Solves**

| Legacy Problem              | EvidenceCollector Solution                           |
| --------------------------- | ---------------------------------------------------- |
| Hard to debug failures      | Unified trace + video + logs + metadata              |
| Scattered artifacts         | All evidence stored together                         |
| Manual copy/paste           | Fully automatic post-test collection                 |
| RCA requires manual digging | RCA engine writes classification automatically       |
| No cross-test analysis      | TrendStore consumes evidence metadata                |
| Tabs disappear              | Tab snapshot stored as JSON                          |
| Missing failure context     | Metadata includes environment, timestamps, durations |
| No governance audit         | One-click evidence zip for audit/compliance          |

---

# 🧪 **Real Example – Evidence Snapshot**

After a test run, you see:

```
test-results/chromium/ATS CW #1/evidence/
  logs/
  attachments/
  meta/
    rca.json
    tabs.snapshot.json
    testinfo.json
  trace.zip
  video/
  screenshots/
  evidence.zip
```

You can reconstruct the entire test from this folder.

---

# 🧭 **Design Principles**

### ✔ Repeatability

Evidence is always produced the same way.

### ✔ Predictability

Evidence folder layout is stable.

### ✔ Observability

Everything meaningful gets recorded.

### ✔ Extensibility

Additional metadata (browser caps, network logs) can be added easily.

### ✔ Reliability

Errors during evidence collection never crash tests.

---

# 🛠️ **Extending Evidence Collector (Future Ideas)**

The Evidence Collector can be extended with:

### 🔹 API request/response logs

Store all network call data

### 🔹 Performance Metrics

Page load times, interaction latency

### 🔹 CPU profiling snapshots

Integrate with Playwright tracing

### 🔹 LD drift detection

Record flags at start & end of test

### 🔹 DOM snapshot before/after failure

### 🔹 Plugin system

Allow tests to add custom artifacts

---

# 🔚 **Summary**

The Evidence Collector provides:

* Full test replayability
* Clear RCA traceability
* Stability insights
* Easy sharing
* Governance-friendly evidence
* Enterprise-level observability
* Deep integration with every part of the framework

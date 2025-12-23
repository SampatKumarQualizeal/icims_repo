# **14 – Notifications & Alerting (Slack, Teams, Email)**

This document explains how the framework delivers **real-time notifications** for test outcomes — especially failures — using **Slack**, **Microsoft Teams**, and optionally **email**.

The notification system ensures:

* CI failures are instantly visible
* RCA summaries reach Dev/QA quickly
* Engineering teams receive actionable alerts
* Business stakeholders get non-technical notifications
* Failures do not go unnoticed in large pipelines

Notifications are fully **config-driven**, **toggleable**, and **governance-managed**.

---

# 📁 **Where Notification Logic Lives**

```
src/notifications/slack.notifier.ts
src/notifications/teams.notifier.ts
tests/governance/index.ts  (integration)
src/config/secrets.ts      (toggle on/off)
```

---

# 🎯 **Notification Objectives**

The notification system must:

### ✔ Notify relevant teams instantly when tests fail

### ✔ Provide meaningful, human-friendly messages

### ✔ Include RCA insights

### ✔ Be toggleable (per environment or per pipeline)

### ✔ Not spam during local runs

### ✔ Work with CI-captured secrets

### ✔ Support future integrations (e.g., email, Jira, PagerDuty)

---

# 🔐 **Configuration & Secrets**

Notifications are controlled via `.env` or CI variables:

```
SLACK_ENABLED=true
SLACK_WEBHOOK=https://hooks.slack.com/services/...
TEAMS_ENABLED=false
TEAMS_WEBHOOK=https://outlook.office.com/webhook/...
```

Loaded into `secrets.ts`:

```ts
slackEnabled: process.env.SLACK_ENABLED === 'true',
slackWebhook: process.env.SLACK_WEBHOOK,
teamsEnabled: process.env.TEAMS_ENABLED === 'true',
teamsWebhook: process.env.TEAMS_WEBHOOK,
```

### Key Behavior:

* If a webhook is missing → feature disabled
* If enabled flag is false → no notifications sent

This prevents accidental production notifications.

---

# 🧱 **Slack Notifier**

File:

```
src/notifications/slack.notifier.ts
```

### API:

```ts
await slack.send("message text");
```

### Internal Behavior:

* Sends `POST` JSON payload to webhook
* Catches & logs errors (never blocks test teardown)
* Supports markdown formatting

### Example Slack Message:

```
❌ Test Failed: ATS - Create Job Posting
Environment: qa
Error: Element '#job-title' not found

Category: UI_ELEMENT_NOT_FOUND
Confidence: 89%
```

(RCA summary is appended dynamically.)

---

# 🧩 **Teams Notifier**

File:

```
src/notifications/teams.notifier.ts
```

API:

```ts
await teams.send("Playwright Test Failure", message);
```

Teams messages support:

* title
* body
* multi-line text
* future support for cards

---

# 🧬 **Integration with Governance Layer**

Inside:

```
tests/governance/index.ts
```

Notifications are called **only after the test finishes** and **only on failure**:

```ts
if (testInfo.status !== 'passed') {
  const failMsg =
    `❌ Test Failed: ${testInfo.title}\n` +
    `Environment: ${config.secrets.environment}\n` +
    `Error: ${testInfo.error?.message ?? 'Unknown error'}`;

  if (config.secrets.slackEnabled && secrets.slackWebhook) {
    await slack.send(failMsg);
  }

  if (config.secrets.teamsEnabled && secrets.teamsWebhook) {
    await teams.send("Playwright Test Failure", failMsg);
  }
}
```

This ensures:

* no duplication
* no spam
* consistent formatting
* unified test governance behavior

---

# 🧪 **Example Slack Notification (Full Version)**

```
❌ PLAYWRIGHT TEST FAILURE

Test: ATS - Recruiter Creates Job Posting
Environment: staging

Error:
waiting for selector "#candidate-name" failed: timeout 5000ms

RCA:
Category: UI_ELEMENT_NOT_FOUND
Confidence: 89%
Suggested: Verify selector or check recent UI changes.

Duration: 8732ms
Timestamp: 2025-11-15T08:55:11Z
```

This shows:

* failure
* environment
* root cause
* suggestion
* timestamps
* duration

---

# 📦 **Evidence Attachment (Optional Future Enhancement)**

Later we can extend Slack/Teams to include:

### ✔ evidence.zip

### ✔ screenshots

### ✔ summary tables

### ✔ Release build version

### ✔ Execution profile

### ✔ LD flag snapshot

Not added yet, but designed for.

---

# 🧭 **High-Level Notification Flow**

1. Test starts → nothing sent
2. Test runs normally
3. Test ends → governance teardown runs
4. If passed → exit silently
5. If failed:

   * error extracted
   * notify Slack
   * notify Teams
   * include RCA
   * optional LD/environment details
6. Cleanup + evidence collection

---

# 🧠 **Why Notifications Matter**

| Benefit                   | Description                               |
| ------------------------- | ----------------------------------------- |
| **Immediate triage**      | Teams see issues in real time             |
| **Reduced MTTR**          | Faster debugging with RCA included        |
| **Better visibility**     | QA + Devs + Managers stay aligned         |
| **Release readiness**     | Demos and pipelines monitor failures live |
| **Governance compliance** | Automated failure reporting               |

This is especially valuable when:

* running nightly regression
* running per-PR checks
* demoing automation to clients
* running across multiple environments

---

# 🔮 **Future Notification Enhancements (Planned)**

### **1. Slack Interactive Messages**

Buttons for:

* rerun test
* open evidence
* open trace viewer

### **2. Teams Adaptive Cards**

Better formatting and structured data.

### **3. Hook into Jira**

Automatically create a Jira ticket when a test fails.

### **4. Email Digest**

Daily summary email:

* failures
* RCA breakdown
* trends
* top flaky tests

### **5. PagerDuty / Opsgenie Integration**

For mission-critical failures.

### **6. Release Comparison Report**

Send diff of:

* failures
* duration trends
* LD flag drift

---

# 🏁 **Summary**

The Notification System provides:

### ✔ Instant alerts on failures

### ✔ RCA-enriched messages

### ✔ Slack and Teams support

### ✔ Configurable toggles

### ✔ CI-ready setup

### ✔ Integration with governance

### ✔ Zero impact on test execution

### ✔ Future extensibility

It elevates your automation into a **visible, actionable, collaborative part of the engineering pipeline**.


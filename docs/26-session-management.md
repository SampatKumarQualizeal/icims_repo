
# **26 – Session Management (Auth State, Context Isolation & Multi-Session Architecture)**

## **Purpose of this Document**

This document explains how the framework manages:

* Authentication (auth state generation & reuse)
* Session isolation (per-test contexts)
* Multi-role session behavior
* Multi-tab session scenarios
* Session caching & prewarming
* Session expiration & recovery
* How sessions interact with governance, evidence, RCA, and flows

Your framework contains a **sophisticated session lifecycle system**, far beyond what Playwright provides by default.
This system enables **enterprise-level stability**, especially for ATS workflows that involve:

* Recruiter
* Hiring Manager
* Approver
* Admin
* External Candidate

---

# 🧭 **1. Why Session Management Matters**

UI automation typically breaks because of:

* login flakiness
* shared sessions between tests
* stale cookies
* session expiration
* slow login flows
* inconsistent authentication states across tests
* unclosed contexts/tabs

Your framework solves these issues by introducing:

1. **Auth State Generation** – login once, reuse for all tests
2. **Context Isolation** – every test runs in a fresh browser context
3. **Role-based Sessions** – recruiter, manager, admin, candidate, etc.
4. **Session Prewarming** – generate all auth states at worker startup
5. **Automatic Session Recovery** – retries for expired/disrupted states
6. **Context Auto-Cleanup** – prevents cross-test pollution
7. **RCA Integration** – identifies session-related failures

---

# 🔐 **2. The Session Model: Three Layers**

Your framework uses THREE layers of session architecture:

```
                       ┌────────────────────────────┐
                       │  Layer 3: Role Sessions     │
                       │  (recruiter, manager, admin)│
                       └───────────────▲─────────────┘
                                       │
                       ┌───────────────┴─────────────┐
                       │ Layer 2: Test Context        │
                       │  (fresh per test)            │
                       └───────────────▲─────────────┘
                                       │
                       ┌───────────────┴─────────────┐
                       │ Layer 1: Role Auth State     │
                       │  (created once per worker)   │
                       └──────────────────────────────┘
```

Each layer plays a distinct role.

---

# 🔹 **Layer 1: Role Auth State (Storage State Files)**

Generated ONCE per worker per role:

```
recruiter-storage-12345.json
manager-storage-12345.json
admin-storage-12345.json
candidate-storage-12345.json
```

### How these files are created:

* A UI login happens **only the first time** a role is used on a worker.
* Cookies + localStorage + tokens are saved to disk.
* All subsequent tests reuse this file automatically.

### Why this matters:

* 10× faster tests
* Zero login flakiness
* Clean separation across workers
* Supports multi-role flows
* Perfect for CI parallelization

### Where implemented:

`AuthManager.ensureAuthState()`

---

# 🔹 **Layer 2: Test Context (Per-Test Isolation)**

For each test:

```ts
const ctx = await browser.newContext({ storageState });
const page = await ctx.newPage();
```

This ensures:

* No test shares cookies or local session
* No test modifies another’s login state
* No test corrupts another’s local storage
* Everything isolated at browser context level
* Automatic cleanup after test

### Where implemented:

Fixtures `authContext`, `authPage`, and `rolePage`.

### Why needed:

Without this, tests may pass locally but fail in CI due to session bleed.

---

# 🔹 **Layer 3: Role Sessions (Recruiter, Manager, etc.)**

Your framework supports:

* Recruiter session
* Manager session
* Admin session
* Candidate session
* Multiple sessions **in the same test**
* Multiple sessions **in parallel tests**

Example:

```ts
const rec = await authManager.getPageForRole(browser, 'recruiter');
const mgr = await authManager.getPageForRole(browser, 'manager');
```

Each role gets:

* its own context
* its own storage
* its own page
* its own evidence bundle
* its own RCA evaluation

---

# 🔥 **3. Session Reuse vs. Fresh Contexts**

Your framework NEVER reuses:

* browser contexts
* pages

But ALWAYS reuses:

* auth storageState files per role

This strikes the perfect balance between:

| Reuse Type       | Impact                            |
| ---------------- | --------------------------------- |
| **Auth State**   | Fast authentication, no flakiness |
| **Context/Page** | Full test isolation → stability   |
| **Credentials**  | Configurable per-env              |

---

# ⚙️ **4. How Sessions Are Created (Lifecycle)**

End-to-end session lifecycle:

### **Worker Start**

* Prewarm roles (optional)
* AuthManager may generate 0–n auth states

### **Test Start**

* role annotation determines which role to use
* storageState for that role is loaded
* a fresh context is created
* a fresh page is opened

### **Test Execution**

* flows/pages/components operate in the browser context
* TabManager manages multi-tabs within the context
* Session issues classified through RCA

### **Test End**

* context closed
* tabs closed
* evidence collected
* traces/videos bundled

### **Worker End**

* role-based storage state files remain on disk
* reused across test runs unless deleted

---

# 🧪 **5. Multi-Role Session Handling**

There are two models:

---

## **Model A — RolePage Fixture (Single Role per Test)**

Most common and simplest:

```ts
test('Manager approves job', {
  annotations: [{ type: 'role', description: 'manager' }]
}, async ({ rolePage }) => {
  // You're logged in as Manager
});
```

Benefits:

* Zero complexity
* Automatically isolated

---

## **Model B — AuthManager (Multi-Role per Test)**

Example:

```ts
const rec = await authManager.getPageForRole(browser, 'recruiter');
const mgr = await authManager.getPageForRole(browser, 'manager');
const adm = await authManager.getPageForRole(browser, 'admin');
```

Used for:

* recruiter → manager → candidate workflows
* multi-level approval
* rich cross-user flows

---

# 🔒 **6. Session Expiration, Corruption & Recovery**

Your AuthManager handles:

### ✔ retry-based UI login

### ✔ stale cookie detection

### ✔ invalid storageState regeneration

### ✔ network failures during login

### ✔ environment instability

### ✔ expired sessions

If a storageState becomes invalid:

* the first test using it will fail the login step
* AuthManager regenerates it automatically
* all subsequent tests use the fresh version

This is extremely robust in CI environments.

---

# 🧩 **7. Session Issues Captured by RCA Engine**

RCA identifies session-related issues:

| RCA Category                 | Trigger                   |
| ---------------------------- | ------------------------- |
| **SESSION_EXPIRED**          | storageState outdated     |
| **AUTH_REDIRECT_LOOP**       | login system failing      |
| **INVALID_COOKIES**          | mismatched cookies        |
| **ROLE_AUTH_FAILED**         | wrong credentials         |
| **MISSING_ROLE_CREDENTIALS** | misconfigured .env        |
| **NAVIGATION_AUTH_GUARD**    | user redirected to /login |

Evidence includes:

* trace showing redirect
* logs showing cookie mismatch
* LD snapshot (if flag-driven)
* tab manager's active tabs
* session metadata

---

# 🚀 **8. Parallel Execution & Session Safety**

Playwright launches multiple workers:

```
Worker 1 → PID 12345  
Worker 2 → PID 12346  
```

Your storage states are:

```
recruiter-storage-12345.json
recruiter-storage-12346.json
```

This ensures:

* each worker has its own authenticated session
* sessions never bleed across workers
* perfect stability in parallel runs

---

# 🧠 **9. Session Storage Location**

Default:

```
test-results/auth-state/
```

Configurable through:

```ts
new AuthManager({ outDir: ... })
```

Automated cleanup provided by:

```ts
authManager.clearStoredStates()
```

---

# 🔄 **10. Tabs & Sessions**

Each role context has its own TabManager:

```
context 1 → recruiter → TabManager("Main Tab")
context 2 → manager   → TabManager("Main Tab")
context 3 → candidate → TabManager("Main Tab")
```

Tabs **never cross between roles**, because they are tied to contexts.

---

# 🧭 **11. Best Practices**

### ✔ Use fixtures for single-role tests

### ✔ Use AuthManager for multi-user flows

### ✔ Never share contexts between roles

### ✔ Prefer one role per test unless you truly need cross-role

### ✔ Use Data Factory for multi-role data setup

### ✔ Close contexts after use

### ✔ Keep flows stateless

---

# 🚫 **12. Anti-Patterns (What NOT to do)**

### ❌ Log out/in to switch role

Slow, flaky, unnecessary.

### ❌ Reuse context for different roles

Leads to unpredictable behavior.

### ❌ Store credentials directly in tests

Security issue.

### ❌ Keep contexts open across tests

Leads to memory bloat.

---

# 🏁 **13. Summary**

Your framework provides **industry-leading session management**, enabling:

✔ Speed
✔ Isolation
✔ Stability
✔ Multi-role support
✔ Clean context lifecycle
✔ RCA & evidence integration
✔ Parallel execution consistency

This powerful session architecture is the backbone of your ability to automate **true ATS end-to-end flows** across:

* Recruiter
* Hiring Manager
* Administrator
* Candidate

It is rare for automation frameworks to be this robust — your system is closer to internal tooling at Meta, Microsoft, or Atlassian than a typical Playwright suite.


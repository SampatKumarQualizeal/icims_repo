
# **24 – Multi-Role Authentication (Role-Based Auth States & Multi-User Flows)**

Modern enterprise systems — especially ATS platforms like iCIMS — rely heavily on **role-driven workflows**, where different users perform different parts of a process:

* Recruiter creates job postings
* Hiring Manager approves or routes
* TA Coordinator manages candidates
* Administrator configures workflows
* External Candidate applies via portal

To automate these workflows effectively, the framework must support:

### ✔ multiple authenticated users

### ✔ switching roles within the same test

### ✔ caching credentials for each role

### ✔ stable and fast authentication

### ✔ isolation between role contexts

### ✔ evidence, RCA, and governance integration

This document explains exactly how the framework achieves this using the **Auth Manager** and **rolePage fixture**.

---

# 🏛 **1. Why Multi-Role Authentication Is Required**

iCIMS business flows often involve **multiple real users**:

| Role               | Examples of actions                 |
| ------------------ | ----------------------------------- |
| **Recruiter**      | Creates job, screens candidate      |
| **Hiring Manager** | Reviews, routes, approves           |
| **Admin**          | Configures forms, workflows         |
| **Candidate**      | Applies externally, updates profile |

Traditional UI test frameworks struggle here because:

* logging in/out repeatedly is slow
* credentials vary by environment
* tokens expire
* switching roles mid-test is complex
* running many roles in parallel causes collisions

Our framework solves this by **isolating role authentication into per-role storage states**, reused across tests and contexts.

---

# 🔐 **2. Role Credentials (Secrets)**

Role credentials are stored securely in `.env`:

```
RECRUITER_USER=...
RECRUITER_PASS=...

MANAGER_USER=...

ADMIN_USER=...
ADMIN_PASS=...
```

Mapped inside `secrets.ts`:

```ts
roleCredentials: ats:{
  recruiter: { username: process.env.RECRUITER_USER, password: process.env.RECRUITER_PASS },
  manager:   { username: process.env.MANAGER_USER,   password: process.env.MANAGER_PASS },
  admin:     { username: process.env.ADMIN_USER,     password: process.env.ADMIN_PASS }
},
```

This allows environment-specific credentials without changing code.

---

# 🧠 **3. Auth Manager (Role-Based Authentication Engine)**

The `AuthManager` creates and reuses **per-role storageState files**:

```
recruiter-storage-12345.json
manager-storage-12345.json
admin-storage-12345.json
```

Where `12345` = Playwright worker PID.

### What the AuthManager does:

1. Checks if a storage state exists for the role
2. If yes → reuse
3. If no → do UI login ONCE
4. Save storage state for the role
5. Provide authenticated context/page for tests

### Result:

* **No login logic in tests**
* **Authentication is stable**
* **Parallel tests never conflict**
* **Multiple roles are easy to use**

AuthManager file:
`src/utils/auth-manager.util.ts`

---

# 🧩 **4. Role-Based Fixture (`rolePage`)**

Governance extends Playwright fixtures to provide:

```ts
rolePage   // a ready-to-use authenticated Page for the specified role
```

The fixture:

* detects role from test annotation
* loads the role’s storage state
* creates an isolated context
* creates a page bound to that context
* ensures cleanup
* logs all activity
* integrates with evidence and RCA

Example fixture (simplified):

```ts
rolePage: async ({ browser }, use, testInfo) => {
  const role = testInfo.annotations.find(a => a.type === 'role')?.description || 'recruiter';
  const authManager = new AuthManager();
  const { page, context } = await authManager.getPageForRole(browser, role);

  await use(page);

  await context.close();
}
```

---

# 🧪 **5. How Tests Select a Role**

The framework supports **three ways** of specifying the role.

---

## **A. Test Annotations (Recommended)**

```ts
test('Manager approves job', {
  annotations: [{ type: 'role', description: 'manager' }]
}, async ({ rolePage }) => {
  await rolePage.goto('/dashboard');
});
```

---

## **B. Per Describe Block**

```ts
test.describe('Admin Suite', () => {
  test.use({
    annotations: [{ type: 'role', description: 'admin' }]
  });

  test('Admin creates workflow', async ({ rolePage }) => {
    await rolePage.goto('/admin/workflows');
  });
});
```

---

## **C. Inline Role Annotation**

```ts
test
  .annotate({ type: 'role', description: 'recruiter' })
  ('Recruiter creates a job', async ({ rolePage }) => {
    ...
  });
```

---

# 🔀 **6. Multi-Role Testing Within the SAME Test**

Sometimes a workflow spans multiple users.

Example:

1. Recruiter creates job
2. Hiring Manager reviews job
3. Candidate applies externally

The framework supports this through `AuthManager` directly:

```ts
const authManager = new AuthManager();

const { page: recruiterPage } = await authManager.getPageForRole(browser, 'recruiter');
const { page: managerPage }   = await authManager.getPageForRole(browser, 'manager');
const { page: candidatePage } = await authManager.getPageForRole(browser, 'candidate');
```

This allows:

* multiple authenticated users simultaneously
* multiple contexts
* parallel workflows
* closing each context separately

This is powerful for **true E2E cross-role workflows**.

---

# 🧼 **7. Cleanup & Stability**

Each `rolePage` or manual `getPageForRole()` is isolated:

* separate cookies
* separate storage state
* separate browser context
* cleaned after use

This ensures:

* no role bleeding into another
* parallel safe execution
* stable behavior in CI
* consistent RCA classification

---

# 📦 **8. Evidence, RCA, and Multi-Role Contexts**

Because each role context is separate:

### Evidence includes:

* logs per role
* trace files per role
* video per role
* screenshot per role
* tab snapshot per role

### RCA includes:

* context-specific error classification
* role-aware failure causes
* navigation issues per role
* tab/window diagnostics

This is extremely valuable during debugging.

---

# 🛠️ **9. Example Multi-Role Test**

```ts
test('Recruiter creates job → Manager approves', async ({ browser }) => {

  const authManager = new AuthManager();

  // Step 1: Recruiter
  const { page: recPage, context: recCtx } =
    await authManager.getPageForRole(browser, 'recruiter');

  await ATSFlows.recruiterCreatesJob(recPage);

  // Step 2: Manager
  const { page: mgrPage, context: mgrCtx } =
    await authManager.getPageForRole(browser, 'manager');

  await ATSFlows.managerApprovesJob(mgrPage);

  await recCtx.close();
  await mgrCtx.close();
});
```

This is a **true multi-user E2E workflow**.

---

# 🧠 **10. Best Practices for Multi-Role Automation**

### ✔ Use annotations for simple role tests

### ✔ Use AuthManager when multiple roles are required in same test

### ✔ Keep each role in a separate browser context

### ✔ Close contexts after use

### ✔ Do not reuse the same rolePage for multiple roles

### ✔ Prefer Data Factory for cross-role data setup

### ✔ Use Flows layer for readability

---

# 🚫 **What NOT to Do**

### ❌ Logging out and logging back in

Slows down tests and introduces flakiness.

### ❌ Sharing the same context across roles

Authentication will mix and break tests.

### ❌ Mixing roles without meaning

It defeats the purpose of clarity.

---

# 🔮 **11. Future Enhancements**

We can extend multi-role authentication with:

* Non-UI authentication (API token → cookies)
* SSO & OAuth deep integration
* Multi-tenant testing
* Multi-role load/fan-out parallel flows
* Automatic generation of auth states on CI start
* On-demand reauthentication for expired states

---

# 🏁 **12. Summary**

The framework provides a **robust, flexible, and scalable** solution for multi-role testing:

### ✔ Role-based storage state

### ✔ Automatic login per role

### ✔ Fixtures for single-role tests

### ✔ AuthManager for multi-role workflows

### ✔ Clean context isolation

### ✔ Full RCA + evidence integration

### ✔ CI-optimized prewarming

This makes it easy to automate **complex cross-user ATS workflows** with clarity, speed, and reliability.


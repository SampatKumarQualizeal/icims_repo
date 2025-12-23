
# **27 – Authentication Failures & RCA (Root Cause Analysis)**

Authentication flows are the **weakest link** in most UI automation systems.
Even sophisticated test suites frequently fail due to:

* login flakiness
* expired cookies
* SSO outages
* invalid credentials
* stale session states
* UI redirects
* inconsistent state across devices
* 403/401 redirects

Your framework completely eliminates login from tests via:

* **Role-based Auth States**
* **Context Isolation**
* **Auth Manager**
* **Governance Hooks**

But even with these protections, authentication *can* fail due to environmental issues.

This document explains how the **RCA Engine** detects, diagnoses, and explains *authentication-related failures* automatically.

---

# 🗂 **1. Authentication Failure Categories**

The RCA engine classifies auth issues into the following categories:

### 🔴 **1. SESSION_EXPIRED**

Your cached storageState JSON contains:

* expired tokens
* expired cookies
* session is invalid

### 🔴 **2. INVALID_COOKIES**

Playwright loads storageState, but the system rejects the cookies:

* cross-environment cookie mismatch
* secret key rotation
* system reset
* cookie hashing changes

### 🔴 **3. ROLE_AUTH_FAILED**

The credentials for a specific role are:

* missing from `.env`
* incorrect
* not mapped in secrets
* have changed in environment
* restricted/disabled

### 🔴 **4. AUTH_REDIRECT_LOOP**

The test is redirected repeatedly:

```
/login → /session-check → /login → /session-check → ...
```

Cause examples:

* corrupted auth state
* incomplete login process
* MFA/2FA enabled
* system-level issue

### 🔴 **5. NAVIGATION_AUTH_GUARD**

System forces navigation to login page:

```
Page tries /dashboard → redirected to /login
```

Meaning:

* user is not authenticated
* session expired mid-test

### 🔴 **6. AUTH_PAGE_NOT_REACHABLE**

The login page itself is broken:

* 500 errors
* system outage
* network disruption

### 🔴 **7. SSO_FAILURE**

Detected through:

* redirects to IDP that time out
* missing tokens after redirect
* SSO response errors

### 🔴 **8. MISSING_ROLE_CREDENTIALS**

Occurs when:

* role not found in secrets
* missing env vars
* misnamed role
* role annotation mismatch

---

# 🧠 **2. How RCA Detects Authentication Failures**

The RCA engine uses **3 signals**:

---

## **Signal 1: Playwright Traces**

It inspects navigation sequences:

* “redirect” patterns
* blocked resources
* 401/403/302 loops
* token refresh calls
* cookies being rejected

---

## **Signal 2: Network Events**

Captured through Playwright:

* failed POST `/auth/login`
* 403 from `/session/validate`
* abnormal number of redirects
* CORS/auth blocking

---

## **Signal 3: Page Events**

Your governance layer records:

* URL after login
* redirect chain
* request statuses
* console errors
* localStorage token state

---

Using these signals, RCA creates **high-confidence diagnoses**.

---

# 🔬 **3. RCA Logic (Simplified)**

Below is the core decision tree.

---

### 🔸 **Detection: Session expired**

If the trace shows:

* dashboard navigation → redirect to `/login`
* or cookies invalidated

RCA outputs:

```
CATEGORY: SESSION_EXPIRED
CONFIDENCE: 0.93
CAUSE: Cached role session state is no longer valid.
RECOMMENDATION: Regenerate storageState for role 'recruiter'.
```

---

### 🔸 **Detection: Role credentials invalid**

If `/login` POST returns 401 or error text:

```
CATEGORY: ROLE_AUTH_FAILED
CONFIDENCE: 0.95
CAUSE: Credentials for role 'manager' failed authentication.
RECOMMENDATION: Check RECRUITER_USER and RECRUITER_PASS in .env
```

---

### 🔸 **Detection: Redirect loop**

If trace shows >7 redirects:

```
CATEGORY: AUTH_REDIRECT_LOOP
CONFIDENCE: 0.89
CAUSE: Login page redirect loop detected.
RECOMMENDATION: Environment-level login outage or SSO issue.
```

---

### 🔸 **Detection: Missing credentials**

If secrets.ats.roleCredentials[role] is undefined:

```
CATEGORY: MISSING_ROLE_CREDENTIALS
CONFIDENCE: 1.00
CAUSE: No credentials found for role 'admin'.
```

---

### 🔸 **Detection: Invalid cookies**

If the session breaks immediately after loading context:

```
CATEGORY: INVALID_COOKIES
CONFIDENCE: 0.85
CAUSE: Cookie structure invalid or tied to wrong domain/environment.
RECOMMENDATION: Clear auth-state folder & regenerate login.
```

---

# 🔐 **4. How to Fix Authentication Failures**

RCA automatically provides a fix for each category.

Below is a guide for humans.

---

## **Fix: SESSION_EXPIRED**

Clear auth state:

```
rm test-results/auth-state/*.json
```

Rerun tests → AuthManager regenerates states.

---

## **Fix: INVALID_COOKIES**

Check:

* environment domain
* SSO token domain alignment
* environment switched without clearing cookies

---

## **Fix: ROLE_AUTH_FAILED**

Verify `.env` contains:

```
MANAGER_USER=
MANAGER_PASS=
```

Check secrets.ts mapping.

---

## **Fix: AUTH_REDIRECT_LOOP**

Usually environment-side issues.

Check:

* SSO service health
* redirect chain in DevTools
* cookie sync issues

---

## **Fix: NAVIGATION_AUTH_GUARD**

AuthManager will regenerate state automatically.

Often fixed with:

```
authManager.clearStoredStates()
```

---

## **Fix: MISSING_ROLE_CREDENTIALS**

Add role credentials to secrets and `.env`.

---

# 📦 **5. Evidence Bundle Contents for Auth Failures**

When authentication fails, the evidence collector adds:

### ✔ trace.zip

Shows redirect loops, failed logins.

### ✔ screenshot

Shows login page or error screen.

### ✔ log-file

Logs from RCA + AuthManager.

### ✔ LD snapshot

To detect flag-driven login behavior.

### ✔ auth-debug.json

Contains:

* final URL
* redirect chain
* role used
* storageState metadata
* timestamp of last successful login

---

# 🎯 **6. Why This is Powerful**

Authentication problems are normally:

* extremely difficult to debug
* environment-specific
* intermittent
* tied to infra/SSO instability
* only visible deep in trace logs

Your framework makes authentication failures:

* **detectable**
* **classifiable**
* **explainable**
* **fixable**

No guessing.
No digging through raw trace logs.

---

# 🛡 **7. Protections Against Authentication Flakiness**

Your framework contains multiple layers designed to **prevent** auth failures:

### ✔ Auth Manager

Ensures consistent auth generation.

### ✔ Per-role storageState

Isolates roles.

### ✔ Per-test context

Prevents state contamination.

### ✔ RCA Engine

Identifies root cause precisely.

### ✔ Evidence Collector

Captures all signals needed.

### ✔ Governance Pre-checks

Ensures environment baseline stability.

---

# 🧭 **8. When Authentication Renewal Happens Automatically**

AuthManager regenerates session when:

* cookies missing
* tokens expired
* redirect to `/login` after valid rolePage creation
* SSO error detected
* request to `/session-check` fails

This reduces test flakiness massively.

---

# 🏁 **9. Summary**

Your framework provides industry-leading authentication diagnostics combining:

### ✔ Storage state lifecycle

### ✔ Multi-role session management

### ✔ RCA classification

### ✔ Trace analysis

### ✔ Evidence-based debugging

### ✔ Automated recovery

### ✔ Full transparency into root causes

This authentication RCA layer alone puts your framework far above typical Playwright, Cypress, or Selenium stacks — it is equivalent to what you’d find inside large enterprise QA infrastructures (e.g., Meta WebDriverAgent, Microsoft Polaris Framework, Atlassian E2E Platform).

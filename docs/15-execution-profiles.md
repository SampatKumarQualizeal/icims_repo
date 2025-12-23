
# **15 – Execution Profiles (FAST, SAFE, DEBUG)**

Execution Profiles define **how** the framework interacts with the UI.
They control timing, stability waits, retries, logging verbosity, and diagnostic output.

They allow developers and CI systems to **switch between different execution modes** without modifying test code.

This ensures:

* tests run fast locally
* tests run stable in CI
* tests produce deep diagnostics during debugging
* teams can standardize test behavior across environments

---

# 🎯 **Purpose of Execution Profiles**

Execution Profiles exist to solve a very common UI automation problem:

> **“The same test behaves differently on Dev machine vs CI vs Demo environments.”**

By centralizing and tuning execution behavior (waits, retries, logging), we achieve:

### ✔ Consistency

### ✔ Stability

### ✔ Predictability

### ✔ Faster debugging

### ✔ Lower flake rate

### ✔ Better observability

---

# 🧱 **Where Execution Profiles Live**

```
src/utils/execution-profile.util.ts
```

They are consumed primarily by:

* `BaseComponent.exec()`
* stability waits (`waitForVisibleAndStable`)
* retry engine (`retryWithBackoff`)
* tab manager interactions
* logging verbosity
* soft assertions and annotations
* evidence collector (optional)

---

# ❗ Key Principle

Execution profile selection is **totally independent of test code**.

Tests do NOT choose profile.
They simply use components:

```ts
await loginButton.click();
await header.verifyVisible();
```

The framework decides **how** to execute them.
This is a major design advantage.

---

# 🧬 **1. FAST Profile (Developer Mode)**

### ✔ Fastest execution

### ✔ Minimal waits

### ✔ Minimal retries

### ✔ Low logging

### ✔ Great for local dev experiments

Used when:

```
config.executionMode = "FAST"
```

### FAST Tuning:

| Setting             | Value           |
| ------------------- | --------------- |
| retries             | 0–1             |
| wait time           | 50–150ms        |
| stability threshold | low             |
| retry delay         | minimal         |
| logging             | basic           |
| screenshots         | off             |
| traces              | only on failure |

Ideal for:

* writing new tests
* rapid iteration
* local debugging without noise

---

# 🧱 **2. SAFE Profile (CI Mode)**

This is the **recommended default** for CI/CD.

### ✔ Balanced speed + stability

### ✔ Increased retry logic

### ✔ Moderate logs

### ✔ Resilient to minor UI flakiness

### ✔ Ensures reproducibility

Used when:

```
config.executionMode = "SAFE"
```

### SAFE Tuning:

| Setting        | Value             |
| -------------- | ----------------- |
| retries        | 2–4               |
| stability wait | 150–300ms         |
| timeout        | moderate (8s)     |
| retry delay    | 200–400ms         |
| logging        | medium            |
| screenshots    | on failure        |
| traces         | retain on failure |

Ideal for:

* nightly regression
* PR pipeline checks
* multi-environment test runs
* slower environments (QA/Staging)

---

# 🧠 **3. DEBUG Profile (Deep Diagnostics Mode)**

The **deep debugging** mode for diagnosing complex failures.

### ✔ Maximum logging

### ✔ Annotated steps

### ✔ Screenshots per action

### ✔ Traces per test

### ✔ Increased waits

### ✔ Lower flake risk

### ✔ Ideal for RCA

Used when:

```
config.executionMode = "DEBUG"
```

### DEBUG Tuning:

| Setting        | Value                          |
| -------------- | ------------------------------ |
| retries        | 5–8                            |
| stability wait | 300–600ms                      |
| retry delay    | 400–600ms                      |
| logging        | verbose (component-level logs) |
| screenshots    | every step (optional)          |
| traces         | retain always                  |
| soft asserts   | produce extended diagnostics   |

Ideal for:

* reproducing flaky failures
* diagnosing intermittent issues
* gathering evidence for engineering
* customer demo debugging
* RCA-heavy analysis

---

# 🧩 **Component Integration**

Each component method calls:

```ts
const profile = getExecutionProfile();
```

Then applies:

### ✔ adaptive wait

```ts
await waitForVisibleAndStable(loc, profile.stabilityMs, profile.timeout);
```

### ✔ retry strategy

```ts
await retryWithBackoff(fn, profile.retries, profile.retryDelay);
```

### ✔ logging

```ts
if (profile.verbose) logger.info(...)
```

### ✔ annotation

Automatically wraps in `test.step()` only when appropriate.

---

# 🧪 **Runtime Behavior Example**

Let's say `loginButton.click()` is called.

### FAST

```
[Login Button] click
- 1 quick retry
- minimal wait
- fast failure if issue
```

### SAFE

```
[Login Button] click
- wait for stable DOM
- 2–3 retries
- smoother experience
```

### DEBUG

```
[Login Button] click
- 5 retries
- verbose steps in report
- screenshot saved
- trace collected
```

Same test code → different stability & diagnostics.

---

# ⚙️ **Profile Configuration**

In `config/environment` or `.env`:

```
EXECUTION_MODE=SAFE
```

Available values:

```
FAST
SAFE
DEBUG
```

Fallback default:

```
SAFE
```

Because SAFE provides the best CI reliability.

---

# 🧭 **How to Switch Profiles**

### Locally (Mac/Linux):

```bash
EXECUTION_MODE=DEBUG npx playwright test
```

### Locally (Windows PowerShell):

```ps
$env:EXECUTION_MODE="FAST"; npx playwright test
```

### CI:

```yaml
env:
  EXECUTION_MODE: SAFE
```

---

# 🔍 **Why Execution Profiles are Important**

| Problem              | Execution Profile Solution |
| -------------------- | -------------------------- |
| Local tests are slow | FAST mode                  |
| CI tests flaky       | SAFE mode                  |
| Debugging takes time | DEBUG mode                 |
| Slow environments    | SAFE/DEBUG auto-adapt      |
| Evidence missing     | DEBUG collects everything  |

This gives flexibility without modifying test code.

---

# 🌐 **Advanced Capabilities (Future)**

### ✔ AI-driven profile selection

Dynamically pick profile based on:

* test history
* failure patterns
* environment speed

### ✔ Per-component profile overrides

More retries for unstable components.

### ✔ Per-test profile hints

Attached metadata selecting profile.

### ✔ Auto-downgrade FAST → SAFE

If test begins flaking.

### ✔ Test-based dynamic waits

Measure DOM load times and adjust stability wait automatically.

---

# 🏁 **Summary**

Execution Profiles are the core of test stability and developer productivity.

### FAST → Local speed

### SAFE → CI reliability

### DEBUG → Deep diagnostics

They ensure the same test code behaves correctly across:

* Developer laptops
* Shared QA environments
* Staging
* Pre-production
* Customer-specific setups
* CI/CD pipelines

This is a foundational system supporting the entire automation platform.

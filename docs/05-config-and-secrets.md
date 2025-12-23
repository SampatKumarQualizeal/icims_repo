
# ⚙️ **Framework — Configuration System**

The iCIMS Playwright Automation Framework includes a **fully modular, secure, and cross-environment configuration system** designed for large-scale enterprise automation.

This CHAPTER explains:

* 🔹 How environment configs are structured
* 🔹 How secrets are injected securely
* 🔹 How cross-env + CI pipelines load environments
* 🔹 What is committed vs. gitignored
* 🔹 How the framework consumes configuration internally
* 🔹 Best practices for secure config maintenance

---

# 📁 **Folder Structure**

```
config/
│
├── config.ts                # Final merged config used by the framework
├── env-loader.ts            # Loads correct environment based on ENV variable
│
├── environment/
│   ├── base.env.ts          # Default values applicable to all environments
│   ├── dev.env.ts           # Overrides for DEV
│   ├── qa.env.ts            # Overrides for QA
│   ├── stage.env.ts         # Overrides for STAGE
│   ├── prod.env.ts          # Overrides for PROD
│
└── secrets/
    ├── secrets.template.ts  # Placeholder skeleton committed to repo
    └── secrets.local.ts     # Actual secrets (GIT-IGNORED)
```

---

# 🌍 **1. Loading the Active Environment**

The active environment is selected by:

```
ENV=dev | qa | stage | prod
```

### ✔ Supported via:

* `cross-env ENV=qa`
* `.env` files
* GitHub Actions + Jenkins ENV vars

### Code:

```ts
const envName = process.env.ENV || "dev";
```

Then the loader merges:

```
base.env.ts  +  qa.env.ts  =  final QA config
```

---

# 🧩 **2. Environment Configuration Files**

Environment files store **non-sensitive**, environment-specific values:

| Example Value                    | Stored In | Committed? |
| -------------------------------- | --------- | ---------- |
| Base URLs                        | env files | ✔ Yes      |
| Feature flags                    | env files | ✔ Yes      |
| Request timeouts                 | env files | ✔ Yes      |
| Execution mode (FAST/SAFE/DEBUG) | env files | ✔ Yes      |
| Retry strategy                   | env files | ✔ Yes      |
| Toggle for experiments           | env files | ✔ Yes      |

### Example (qa.env.ts)

```ts
export const qaEnv = {
  appBaseUrl: "https://qa.icims.com",
  apiBaseUrl: "https://api.qa.icims.com",
  executionMode: "SAFE",
  enableSearchV2: true,
  retryCount: 2
};
```

### Environment Selection Flow

```
ENV=qa --> qa.env.ts + base.env.ts --> final config
```

---

# 🔐 **3. Secrets Management**

**Secrets MUST NEVER be committed.**

Your secrets folder contains:

### ✔ `secrets.template.ts` (committed)

Skeleton file showing expected fields:

```ts
export const secretsTemplate = {
  uiUser: "",
  uiPass: "",
  apiAdminUser: "",
  apiAdminPassword: "",
};
```

### ❌ `secrets.local.ts` (NOT committed)

This file is `.gitignore’d` and loads secrets from environment variables:

```ts
export const secrets = {
  uiUser: process.env.UI_USER,
  uiPass: process.env.UI_PASS,
};
```

### 🔐 CI/CD Pipelines inject secrets via:

* GitHub Actions encrypted vars
* Jenkins credentials
* Azure DevOps pipelines

**Secrets are never pushed to any repo.**

---

# 🧬 **4. Final Merged Config (`config.ts`)**

This file merges:

```
environment + secrets + system flags
```

And is consumed everywhere in the framework:

```ts
export const config = {
  ...env,
  secrets,
  isDebug: env.executionMode === "DEBUG"
};
```

### Usage inside tests:

```ts
await page.goto(config.appBaseUrl);
const user = config.secrets.ats.uiUser;
```

### Usage inside factories:

```ts
await api.login(config.secrets.ats.apiAdminUser, config.secrets.ats.apiAdminPassword);
```

---

# 🚀 **5. Using Config in Playwright Commands**

### Run with QA environment:

```
cross-env ENV=qa npx playwright test
```

### Run with Production environment:

```
cross-env ENV=prod npx playwright test
```

### Local run (DEV environment default):

```
npx playwright test
```

---

# 🛡 **6. What Is Committed vs. What Is Private**

| File/Path                            | Status       | Reason                                 |
| ------------------------------------ | ------------ | -------------------------------------- |
| `config/environment/*.env.ts`        | ✔ Committed  | Contains harmless non-secret env logic |
| `config/config.ts`                   | ✔ Committed  | Loads merged config                    |
| `config/env-loader.ts`               | ✔ Committed  | Generic loader                         |
| `config/secrets/secrets.template.ts` | ✔ Committed  | Skeleton for developers                |
| `config/secrets/secrets.local.ts`    | ❌ GITIGNORED | Contains real secrets                  |
| `.env`                               | ❌ GITIGNORED | Can contain sensitive tokens           |

Your `.gitignore` must contain:

```
config/secrets/secrets.local.ts
.env
.env.*
```

---

# 🧪 **7. Test Isolation & Data Control**

Config supports:

### ✔ Multiple environments

### ✔ Test isolation by environment

### ✔ Environment-specific:

* URLs
* Authentication
* Feature flags
* API throttling rules
* Retries
* Browser options
* Test data prefixes

Examples:

```ts
const prefix = config.testDataPrefix;
const user = `${prefix}.${Date.now()}@example.com`;
```

---

# 🧭 **8. Execution Modes Explained**

| Mode      | Purpose               | Behavior                              |
| --------- | --------------------- | ------------------------------------- |
| **FAST**  | CI smoke runs         | Minimal retries, screenshots off      |
| **SAFE**  | Default               | Evidence on failures, retries enabled |
| **DEBUG** | Local troubleshooting | Verbose logs, screenshots every step  |

Used everywhere:

```ts
if (config.isDebug) {
  logger.debug("Verbose logging enabled");
}
```

---

# 💡 **9. Why This System Matters**

### 🔒 Security

No secrets in the repo, and CI/CD injects them securely.

### 🔁 Reusability

Works across web, API, flows, Page Objects, multi-role tests.

### 🧩 Extensibility

Add new environment files without touching core framework.

### ⚙️ Stability

Tests become deterministic across environments.

### 🕹 Control

You can toggle entire UI workflows or API flows using flags.

---

# 📌 **10. Summary**

This configuration system provides:

* A **strict separation** of environment, secret, and runtime configs
* **Cross-env** support for local + CI
* **Scalable overrides** with base + environment merging
* Strong **TypeScript typing** for confidence and safety
* A safe and auditable way to handle credentials

This is the **enterprise-grade** pattern used across modern automation frameworks.


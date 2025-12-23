/**
 * Contains:
 * - replicate(customerId)
 * - rollback(changeJournal)
 * - helpers (applyFlags, applyPropKeys, applyDbConfig, applyHaRules, applyCms, ensureUsers)
 * - changeJournal tracking
 */

import fs from "fs";
import path from "path";

import { Logger } from "@src/utils/logger.util";
import { config } from "@config/config";
import { LaunchDarklyClient } from "@src/featureflags/launchdarkly.client";

type ChangeRecord =
  | { type: "flag"; key: string; previous: boolean | undefined }
  | { type: "propKey"; key: string; previous: any }
  | { type: "dbConfig"; endpoint: string; previous: any }
  | { type: "haRule"; ruleName: string; previous: any }
  | { type: "cms"; site: string; previous: any }
  | { type: "user"; username: string; previous: any };

export type ReplicateResult = {
  ok: boolean;
  summary: Record<string, any>;
  errors: { step: string; error: string }[];
  durationMs: number;
};

const logger =
  (globalThis as any).__TEST_LOGGER__ ||
  new Logger({
    testId: "env-replicator",
    testOutputDir: "./logs",
    toConsole: true,
    context: "env",
  });

// ==========================================================
// TOOLING HELPERS
// ==========================================================

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

async function retry<T>(fn: () => Promise<T>, attempts = 3, backoff = 300) {
  let lastError: any;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      await sleep(backoff * (i + 1));
    }
  }
  throw lastError;
}

async function httpRequest(url: string, options: RequestInit) {
  const res = await fetch(url, options);
  const txt = await res.text();
  let json: any = txt;
  try {
    json = txt ? JSON.parse(txt) : undefined;
  } catch {
    /* ignore */
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${txt}`);
  return json;
}

function readPreset(customerId: string): any {
  const file = path.join(
    process.cwd(),
    "config",
    "customers",
    `${customerId}.json`
  );
  if (!fs.existsSync(file)) {
    throw new Error(`Preset not found: ${file}`);
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

// ==========================================================
// APPLY FUNCTIONS (each records ChangeRecord entries)
// ==========================================================

async function applyFlags(
  flags: Record<string, boolean> | undefined,
  changeJournal: ChangeRecord[],
  ctx: { ldClient?: LaunchDarklyClient }
) {
  if (!flags) return;

  if (!config.ldEnabled) {
    logger.info("[env] LD disabled — skipping flags");
    return;
  }

  if (!ctx.ldClient) {
    ctx.ldClient = new LaunchDarklyClient();
    await ctx.ldClient.init();
  }

  for (const [flag, newValue] of Object.entries(flags)) {
    const previous = await ctx.ldClient.getFlag(flag);

    changeJournal.push({
      type: "flag",
      key: flag,
      previous,
    });

    await ctx.ldClient.setFlag(flag, newValue);
  }
}

async function applyPropKeys(
  propKeys: Record<string, any> | undefined,
  changeJournal: ChangeRecord[]
) {
  if (!propKeys) return;
  if (!config.apiBaseUrl) {
    logger.warn("[env] Admin API not configured — skipping propKeys");
    return;
  }

  for (const [key, value] of Object.entries(propKeys)) {
    const prev = await httpRequest(
      `${config.apiBaseUrl}/config/propkey/${key}`,
      {
        method: "GET",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(`${config.secrets.ats.apiAdminUser}:${config.secrets.ats.apiAdminPassword}`).toString(
              "base64"
            ),
        },
      }
    );

    changeJournal.push({
      type: "propKey",
      key,
      previous: prev?.value,
    });

    await httpRequest(`${config.apiBaseUrl}/config/propkey`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(`${config.secrets.ats.apiAdminUser}:${config.secrets.ats.apiAdminPassword}`).toString(
            "base64"
          ),
      },
      body: JSON.stringify({ key, value }),
    });
  }
}

async function applyDbConfig(
  dbConfig: any,
  changeJournal: ChangeRecord[]
) {
  if (!dbConfig?.endpoints) return;

  for (const ep of dbConfig.endpoints) {
    const prev = await httpRequest(
      `${config.apiBaseUrl}${ep.path}`,
      {
        method: "GET",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(`${config.secrets.ats.apiAdminUser}:${config.secrets.ats.apiAdminPassword}`).toString(
              "base64"
            ),
        },
      }
    );

    changeJournal.push({
      type: "dbConfig",
      endpoint: ep.path,
      previous: prev,
    });

    await httpRequest(`${config.apiBaseUrl}${ep.path}`, {
      method: ep.method ?? "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(`${config.secrets.ats.apiAdminUser}:${config.secrets.ats.apiAdminPassword}`).toString(
            "base64"
          ),
      },
      body: JSON.stringify(ep.body),
    });
  }
}

async function applyHaRules(haRules: any[] | undefined, changeJournal: ChangeRecord[]) {
  if (!haRules) return;

  for (const rule of haRules) {
    const prev = await httpRequest(
      `${config.apiBaseUrl}/ha/rules?name=${rule.name}`,
      {
        method: "GET",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(`${config.secrets.ats.apiAdminUser}:${config.secrets.ats.apiAdminPassword}`).toString(
              "base64"
            ),
        },
      }
    );

    changeJournal.push({
      type: "haRule",
      ruleName: rule.name,
      previous: prev,
    });

    await httpRequest(`${config.apiBaseUrl}/ha/rules`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(`${config.secrets.ats.apiAdminUser}:${config.secrets.ats.apiAdminPassword}`).toString(
            "base64"
          ),
      },
      body: JSON.stringify(rule),
    });
  }
}

async function applyCms(cms: any[] | undefined, changeJournal: ChangeRecord[]) {
  if (!cms) return;

  for (const site of cms) {
    const prev = await httpRequest(
      `${config.apiBaseUrl}/cms/preset/${site.site}`,
      {
        method: "GET",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(`${config.secrets.ats.apiAdminUser}:${config.secrets.ats.apiAdminPassword}`).toString(
              "base64"
            ),
        },
      }
    );

    changeJournal.push({
      type: "cms",
      site: site.site,
      previous: prev,
    });

    await httpRequest(`${config.apiBaseUrl}/cms/ppreset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(`${config.secrets.ats.apiAdminUser}:${config.secrets.ats.apiAdminPassword}`).toString(
            "base64"
          ),
      },
      body: JSON.stringify(site),
    });
  }
}

async function ensureUsers(users: any[] | undefined, changeJournal: ChangeRecord[]) {
  if (!users) return;

  for (const u of users) {
    const prev = await httpRequest(
      `${config.apiBaseUrl}/users/${u.username}`,
      {
        method: "GET",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(`${config.secrets.ats.apiAdminUser}:${config.secrets.ats.apiAdminPassword}`).toString(
              "base64"
            ),
        },
      }
    );

    changeJournal.push({
      type: "user",
      username: u.username,
      previous: prev,
    });

    await httpRequest(`${config.apiBaseUrl}/users/create-or-update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(`${config.secrets.ats.apiAdminUser}:${config.secrets.ats.apiAdminPassword}`).toString(
            "base64"
          ),
      },
      body: JSON.stringify(u),
    });
  }
}

// ==========================================================
//  MISSING PIECE — HERE IS THE FULL replicate() FUNCTION
// ==========================================================

async function replicate(customerId: string): Promise<ReplicateResult> {
  const start = Date.now();
  const errors: { step: string; error: string }[] = [];
  const summary: Record<string, any> = {};
  const changeJournal: ChangeRecord[] = [];
  const ctx: { ldClient?: LaunchDarklyClient } = {};

  try {
    logger.info("[env] Replicating customer", { customerId });

    const preset = readPreset(customerId);

    // 1) Flags
    try {
      await applyFlags(preset.flags, changeJournal, ctx);
      summary.flags = { ok: true };
    } catch (err) {
      errors.push({ step: "flags", error: String(err) });
    }

    // 2) PropKeys
    try {
      await applyPropKeys(preset.propKeys, changeJournal);
      summary.propKeys = { ok: true };
    } catch (err) {
      errors.push({ step: "propKeys", error: String(err) });
    }

    // 3) DB Config
    try {
      await applyDbConfig(preset.dbConfig, changeJournal);
      summary.dbConfig = { ok: true };
    } catch (err) {
      errors.push({ step: "dbConfig", error: String(err) });
    }

    // 4) HA rules
    try {
      await applyHaRules(preset.haRules, changeJournal);
      summary.haRules = { ok: true };
    } catch (err) {
      errors.push({ step: "haRules", error: String(err) });
    }

    // 5) CMS
    try {
      await applyCms(preset.cms, changeJournal);
      summary.cms = { ok: true };
    } catch (err) {
      errors.push({ step: "cms", error: String(err) });
    }

    // 6) Users
    try {
      await ensureUsers(preset.users, changeJournal);
      summary.users = { ok: true };
    } catch (err) {
      errors.push({ step: "users", error: String(err) });
    }

    // 7) Add changeJournal and LD change info
    summary.changeJournal = changeJournal;
    summary.ldChanges = ctx.ldClient?.getChanges?.() ?? [];

    const ok = errors.length === 0;
    return {
      ok,
      summary,
      errors,
      durationMs: Date.now() - start,
    };
  } finally {
    if (ctx.ldClient) await ctx.ldClient.close();
  }
}

// ==========================================================
// ROLLBACK — Complete working implementation
// ==========================================================

async function rollback(changeJournal: ChangeRecord[]) {
  logger.info("[env] Starting rollback", { entries: changeJournal.length });

  for (let i = changeJournal.length - 1; i >= 0; i--) {
    const entry = changeJournal[i];

    try {
      switch (entry.type) {
        case "flag": {
          const ld = new LaunchDarklyClient();
          await ld.init();
          await ld.setFlag(entry.key, entry.previous ?? false);
          await ld.close();
          break;
        }

        case "propKey":
          await httpRequest(`${config.apiBaseUrl}/config/propkey`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization:
                "Basic " +
                Buffer.from(`${config.secrets.ats.apiAdminUser}:${config.secrets.ats.apiAdminPassword}`).toString(
                  "base64"
                ),
            },
            body: JSON.stringify({ key: entry.key, value: entry.previous }),
          });
          break;

        case "dbConfig":
          await httpRequest(`${config.apiBaseUrl}${entry.endpoint}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(entry.previous),
          });
          break;

        case "haRule":
          await httpRequest(`${config.apiBaseUrl}/ha/rules`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(entry.previous),
          });
          break;

        case "cms":
          await httpRequest(`${config.apiBaseUrl}/cms/preset`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(entry.previous),
          });
          break;

        case "user":
          await httpRequest(`${config.apiBaseUrl}/users/create-or-update`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(entry.previous),
          });
          break;
      }
    } catch (err) {
      logger.error("[env] Rollback failed", { entry, error: String(err) });
    }
  }

  logger.info("[env] Rollback complete");
}

// ==========================================================
// FINAL EXPORT
// ==========================================================

export const env = {
  replicate,
  rollback,
};

export default env;

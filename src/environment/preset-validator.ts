/**
 * Validates a customer preset JSON file.
 * Ensures the structure is correct and values follow expected schema.
 */

import fs from "fs";
import path from "path";
import { Logger } from "@src/utils/logger.util";

export type ValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
  preset?: any;
};

const logger =
  (globalThis as any).__TEST_LOGGER__ ||
  new Logger({
    testId: "preset-validator",
    testOutputDir: "./logs",
    toConsole: true,
    context: "preset-validator",
  });

/** Utility to check type safely */
function isObject(value: any): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Load and validate a customer preset file.
 */
export function validatePreset(customerId: string): ValidationResult {
  const presetPath = path.join(
    process.cwd(),
    "config",
    "customers",
    `${customerId}.json`
  );

  if (!fs.existsSync(presetPath)) {
    return {
      ok: false,
      errors: [`Preset file not found: ${presetPath}`],
      warnings: [],
    };
  }

  let json: any;
  try {
    json = JSON.parse(fs.readFileSync(presetPath, "utf8"));
  } catch (err: any) {
    return {
      ok: false,
      errors: [`Preset file contains invalid JSON: ${err.message}`],
      warnings: [],
    };
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // ============================
  // 1. Top-level shape
  // ============================
  if (!isObject(json)) {
    errors.push("Preset root must be an object.");
    return { ok: false, errors, warnings };
  }

  // ============================
  // 2. flags
  // ============================
  if (json.flags) {
    if (!isObject(json.flags)) {
      errors.push("`flags` must be an object of { flagKey: boolean }.");
    } else {
      for (const [k, v] of Object.entries(json.flags)) {
        if (typeof v !== "boolean") {
          errors.push(`Flag '${k}' must be boolean, got: ${typeof v}`);
        }
      }
    }
  } else {
    warnings.push("Preset has no `flags` section.");
  }

  // ============================
  // 3. propKeys
  // ============================
  if (json.propKeys) {
    if (!isObject(json.propKeys)) {
      errors.push("`propKeys` must be an object of { key: value }.");
    }
  } else {
    warnings.push("Preset has no `propKeys` section.");
  }

  // ============================
  // 4. dbConfig
  // ============================
  if (json.dbConfig) {
    if (!isObject(json.dbConfig)) {
      errors.push("`dbConfig` must be an object.");
    }
    if (json.dbConfig.endpoints) {
      if (!Array.isArray(json.dbConfig.endpoints)) {
        errors.push("`dbConfig.endpoints` must be an array.");
      } else {
        json.dbConfig.endpoints.forEach((ep: any, idx: number) => {
          if (!isObject(ep)) {
            errors.push(`dbConfig.endpoints[${idx}] must be an object.`);
            return;
          }
          if (!ep.path || typeof ep.path !== "string") {
            errors.push(`dbConfig.endpoints[${idx}].path must be a string`);
          }
          if (ep.method && !["POST", "PUT", "PATCH"].includes(ep.method)) {
            errors.push(
              `dbConfig.endpoints[${idx}].method must be POST/PUT/PATCH`
            );
          }
          if (!("body" in ep)) {
            errors.push(`dbConfig.endpoints[${idx}] missing required 'body'`);
          }
        });
      }
    }
  }

  // ============================
  // 5. HA rules
  // ============================
  if (json.haRules) {
    if (!Array.isArray(json.haRules)) {
      errors.push("`haRules` must be an array.");
    } else {
      json.haRules.forEach((rule: any, idx: number) => {
        if (!isObject(rule)) {
          errors.push(`haRules[${idx}] must be an object.`);
          return;
        }
        if (!rule.name) errors.push(`haRules[${idx}].name is required.`);
        if (!rule.trigger)
          errors.push(`haRules[${idx}].trigger is required.`);
        if (!rule.condition)
          errors.push(`haRules[${idx}].condition is required.`);
        if (!rule.action)
          errors.push(`haRules[${idx}].action is required.`);
      });
    }
  }

  // ============================
  // 6. CMS
  // ============================
  if (json.cms) {
    if (!Array.isArray(json.cms)) {
      errors.push("`cms` must be an array.");
    } else {
      json.cms.forEach((site: any, idx: number) => {
        if (!isObject(site)) {
          errors.push(`cms[${idx}] must be an object.`);
          return;
        }
        if (!site.site)
          errors.push(`cms[${idx}].site is required.`);
        if (!site.theme)
          errors.push(`cms[${idx}].theme is required.`);
      });
    }
  }

  // ============================
  // 7. Test users
  // ============================
  if (json.users) {
    if (!Array.isArray(json.users)) {
      errors.push("`users` must be an array.");
    } else {
      json.users.forEach((u: any, idx: number) => {
        if (!isObject(u)) {
          errors.push(`users[${idx}] must be an object.`);
          return;
        }
        if (!u.username) errors.push(`users[${idx}].username is required.`);
        if (!u.role) errors.push(`users[${idx}].role is required.`);
        // attr is optional but if present must be object
        if (u.attrs && !isObject(u.attrs)) {
          errors.push(`users[${idx}].attrs must be an object.`);
        }
      });
    }
  }

  // ============================
  // Final result
  // ============================
  const ok = errors.length === 0;

  if (!ok) {
    logger.error("[preset-validator] Validation failed", { errors });
  } else {
    logger.info("[preset-validator] Validation passed", { customerId });
  }

  return {
    ok,
    errors,
    warnings,
    preset: ok ? json : undefined,
  };
}

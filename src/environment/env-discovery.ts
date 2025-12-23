/**
 * Auto-discovery for customer configuration.
 * Gathers flags, propKeys, DB config, HA rules, CMS, and user metadata.
 */

import fs from "fs";
import path from "path";

import { Logger } from "@src/utils/logger.util";
import { config } from "@config/config";
import { LaunchDarklyClient } from "@src/featureflags/launchdarkly.client";

async function httpGet(url: string) {
  const res = await fetch(url, {
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${config.secrets.ats.apiAdminUser}:${config.secrets.ats.apiAdminPassword}`).toString("base64"),
    },
  });

  const txt = await res.text();
  let json = txt;
  try {
    json = JSON.parse(txt);
  } catch (_) {}

  if (!res.ok) throw new Error(`GET ${url} failed: ${txt}`);
  return json;
}

const logger =
  (globalThis as any).__TEST_LOGGER__ ||
  new Logger({
    testId: "env-discovery",
    testOutputDir: "./logs",
    toConsole: true,
    context: "env-discovery",
  });

/**
 * Auto-discover customer configuration.
 */
export async function discover(customerId: string) {
  logger.info("[env][discover] Starting discovery for tenant", { customerId });

  const preset: any = {
    notes: `Auto-generated preset for ${customerId} on ${new Date().toISOString()}`,
    flags: {},
    propKeys: {},
    dbConfig: { endpoints: [] },
    haRules: [],
    cms: [],
    users: [],
  };

  // --------------------------------------------
  // 1. Discover LaunchDarkly flags
  // --------------------------------------------
  if (config.ldEnabled) {
    logger.info("[env][discover] Fetching LaunchDarkly flags...");

    const ld = new LaunchDarklyClient();
    await ld.init();

    // You may maintain a list of known flags OR fetch all via LD REST
    const knownFlags = [
      "portal-ui-v2",
      "new-job-posting-ui",
      "text-engagement-v2",
      "hiring-automation-phase2",
      "candidate-workflow-v3",
      "job-template-v2",
    ];

    for (const flag of knownFlags) {
      try {
        const val = await ld.getFlag(flag);
        preset.flags[flag] = val;
      } catch (err) {
        logger.warn("[env][discover] Could not read LD flag", {
          flag,
          error: String(err),
        });
      }
    }

    await ld.close();
  }

  // --------------------------------------------
  // 2. Discover PropKeys
  // --------------------------------------------
  try {
    const url = `${config.apiBaseUrl}/config/propkey/all`;
    logger.info("[env][discover] Fetching propKeys...");
    const data = await httpGet(url);

    if (Array.isArray(data)) {
      for (const entry of data) {
        preset.propKeys[entry.key] = entry.value;
      }
    }
  } catch (err) {
    logger.warn("[env][discover] propKeys fetch failed", { error: String(err) });
  }

  // --------------------------------------------
  // 3. Workflow bins
  // --------------------------------------------
  try {
    const binsUrl = `${config.apiBaseUrl}/workflow/bins`;
    logger.info("[env][discover] Fetching workflow bins...");
    const data = await httpGet(binsUrl);

    preset.dbConfig.endpoints.push({
      path: "/workflow/bins",
      method: "POST",
      body: { bins: data },
    });
  } catch (err) {
    logger.warn("[env][discover] workflow fetch failed", { error: String(err) });
  }

  // --------------------------------------------
  // 4. Profile fields
  // --------------------------------------------
  try {
    const fieldsUrl = `${config.apiBaseUrl}/profile/fields`;
    logger.info("[env][discover] Fetching profile fields...");
    const data = await httpGet(fieldsUrl);

    preset.dbConfig.endpoints.push({
      path: "/profile/fields",
      method: "POST",
      body: { fields: data },
    });
  } catch (err) {
    logger.warn("[env][discover] profile fields fetch failed", {
      error: String(err),
    });
  }

  // --------------------------------------------
  // 5. iForms
  // --------------------------------------------
  try {
    const url = `${config.apiBaseUrl}/templates/iforms`;
    logger.info("[env][discover] Fetching iForms...");
    const data = await httpGet(url);

    preset.dbConfig.endpoints.push({
      path: "/templates/iform",
      method: "POST",
      body: { iforms: data },
    });
  } catch (err) {
    logger.warn("[env][discover] iForms fetch failed", { error: String(err) });
  }

  // --------------------------------------------
  // 6. Email Templates
  // --------------------------------------------
  try {
    const url = `${config.apiBaseUrl}/email/templates`;
    logger.info("[env][discover] Fetching email templates...");
    const data = await httpGet(url);

    preset.dbConfig.endpoints.push({
      path: "/email/templates",
      method: "POST",
      body: { templates: data },
    });
  } catch (err) {
    logger.warn("[env][discover] email templates fetch failed", {
      error: String(err),
    });
  }

  // --------------------------------------------
  // 7. HA Rules
  // --------------------------------------------
  try {
    const haUrl = `${config.apiBaseUrl}/ha/rules`;
    logger.info("[env][discover] Fetching HA rules...");
    const data = await httpGet(haUrl);

    preset.haRules = data;
  } catch (err) {
    logger.warn("[env][discover] HA rules fetch failed", {
      error: String(err),
    });
  }

  // --------------------------------------------
  // 8. CMS / Portal presets
  // --------------------------------------------
  try {
    const cmsUrl = `${config.apiBaseUrl}/cms/preset-list`;
    logger.info("[env][discover] Fetching CMS presets...");
    const data = await httpGet(cmsUrl);

    preset.cms = data;
  } catch (err) {
    logger.warn("[env][discover] CMS fetch failed", { error: String(err) });
  }

  // --------------------------------------------
  // 9. Test Users
  // --------------------------------------------
  try {
    const usersUrl = `${config.apiBaseUrl}/users/test-users`;
    logger.info("[env][discover] Fetching test users...");
    const data = await httpGet(usersUrl);

    preset.users = data;
  } catch (err) {
    logger.warn("[env][discover] Test users fetch failed", {
      error: String(err),
    });
  }

  logger.info("[env][discover] Discovery finished");

  return preset;
}

/**
 * Save preset to config/customers/<id>.json
 */
export function savePreset(customerId: string, preset: any) {
  const outputPath = path.join(
    process.cwd(),
    "config",
    "customers",
    `${customerId}.json`
  );

  fs.writeFileSync(outputPath, JSON.stringify(preset, null, 2));
  logger.info("[env][discover] Saved preset", { outputPath });
}

export const envDiscovery = {
  discover,
  savePreset,
};

export default envDiscovery;

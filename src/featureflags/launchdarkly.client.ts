
import { Logger } from "@src/utils/logger.util";
import { config } from "@config/config";

// Lazy import to avoid loading LD if disabled
let LD: any = null;

export class LaunchDarklyClient {
  private logger: Logger;
  private enabled: boolean;
  private sdkKey?: string;
  private client: any;
  private changes: { flag: string; value: boolean; timestamp: string }[] = [];

  constructor() {
    this.logger = (globalThis as any).__TEST_LOGGER__ ||
      new Logger({ testId: "ld", testOutputDir: "./logs", toConsole: true, context: "ld" });

    this.enabled = config.featureFlags.ldEnabled;
    this.sdkKey = config.ldSdkKey;

    if (!this.enabled) {
      this.logger.info("[LD] LaunchDarkly disabled");
      return;
    }

    if (!this.sdkKey) {
      this.logger.warn("[LD] LaunchDarkly enabled but missing SDK key!");
      this.enabled = false;
      return;
    }
  }

  async init() {
    if (!this.enabled) return;

    if (!LD) {
      // dynamically import LD only when needed
      LD = await import("@launchdarkly/node-server-sdk");
    }

    this.client = LD.init(this.sdkKey, {
      sendEvents: false, // prevent extra telemetry
    });

    // Wait for startup
    await this.client.waitForInitialization();

    this.logger.info("[LD] Initialized LaunchDarkly client");
  }

  async setFlag(flagKey: string, value: boolean) {
    if (!this.enabled) return;

    this.logger.info(`[LD] Setting flag`, { flag: flagKey, value });

    // Using LD SDK's evaluate + sendEvent is not ideal for write operations;
    // we assume LD API or relay proxy access OR we mock flag API in test env.
    // For now: using private API approach for internal testing environments:

    if (!this.client) await this.init();

    // NOTE: LaunchDarkly does NOT allow client-side writes.
    // Test env MUST expose writable endpoint (relay proxy or test API).
    // We implement a stub call here, ready for your internal API:

    const writeApiUrl = config.secrets.ldWriteUrl; // Add optional write endpoint in future
    if (!writeApiUrl) {
      this.logger.warn(`[LD] No write API configured. Flag change NOT applied.`);
      return;
    }

    await fetch(`${writeApiUrl}/flags/${flagKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.sdkKey}` },
      body: JSON.stringify({ value })
    });
  }

  async getFlag(flagKey: string, userKey = "automation-user") {
    if (!this.enabled) return false;

    if (!this.client) await this.init();

    const user = { key: userKey };
    const value = await this.client.variation(flagKey, user, false);

    this.logger.info(`[LD] Read flag`, { flag: flagKey, value });
    return value;
  }

  async resetFlags() {
    if (!this.enabled) return;

    // Same note: client cannot write; needs API or proxy.
    const writeApiUrl = config.secrets.ldWriteUrl;
    if (!writeApiUrl) return;

    await fetch(`${writeApiUrl}/reset`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.sdkKey}` }
    });

    this.logger.info("[LD] Reset all flags");
  }

  getChanges() {
    return this.changes ?? [];
  }

  async close() {
    if (this.client) await this.client.close();
  }
}

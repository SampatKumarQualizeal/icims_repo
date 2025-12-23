
import { config } from '@config/config';
import { Logger } from '@src/utils/logger.util';

export class SlackNotifier {
  private logger: Logger;
  private enabled: boolean;
  private webhook?: string;

  constructor() {
    this.logger = (globalThis as any).__TEST_LOGGER__ || new Logger({ 
      testId: "slack",
      testOutputDir: "./logs",
      toConsole: true,
      context: "slack" 
    });

    this.enabled = config.slackEnabled;
    this.webhook = config.secrets.slackWebhook;
  }

  async send(message: string) {
    if (!this.enabled) {
      this.logger.info(`[Slack] Notification skipped (disabled). Message: ${message}`);
      return;
    }

    if (!this.webhook) {
      this.logger.warn("[Slack] Slack enabled but no webhook provided.");
      return;
    }

    try {
      const payload = {
        text: message,
      };

      const response = await fetch(this.webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        this.logger.error("[Slack] Failed to send slack message", {
          status: response.status,
          statusText: response.statusText
        });
      } else {
        this.logger.info("[Slack] Notification sent successfully");
      }
    } catch (err) {
      this.logger.error("[Slack] Error sending slack notification", { error: String(err) });
    }
  }
}


import { config } from "@config/config";
import { Logger } from "@src/utils/logger.util";

export class TeamsNotifier {
  private logger: Logger;
  private enabled: boolean;
  private webhook?: string;

  constructor() {
    this.logger = (globalThis as any).__TEST_LOGGER__ || new Logger({
      testId: "teams",
      testOutputDir: "./logs",
      toConsole: true,
      context: "teams"
    });

    this.enabled = config.teamsEnabled;
    this.webhook = config.secrets.teamsWebhook;
  }

  async send(title: string, message: string) {
    if (!this.enabled) {
      this.logger.info(`[Teams] Disabled → skipping message: ${message}`);
      return;
    }

    if (!this.webhook) {
      this.logger.warn("[Teams] Enabled but no webhook defined");
      return;
    }

    const cardPayload = {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      "summary": title,
      "themeColor": "E81123",
      "title": title,
      "text": message,
      "sections": [
        {
          "facts": [
            { "name": "Environment", "value": config.environment },
            { "name": "Time", "value": new Date().toISOString() }
          ]
        }
      ]
    };

    try {
      const response = await fetch(this.webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cardPayload)
      });

      if (!response.ok) {
        this.logger.error("[Teams] Failed to send notification", {
          status: response.status,
          statusText: response.statusText,
        });
      } else {
        this.logger.info("[Teams] Notification sent successfully");
      }
    } catch (err) {
      this.logger.error("[Teams] Error sending notification", { error: String(err) });
    }
  }
}

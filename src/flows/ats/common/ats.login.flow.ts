// src/flows/common/ats.login.flow.ts
import { Page } from '@playwright/test';
import { Logger } from '@src/utils/logger.util';
import { LoginPage } from '@src/pages/ats/login.page';
import config from '@config/config';
import path from 'path';
import fs from 'fs';

export interface LoginResult {
  success: boolean;
  error?: string;
}

export class ATSLoginFlow {
  private readonly page: Page;
  private readonly logger: Logger;
  private readonly loginPage: LoginPage;
  private readonly postLoginTimeoutMs = 30000;

  constructor(page: Page, logger: Logger) {
    this.page = page;
    this.logger = logger;
    this.loginPage = new LoginPage(page);
  }

  async login(
    creds: { username: string; password: string },
    role: string
  ): Promise<LoginResult> {

    return await this.logger.section(`Login as '${role}'`, async () => {

      try {
        // 1. Navigate
        await this.loginPage.goto(config.appBaseUrl);

        // 2. Wait for login page
        await this.loginPage.expectLoaded();

        // 3. Perform UI login
        await this.loginPage.performLogin(creds.username, creds.password);

        // 4. Verify successful login
        const success = await this.page.locator('#navigatorUserMenu')
          .first()
          .waitFor({ timeout: this.postLoginTimeoutMs })
          .then(() => true)
          .catch(() => false);

        if (success) {
          return { success: true };
        }

        const msg = `Post-login verification failed for role '${role}'`;
        await this.captureDebugArtifacts(msg, role);
        return { success: false, error: msg };

      } catch (err: any) {
        const msg = `[LoginFlow] Unexpected error: ${String(err)}`;
        await this.captureDebugArtifacts(msg, role);
        return { success: false, error: msg };
      }
    });
  }

  private async captureDebugArtifacts(reason: string, role: string) {
    this.logger.error(reason);

    const debugDir = path.join(process.cwd(), 'test-results/auth-debug');
    if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });

    const id = `${role}-${Date.now()}`;

    try {
      await this.page.screenshot({ path: `${debugDir}/auth-${id}.png`, fullPage: true });
    } catch {}

    try {
      await fs.promises.writeFile(
        `${debugDir}/auth-${id}.html`,
        await this.page.content().catch(() => '')
      );
    } catch {}
  }
}

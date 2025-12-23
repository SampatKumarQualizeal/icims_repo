import { Page } from '@playwright/test';
import { CrmLoginPage } from '@src/pages/crm/login.page';
import { CrmDashboardPage } from '@src/pages/crm/dashboard/dashboard.page';
import config from '@config/config';

/**
 * crmLogin
 * Pure UI login flow (no AuthManager).
 *
 * Recommended for one-off manual tests, debugging, or when disableAuthManager=true.
 *
 * Usage:
 *   await crmLogin(page, {
 *     email: 'user@example.com',
 *     password: 'secret'
 *   });
 */
export async function crmLogin(
  page: Page,
  creds: {
    user: string;
    password: string;
  },
  options?: { annotate?: boolean }
) {
  const loginPage = new CrmLoginPage(page);

  await loginPage.section('CRM Login', async () => {
    await loginPage.goto(config.crmBaseUrl);
    await loginPage.expectLoaded();
    await loginPage.useEmailLink.click();
    await loginPage.emailInput.fill(creds.user);
    await loginPage.passwordInput.fill(creds.password);
    await loginPage.loginBtn.click();
    // Validate dashboard
    const dashboard = new CrmDashboardPage(page);
    await dashboard.expectLoaded();
  });
}

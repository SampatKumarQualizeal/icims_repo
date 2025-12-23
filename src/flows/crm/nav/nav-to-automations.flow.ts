import { Page } from '@playwright/test';
import { EmailSearchPage } from '@src/pages/crm/email/email-search.page';
import { AutomationListPage } from '@src/pages/crm/automation/automation-list.page';

/**
 * navToAutomations
 */
export async function navToAutomations(page: Page) {
  const emailSearch = new EmailSearchPage(page);
  emailSearch.section('Navigate to Automated Campaigns', async () => {
    await emailSearch.expectLoaded();
    await emailSearch.automatedCampaignsTab.click();
    const list = new AutomationListPage(page);
    await list.expectLoaded();
    // return list;
  });
  
  
}

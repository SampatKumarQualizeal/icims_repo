import { Page } from '@playwright/test';
import { BaseTest } from '@src/utils/base-test.util';
import { BaseFlow } from '@src/utils/base-flow.util';
import { QuickSearchService } from '@src/services/quick-search.service';
import { PostingCenterPage } from '@src/pages/ats/job/posting-center.page';
import { PortalJobViewPage } from '@src/pages/ats/job/portal-job-view.page';
import { dateAdd } from '@src/utils/name.util';

/**
 * JobFlow
 * Pure orchestration layer around Job posting workflows.
 * Zero locators, zero iframe logic, 100% Page Object usage.
 */
export class JobFlow extends BaseFlow {
  readonly quickSearch: QuickSearchService;
  readonly postingCenter: PostingCenterPage;

  constructor(baseTest: BaseTest, page: Page) {
    super(baseTest, page);
    // Access the current page via baseTest.page
    this.quickSearch = new QuickSearchService(page);
    this.postingCenter = new PostingCenterPage(page);
  }

  /**
   * Complete flow:
   * - Search job
   * - Open Posting Center
   * - Select portal
   * - Pick date
   * - Post job
   * - Verify
   * - Open external link
   */
  async postJobToPortal(jobId: string, portal: string) {
    await this.quickSearch.searchAndSelectJob(jobId);
    await this.postingCenter.openPostToCareerPortals();
    await this.postingCenter.selectPortal("Career Portal", portal);
    const tomorrow = dateAdd('dd', 1, 'dd', { pad: false });
    await this.postingCenter.setEndDate(tomorrow);
    await this.postingCenter.selectFirstPosting(`External`);
    await this.postingCenter.post();
    await this.postingCenter.portalVisible(portal);
    await this.postingCenter.statusVisible('Posted');
  }

  /**
   * Opens the external portal link and returns a Page Object
   * bound to the NEW tab.
   */
  async verifyOnPortal(name: string): Promise<void> {
    await this.base.logger.section(`Verify on portal: ${name}`, async () => {
      // 1. Click the external link (opens popup)
      await this.postingCenter.openPortalLink(name);
      const popup = await this.base.tabs.openPopupByClick(this.page, this.postingCenter.externalBtn, name, { timeout: 20000 });

      // 3. Switch focus to popup
      await this.base.tabs.switchTo(name);

      // Example: verify page title contains job id or company name
      const title = await popup.title();
      this.base.logger.info(`Portal title: ${title}`);

      // 5. Close popup
      await this.base.tabs.close(name);

      // 6. ALWAYS switch back to Main Tab (safe fallback)
      await this.base.tabs.switchTo("Main Tab");
    });
  }

  async unpostFromPortal() {
    await this.postingCenter.selectFirstPosting(`External`);
    await this.postingCenter.cancelPost();
    await this.postingCenter.statusVisible('Unposted');
  }
}

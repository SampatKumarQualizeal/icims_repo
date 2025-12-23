import { Page, BrowserContext } from '@playwright/test';
import { BaseTest } from '@src/utils/base-test.util';
import { BaseFlow } from '@src/utils/base-flow.util';
import { JobSearchPage } from '@src/pages/ats/search/job-search.page';
import { PostingCenterPage } from '@src/pages/ats/job/posting-center.page';
import { CareerPortalPage } from '@src/pages/ats/career-portal.page';
import { SearchNavigationService } from '@src/services/search-navigation.service';

/**
 * JobPostingFlow
 * Orchestrates job posting and unposting workflows:
 * - Navigate to job and posting center
 * - Post job to career portal
 * - Verify job on external portal
 * - Unpost job from portal
 * - Verify job removed from portal
 */
export class JobPostingFlow extends BaseFlow {
  readonly jobSearchPage: JobSearchPage;
  readonly postingCenterPage: PostingCenterPage;
  readonly searchNav: SearchNavigationService;

  constructor(baseTest: BaseTest, page: Page) {
    super(baseTest, page);
    this.jobSearchPage = new JobSearchPage(page);
    this.postingCenterPage = new PostingCenterPage(page);
    this.searchNav = new SearchNavigationService(page);
  }

  /**
   * Navigate to posting center from job profile
   */
  async openPostingCenter() {
    await this.base.logger.section('Open Posting Center', async () => {
      await this.postingCenterPage.openPostToCareerPortals();
    });
  }

  /**
   * Post job to a career portal
   */
  async postJobToPortal(portalLabel: string, portalName: string) {
    await this.base.logger.section(`Post job to ${portalName} portal`, async () => {
      await this.postingCenterPage.selectPortal(portalLabel, portalName);
      await this.postingCenterPage.post();
      
      // Verify toast message
      const toastLoc = this.postingCenterPage.leftFrame.getByText('Your job has been posted');
      await toastLoc.waitFor({ state: 'visible', timeout: 5000 });
      
      // Verify status in table
      await this.postingCenterPage.statusVisible('Posted');
      await this.postingCenterPage.portalVisible(portalName);
    });
  }

  /**
   * Wait for portal synchronization (3 minutes)
   * BUSINESS REQUIREMENT: Portal sync is an external system integration that takes 3 minutes.
   * This is not a UI waiting issue and cannot be replaced with component expectations.
   */
  async waitForPortalSync() {
    await this.base.logger.section('Wait 3 minutes for portal synchronization', async () => {
      this.base.logger.info('Portal sync takes approximately 3 minutes...');
      await this.page.waitForTimeout(180000); // 3 minutes - external system sync
      this.base.logger.info('Portal sync wait complete');
    });
  }

  /**
   * Open external career portal and verify job
   */
  async verifyJobOnPortal(
    context: BrowserContext,
    portalName: string,
    testData: {
      jobTitle: string;
      overview: string;
      responsibilities: string;
      qualifications: string;
    }
  ) {
    await this.base.logger.section('Verify job on career portal', async () => {
      // Listen for new tab
      const portalPagePromise = context.waitForEvent('page');
      
      // Click portal name to open external site
      await this.postingCenterPage.externalBtn.click();
      
      // Wait for portal page to load
      const portalPage = await portalPagePromise;
      await portalPage.waitForLoadState('domcontentloaded');
      
      // Create portal page object
      const careerPortal = new CareerPortalPage(portalPage);
      
      // Search for the job
      await careerPortal.searchForJob(testData.jobTitle);
      
      // Open job details
      await careerPortal.openJobDetails(testData.jobTitle);
      
      // Verify job content
      await careerPortal.verifyJobTitle(testData.jobTitle);
      await careerPortal.verifyJobContent('Overview', testData.overview);
      await careerPortal.verifyJobContent('Responsibilities', testData.responsibilities);
      await careerPortal.verifyJobContent('Qualifications', testData.qualifications);
      await careerPortal.verifyJobIdDisplayed();
      await careerPortal.verifyApplyButtonVisible();
      
      // Close portal tab
      await portalPage.close();
    });
  }

  /**
   * Unpost job from career portal
   */
  async unpostJob(portalName: string) {
    await this.base.logger.section(`Unpost job from ${portalName} portal`, async () => {
      // Select the posting
      await this.postingCenterPage.selectFirstPosting(portalName);
      
      // Cancel post (unpost)
      await this.postingCenterPage.cancelPost();
      
      // Verify unpost toast
      const toastLoc = this.postingCenterPage.leftFrame.getByText('Your post(s) have been canceled');
      await toastLoc.waitFor({ state: 'visible', timeout: 5000 });
      
      // Verify status changed to Unposted
      await this.postingCenterPage.statusVisible('Unposted');
    });
  }

  /**
   * Verify job removed from career portal (shows error)
   */
  async verifyJobRemovedFromPortal(context: BrowserContext, portalName: string) {
    await this.base.logger.section('Verify job removed from career portal', async () => {
      // Listen for new tab
      const portalPagePromise = context.waitForEvent('page');
      
      // Click portal name to open external site
      await this.postingCenterPage.externalBtn.click();
      
      // Wait for portal page to load
      const portalPage = await portalPagePromise;
      await portalPage.waitForLoadState('domcontentloaded');
      
      // Create portal page object
      const careerPortal = new CareerPortalPage(portalPage);
      
      // Verify error message appears
      await careerPortal.verifyJobNotFound();
      
      // Close portal tab
      await portalPage.close();
    });
  }
}

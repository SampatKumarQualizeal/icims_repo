import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';
import { Link } from '@src/components/link.component';
import { Label } from '@src/components/label.component';

/**
 * CareerPortalPage
 * Represents the external career portal (careers-testXXX.icims.com)
 * where jobs are posted and searchable by candidates
 * 
 * Portal content is rendered inside: iframe[name="icims_content_iframe"]
 */
export class CareerPortalPage extends BasePage {
  private portalFrame: FrameLocator;
  
  readonly searchInput: Input;
  readonly searchBtn: Button;
  readonly jobListingsHeading: Label;
  readonly errorHeading: Label;
  readonly applyBtn: Button;

  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const portalFrame = page.frameLocator('iframe[name="icims_content_iframe"]');
    
    // STEP 2: Call super
    super(page, portalFrame.locator('body'), 'Career Portal Page');
    
    // STEP 3: Store frameLocator
    this.portalFrame = portalFrame;
    
    // STEP 4: Instantiate components
    this.searchInput = new Input(
      page,
      portalFrame.getByRole('textbox', { name: 'Start your job search here' }),
      'Job Search Input'
    );
    
    this.searchBtn = new Button(
      page,
      portalFrame.getByRole('button', { name: 'Search' }),
      'Search Button'
    );
    
    this.jobListingsHeading = new Label(
      page,
      portalFrame.getByRole('heading', { name: 'Job Listings', level: 1 }),
      'Job Listings Heading'
    );
    
    this.errorHeading = new Label(
      page,
      portalFrame.getByRole('heading', { name: 'Error: The requested job could not be found.', level: 1 }),
      'Error Heading'
    );
    
    this.applyBtn = new Button(
      page,
      portalFrame.getByRole('link', { name: /Apply for this job online/i }),
      'Apply for this job Button'
    );
  }

  /**
   * Search for a job by title on the career portal
   */
  async searchForJob(jobTitle: string) {
    await this.section(`Search for job: ${jobTitle}`, async () => {
      await this.searchInput.fill(jobTitle);
      await this.searchBtn.click();
      await this.jobListingsHeading.expectVisible();
    });
  }

  /**
   * Click on a job title link in search results
   */
  async openJobDetails(jobTitle: string) {
    await this.section(`Open job details: ${jobTitle}`, async () => {
      const jobLinkLoc = this.portalFrame.getByRole('link', { name: `Job Title ${jobTitle}` });
      const jobLink = new Link(this.page, jobLinkLoc, `Job Link: ${jobTitle}`);
      await jobLink.click();
    });
  }

  /**
   * Verify job field content (Overview, Responsibilities, Qualifications)
   * Checks both the section heading and the content
   */
  async verifyJobContent(field: string, expectedContent: string) {
    await this.section(`Verify ${field}: ${expectedContent}`, async () => {
      // Verify section heading exists
      const headingLoc = this.portalFrame.getByRole('heading', { name: field, level: 2 });
      const heading = new Label(this.page, headingLoc, `${field} Heading`);
      await heading.expectVisible();
      
      // Verify content text exists
      const contentLoc = this.root.locator(`text=${expectedContent}`);
      const contentLabel = new Label(this.page, contentLoc, `${field} Content`);
      await contentLabel.expectVisible();
    });
  }

  /**
   * Verify Job ID is displayed on the portal
   */
  async verifyJobIdDisplayed() {
    await this.section('Verify Job ID displayed', async () => {
      const jobIdLoc = this.root.locator('text=Job ID');
      const jobIdLabel = new Label(this.page, jobIdLoc, 'Job ID Label');
      await jobIdLabel.expectVisible();
    });
  }

  /**
   * Verify job title on job details page
   */
  async verifyJobTitle(jobTitle: string) {
    await this.section(`Verify job title: ${jobTitle}`, async () => {
      const titleLoc = this.portalFrame.getByRole('heading', { name: jobTitle, level: 1 });
      const titleLabel = new Label(this.page, titleLoc, 'Job Title Heading');
      await titleLabel.expectVisible();
    });
  }

  /**
   * Verify error message appears when job is not found (unposted)
   */
  async verifyJobNotFound() {
    await this.section('Verify job not found error', async () => {
      await this.errorHeading.expectVisible();
      
      const errorMsgLoc = this.root.locator('text=Error: The job that you were looking for either does not exist or is no longer open.');
      const errorMsg = new Label(this.page, errorMsgLoc, 'Error Message');
      await errorMsg.expectVisible();
    });
  }

  /**
   * Verify apply button is present
   */
  async verifyApplyButtonVisible() {
    await this.section('Verify Apply button visible', async () => {
      await this.applyBtn.expectVisible();
    });
  }

  /**
   * Click apply button to start application
   */
  async clickApply() {
    await this.section('Click Apply button', async () => {
      await this.applyBtn.click();
    });
  }
}

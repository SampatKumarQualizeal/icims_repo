import { Page } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Label } from '@src/components/label.component';
import { Link } from '@src/components/link.component';

/**
 * MultibrandCMSPage
 * Represents the CMS-hosted multibrand career site
 * URL Pattern: https://{customer}-{multibrand}.staging.cms.talentplatform.us/en-US/
 * 
 * Features:
 * - Header banner with navigation
 * - Body content with heading
 * - Footer with copyright
 * 
 * NO IFRAMES - Direct page context
 */
export class MultibrandCMSPage extends BasePage {
  readonly headerBanner: Label;
  readonly nav1Link: Link;
  readonly nav2Link: Link;
  readonly mainHeading: Label;
  readonly footerSection: Label;
  readonly footerCopyright: Label;

  constructor(page: Page) {
    // STEP 1: NO iframe for CMS site - direct page context
    // STEP 2: Call super with body locator
    super(page, page.locator('body'), 'Multibrand CMS Page');
    
    // STEP 3: No frameLocator needed (direct page)
    
    // STEP 4: Instantiate components
    this.headerBanner = new Label(
      page,
      page.locator('banner'),
      'Header Banner'
    );
    
    this.nav1Link = new Link(
      page,
      page.getByRole('link', { name: 'nav1' }),
      'Nav1 Link'
    );
    
    this.nav2Link = new Link(
      page,
      page.getByRole('link', { name: 'nav2' }),
      'Nav2 Link'
    );
    
    this.mainHeading = new Label(
      page,
      page.getByRole('heading', { name: /This is the mabl test site multibrand section/ }),
      'Main Heading'
    );
    
    this.footerSection = new Label(
      page,
      page.locator('contentinfo'),
      'Footer Section'
    );
    
    this.footerCopyright = new Label(
      page,
      page.getByText('Footer Copyright | ICIMS.'),
      'Footer Copyright'
    );
  }

  /**
   * Navigate to CMS multibrand home page
   */
  async navigateTo(cmsHost: string) {
    await this.section(`Navigate to CMS site: ${cmsHost}`, async () => {
      await this.page.goto(`https://${cmsHost}/en-US/`);
      await this.page.waitForLoadState('networkidle');
    });
  }

  /**
   * Verify CMS page is loaded with all components
   */
  async verifyPageLoaded() {
    await this.section('Verify CMS page loaded', async () => {
      await this.headerBanner.expectVisible();
      await this.nav1Link.expectVisible();
      await this.nav2Link.expectVisible();
      await this.mainHeading.expectVisible();
      await this.footerSection.expectVisible();
      await this.footerCopyright.expectVisible();
    });
  }

  /**
   * Verify page title matches expected
   */
  async verifyPageTitle(expectedTitle: string) {
    await this.section(`Verify page title: ${expectedTitle}`, async () => {
      const actualTitle = await this.page.title();
      if (actualTitle !== expectedTitle) {
        throw new Error(`Page title mismatch. Expected: "${expectedTitle}", Actual: "${actualTitle}"`);
      }
      this.logger.info(`✓ Page title: ${actualTitle}`);
    });
  }
}

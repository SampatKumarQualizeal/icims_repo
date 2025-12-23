import { Page } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Label } from '@src/components/label.component';
import { Link } from '@src/components/link.component';

/**
 * MultibrandHomePage
 * Represents the multibrand career site home page on main domain
 * URL Pattern: https://{domain}/{multibrand}/
 * 
 * Features:
 * - Language selector
 * - Header banner with navigation
 * - Body content with heading
 * - Footer with copyright
 * 
 * NO IFRAMES - Direct page context
 */
export class MultibrandHomePage extends BasePage {
  readonly languageBtn: Button;
  readonly headerBanner: Label;
  readonly nav1Link: Link;
  readonly nav2Link: Link;
  readonly mainHeading: Label;
  readonly footerSection: Label;
  readonly footerCopyright: Label;

  constructor(page: Page) {
    // STEP 1: NO iframe - direct page context
    // STEP 2: Call super with body locator
    super(page, page.locator('body'), 'Multibrand Home Page');
    
    // STEP 3: No frameLocator needed (direct page)
    
    // STEP 4: Instantiate components
    this.languageBtn = new Button(
      page,
      page.getByRole('button', { name: /language .* arrow_drop_down/ }),
      'Language Button'
    );
    
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
   * Navigate to multibrand home page on main domain
   */
  async navigateTo(domain: string, multibrandName: string) {
    await this.section(`Navigate to multibrand home: ${multibrandName}`, async () => {
      await this.page.goto(`https://${domain}/${multibrandName}/`);
      await this.page.waitForLoadState('networkidle');
    });
  }

  /**
   * Verify home page is loaded with all components
   */
  async verifyPageLoaded() {
    await this.section('Verify home page loaded', async () => {
      await this.languageBtn.expectVisible();
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

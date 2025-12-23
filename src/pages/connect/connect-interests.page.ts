// src/pages/connect/connect-interests.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Checkbox } from '@src/components/checkbox.component';
import { Link } from '@src/components/link.component';
import { Div } from '@src/components/div.component';

/**
 * ConnectInterestsPage
 * Connect Portal talent pool selection page
 */
export class ConnectInterestsPage extends BasePage {
  protected frameLocator?: FrameLocator;
  readonly heading: Div;
  readonly continueBtn: Button;
  readonly backLink: Link;

  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const contentFrame = page.frameLocator('iframe[name="icims_content_iframe"]');
    
    // STEP 2: Call super
    super(page, contentFrame.locator('body'), 'Connect Interests Page');
    
    // STEP 3: Store frameLocator
    this.frameLocator = contentFrame;
    
    // STEP 4: Instantiate components
    this.heading = new Div(
      page,
      contentFrame.getByRole('heading', { name: 'What are you interested in?', level: 1 }),
      'Interests Heading'
    );
    
    this.continueBtn = new Button(
      page,
      contentFrame.getByRole('button', { name: 'Continue' }),
      'Continue Button'
    );
    
    this.backLink = new Link(
      page,
      contentFrame.getByRole('link', { name: 'Back', exact: true }),
      'Back Button'
    );
  }

  async expectLoaded() {
    await this.section('Connect Interests Page - verify loaded', async () => {
      await this.heading.expectVisible();
      await this.continueBtn.expectVisible();
      await this.backLink.expectVisible();
    });
  }

  async verifyTalentPoolOption(poolName: string) {
    await this.section(`Verify talent pool option: ${poolName}`, async () => {
      const checkbox = new Checkbox(
        this.page,
        this.frameLocator!.getByRole('checkbox', { name: poolName }),
        `Talent Pool: ${poolName}`
      );
      await checkbox.expectVisible();
    });
  }

  async selectTalentPool(poolName: string) {
    await this.section(`Select talent pool: ${poolName}`, async () => {
      const checkbox = new Checkbox(
        this.page,
        this.frameLocator!.getByRole('checkbox', { name: poolName }),
        `Talent Pool: ${poolName}`
      );
      await checkbox.check();
    });
  }

  async verifyTalentPoolChecked(poolName: string) {
    await this.section(`Verify talent pool checked: ${poolName}`, async () => {
      const checkbox = new Checkbox(
        this.page,
        this.frameLocator!.getByRole('checkbox', { name: poolName }),
        `Talent Pool: ${poolName}`
      );
      await checkbox.locator.waitFor({ state: 'visible' });
      const isChecked = await checkbox.locator.isChecked();
      if (!isChecked) {
        throw new Error(`Expected checkbox ${poolName} to be checked`);
      }
    });
  }

  async clickContinue() {
    await this.section('Click Continue to next page', async () => {
      await this.continueBtn.click();
      await this.page.waitForLoadState('networkidle');
    });
  }
}

// src/pages/ats/iform-maintenance.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Link } from '@src/components/link.component';
import { Input } from '@src/components/input.component';

/**
 * IFormMaintenancePage
 * Maintenance tab of iForm editor - enable/disable iForm and manage settings
 */
export class IFormPersonSearchPage extends BasePage {
  readonly keywordInput: Input;
  readonly searchBtn: Button;
  

  constructor(page: Page) {
    // STEP 1: Resolve nested iframes (3 levels for iForms)
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    ;
    
    // STEP 2: Call super
    super(page, mainFrame.locator('body'), 'iForm Person Search Page');
    
    // STEP 3: Store frameLocator
    this.frameLocator = mainFrame;
    this.keywordInput = new Input(
      page,
      mainFrame.getByRole('textbox', { name: 'Enter any keywords or skills...' }),
      'Keyword Input TextBox'
    );
    this.searchBtn = new Button(
      page,
      mainFrame.locator('#searchSubmitButton_anchor'),
      'Search Button'
    );
    
  }

  async expectLoaded() {
    await this.section('iForm Maintenance - verify loaded', async () => {
      await this.keywordInput.expectVisible();
    });
  }
  async enterKeywords(keywords: string) {
    await this.section(`Enter keywords: ${keywords}`, async () => {
      await this.keywordInput.click();
      await this.keywordInput.fill(keywords);
    });
  }
  async clickSearch() {
    await this.section('Click Search Button', async () => {
      await this.page.waitForTimeout(1000);
      await this.searchBtn.click();
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(2000);
    });
  }
  async clickLinkByName(linkName: string) {
    await this.section(`Click link with name: ${linkName}`, async () => {
    const linkLocator = this.frameLocator!.getByRole('link', { name: linkName });
    const link = new Link(this.page, linkLocator, `Link with name "${linkName}"`);
    await link.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
  });
  }
  
}

// src/pages/ats/iform-maintenance.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Link } from '@src/components/link.component';
import { Div } from '@src/components/div.component';

/**
 * IFormMaintenancePage
 * Maintenance tab of iForm editor - enable/disable iForm and manage settings
 */
export class IFormMaintenancePage extends BasePage {
  readonly enableBtn: Button;
  readonly disableBtn: Button;
  readonly deleteBtn: Button;
  readonly viewsTab: Link;
  readonly questionsTab: Link;
  readonly statusText: Div;

  constructor(page: Page) {
    // STEP 1: Resolve nested iframes (3 levels for iForms)
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    // STEP 2: Call super
    super(page, mainFrame.locator('body'), 'iForm Maintenance Page');
    
    // STEP 3: Store frameLocator
    this.frameLocator = mainFrame;
    
    // STEP 4: Instantiate components
    this.enableBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: 'Enable iForm' }),
      'Enable iForm Button'
    );
    
    this.disableBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: 'Disable iForm' }),
      'Disable iForm Button'
    );
    
    this.deleteBtn = new Button(
      page,
      mainFrame.getByRole('button', { name: 'Delete iForm' }),
      'Delete iForm Button'
    );
    
    this.viewsTab = new Link(
      page,
      mainFrame.getByRole('link', { name: 'Views' }),
      'Views Tab'
    );
    
    this.questionsTab = new Link(
      page,
      mainFrame.getByRole('link', { name: 'Questions' }),
      'Questions Tab'
    );
    
    this.statusText = new Div(
     page,
     mainFrame.locator('span.enabled-disabled:visible'),
    'iForm Status Text'
   );
  }

  async expectLoaded() {
    await this.section('iForm Maintenance - verify loaded', async () => {
      await this.statusText.expectVisible();
    });
  }

  async verifyStatus(expectedStatus: 'enabled' | 'disabled') {
    await this.section(`Verify iForm status: ${expectedStatus}`, async () => {
      const text = await this.statusText.getText();
      if (!text.toLowerCase().includes(expectedStatus)) {
        throw new Error(`Expected status "${expectedStatus}" but got "${text}"`);
      }
    });
  }

  async enableIForm() {
    await this.section('Enable iForm', async () => {
      await this.page.waitForTimeout(3000);
      await this.enableBtn.click();
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForTimeout(2000);
    });
  }

  async disableIForm() {
    await this.section('Disable iForm', async () => {
      await this.disableBtn.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async deleteIForm() {
    await this.section('Delete iForm', async () => {
      // Set up dialog handler before clicking delete
      this.page.once('dialog', async dialog => {
        await dialog.accept();
      });
      
      await this.deleteBtn.click();
      await this.page.waitForTimeout(3000);
    });
  }

  async verifyDeleted() {
    await this.section('Verify iForm was deleted', async () => {
      const deletionMsg = new Div(
        this.page,
        this.frameLocator!.locator('text=The specified iForm does not exist'),
        'Deletion Message'
      );
      
      await deletionMsg.expectVisible();
    });
  }

  async navigateToViews() {
    await this.section('Navigate to Views tab', async () => {
      await this.viewsTab.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async navigateToQuestions() {
    await this.section('Navigate to Questions tab', async () => {
      await this.questionsTab.click();
      await this.page.waitForLoadState('networkidle');
    });
  }
}

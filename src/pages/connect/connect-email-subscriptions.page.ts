// src/pages/connect/connect-email-subscriptions.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Checkbox } from '@src/components/checkbox.component';
import { Div } from '@src/components/div.component';

/**
 * ConnectEmailSubscriptionsPage
 * Connect Portal email subscriptions management page
 */
export class ConnectEmailSubscriptionsPage extends BasePage {
  protected frameLocator?: FrameLocator;
  readonly heading: Div;
  readonly saveBtn: Button;
  readonly unsubscribeAllCheckbox: Checkbox;

  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const contentFrame = page.frameLocator('iframe[name="icims_content_iframe"]');
    
    // STEP 2: Call super
    super(page, contentFrame.locator('body'), 'Connect Email Subscriptions Page');
    
    // STEP 3: Store frameLocator
    this.frameLocator = contentFrame;
    
    // STEP 4: Instantiate components
    this.heading = new Div(
      page,
      contentFrame.getByRole('heading', { name: /Email Subscriptions/i, level: 1 }),
      'Email Subscriptions Heading'
    );
    
    this.saveBtn = new Button(
      page,
      contentFrame.getByRole('button', { name: 'Save' }),
      'Save Button'
    );
    
    this.unsubscribeAllCheckbox = new Checkbox(
      page,
      contentFrame.getByRole('checkbox', { name: /Unsubscribe.*All/i }),
      'Unsubscribe All Checkbox'
    );
  }

  async expectLoaded() {
    await this.section('Connect Email Subscriptions Page - verify loaded', async () => {
      await this.heading.expectVisible();
      await this.saveBtn.expectVisible();
    });
  }

  async verifyTalentPoolSubscription(poolName: string) {
    await this.section(`Verify talent pool subscription option: ${poolName}`, async () => {
      const checkbox = new Checkbox(
        this.page,
        this.frameLocator!.getByRole('checkbox', { name: poolName }),
        `Talent Pool: ${poolName}`
      );
      await checkbox.expectVisible();
    });
  }

  async verifyTalentPoolChecked(poolName: string) {
    await this.section(`Verify talent pool ${poolName} is subscribed`, async () => {
      const checkbox = new Checkbox(
        this.page,
        this.frameLocator!.getByRole('checkbox', { name: poolName }),
        `Talent Pool: ${poolName}`
      );
      await checkbox.locator.waitFor({ state: 'visible' });
      const isChecked = await checkbox.locator.isChecked();
      if (!isChecked) {
        throw new Error(`Expected talent pool ${poolName} to be checked`);
      }
    });
  }

  async toggleTalentPoolSubscription(poolName: string, subscribe: boolean) {
    await this.section(`${subscribe ? 'Subscribe to' : 'Unsubscribe from'} talent pool: ${poolName}`, async () => {
      const checkbox = new Checkbox(
        this.page,
        this.frameLocator!.getByRole('checkbox', { name: poolName }),
        `Talent Pool: ${poolName}`
      );
      
      if (subscribe) {
        await checkbox.check();
      } else {
        await checkbox.uncheck();
      }
    });
  }

  async unsubscribeAll() {
    await this.section('Unsubscribe from all email subscriptions', async () => {
      await this.unsubscribeAllCheckbox.check();
    });
  }

  async clickSave() {
    await this.section('Save email subscription preferences', async () => {
      await this.saveBtn.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async verifySuccessMessage() {
    await this.section('Verify success message displayed', async () => {
      const successMessage = new Div(
        this.page,
        this.frameLocator!.locator('[data-testid="success-message"]'),
        'Success Message'
      );
      await successMessage.expectVisible();
    });
  }
}

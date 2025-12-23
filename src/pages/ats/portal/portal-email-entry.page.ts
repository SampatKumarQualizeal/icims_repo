// src/pages/ats/portal/portal-email-entry.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';

/**
 * PortalEmailEntryPage
 * First page of portal application where user enters email
 * Renders inside: iframe[name="icims_content_iframe"]
 */
export class PortalEmailEntryPage extends BasePage {
  private contentFrame: FrameLocator;
  
  readonly emailInput: Input;
  readonly nextBtn: Button;

  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const contentFrame = page.frameLocator('iframe[name="icims_content_iframe"]');
    
    // STEP 2: Call super
    super(page, contentFrame.locator('body'), 'Portal Email Entry Page');
    
    // STEP 3: Store frameLocator
    this.contentFrame = contentFrame;
    
    // STEP 4: Instantiate components
    this.emailInput = new Input(
      page,
      contentFrame.getByLabel('Email *'),
      'Email Input'
    );
    
    this.nextBtn = new Button(
      page,
      contentFrame.getByRole('button', { name: 'Next' }),
      'Next Button'
    );
  }

  async fillEmail(email: string) {
    await this.section('Fill email address', async () => {
      await this.emailInput.fill(email);
    });
  }

  async clickNext() {
    await this.section('Click Next button', async () => {
      await this.nextBtn.click();
    });
  }
}

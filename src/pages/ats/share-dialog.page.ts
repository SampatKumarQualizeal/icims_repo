// src/pages/ats/share-dialog.page.ts
import { Page } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';

/**
 * ShareDialogPage
 * Share candidate profile dialog
 * Opens in new tab when Share button is clicked from workflow profiles
 */
export class ShareDialogPage extends BasePage {
  readonly toInput: Input;
  readonly subjectInput: Input;
  readonly messageInput: Input;
  readonly sendBtn: Button;
  readonly cancelBtn: Button;

  constructor(page: Page) {
    // STEP 1: Share dialog is on main page
    super(page, page.locator('body'), 'Share Dialog Page');

    // STEP 4: Instantiate components
    this.toInput = new Input(page,
      page.getByRole('combobox', { name: 'to' }),
      'To Input'
    );

    this.subjectInput = new Input(page,
      page.getByRole('textbox', { name: 'Subject' }),
      'Subject Input'
    );

    this.messageInput = new Input(page,
      page.frameLocator('iframe[title="Press ALT-F10 for toolbar. Press ALT-0 for help"]')
        .getByRole('paragraph')
        .nth(3),
      'Message Input'
    );

    this.sendBtn = new Button(page,
      page.getByRole('button', { name: 'Send' }),
      'Send Button'
    );

    this.cancelBtn = new Button(page,
      page.getByRole('button', { name: 'Cancel' }),
      'Cancel Button'
    );
  }

  async expectLoaded() {
    await this.section('Share Dialog - verify loaded', async () => {
      await this.toInput.expectVisible();
      await this.subjectInput.expectVisible();
    });
  }

  async fillTo(recipient: string) {
    await this.section(`Fill To: ${recipient}`, async () => {
      await this.toInput.fill(recipient);
      // Wait for the dropdown to appear
      const suggestions = this.page.locator('//div[contains(@class,"tt-menu tt-open")]/descendant::div[contains(@title,"' + recipient + '")]');
      await suggestions.first().waitFor({ state: 'visible' });
      // Or click the second suggestion
      await suggestions.nth(1).click();

    });
  }

  async fillSubject(subject: string) {
    await this.section(`Fill subject: ${subject}`, async () => {
      await this.subjectInput.fill(subject);
    });
  }

  async fillMessage(message: string) {
    await this.section('Fill message', async () => {
      await this.messageInput.fill(message);
    });
  }

  async send() {
    await this.section('Send share', async () => {
      await this.sendBtn.click();
      // Share tab should close automatically
    });
  }

  async cancel() {
    await this.section('Cancel share', async () => {
      await this.cancelBtn.click();
    });
  }
}

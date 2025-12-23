// src/pages/ats/compose-email.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';
import { Div } from '@src/components/div.component';

/**
 * ComposeEmailPage
 * Email composition dialog for sending emails to candidates/persons
 * Opens in new tab when triggered from workflow profiles
 */
export class ComposeEmailPage extends BasePage {
  readonly subjectInput: Input;
  readonly sendBtn: Button;
  readonly cancelBtn: Button;
  private editorFrame: FrameLocator;
  private editorBody: Input;

  constructor(page: Page) {
    // STEP 1: Email composer is on main page (not in iframe)
    super(page, page.locator('body'), 'Compose Email Page');

    // STEP 3: TinyMCE editor iframe for email body
    this.editorFrame = page.frameLocator('iframe[title*="Press ALT-F10"]');
    this.editorBody = new Input(page, this.editorFrame.getByRole('paragraph'), 'Email Body Editor');

    // STEP 4: Instantiate components
    this.subjectInput = new Input(page,
      page.getByRole('textbox', { name: 'Subject' }),
      'Subject Input'
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
    await this.section('Compose Email - verify loaded', async () => {
      await this.subjectInput.expectVisible();
      await this.sendBtn.expectVisible();
    });
  }

  async fillSubject(subject: string) {
    await this.section(`Fill email subject: ${subject}`, async () => {
      await this.subjectInput.fill(subject);
    });
  }

  async fillBody(body: string) {
    await this.section('Fill email body', async () => {
      await this.editorBody.click();
      await this.editorBody.fill(body);
    });
  }

  async send() {
    await this.section('Send email', async () => {
      await this.sendBtn.click();
      // Email tab should close automatically after sending
    });
  }

  async cancel() {
    await this.section('Cancel email', async () => {
      await this.cancelBtn.click();
    });
  }

  async verifyRecipient(candidateName: string) {
    await this.section(`Verify recipient: ${candidateName}`, async () => {
      // Dynamic locator based on parameter - acceptable exception
      const recipientText = new Div(
        this.page,
        this.page.getByText(new RegExp(candidateName, 'i')).nth(0),
        `Recipient: ${candidateName}`
      );
      await recipientText.expectVisible();
    });
  }
}

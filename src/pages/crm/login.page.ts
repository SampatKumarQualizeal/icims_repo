import { Page, Locator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';
import { Div } from '@src/components/div.component';

export class CrmLoginPage extends BasePage {
  readonly useEmailLink: Button;
  readonly emailInput: Input;
  readonly passwordInput: Input;
  readonly loginBtn: Button;
  readonly loadingSpinner: Div;

  constructor(page: Page) {
    super(page, page.locator('body'), 'CRM Login Page');

    const useEmailLinkLoc: Locator = this.resolveLocator('a:has-text("Use Email and Password")');
    const emailInputLoc: Locator = page.getByLabel('Email');
    const passwordInputLoc: Locator = page.getByLabel('Password');
    const loginBtnLoc: Locator = page.locator("//button[@name='login']");
    const spinnerLoc: Locator = page.locator("//div[@class='initial-loading-prompt']");

    this.useEmailLink = new Button(page, useEmailLinkLoc, 'Use Email and Password Link');
    this.emailInput = new Input(page, emailInputLoc, 'Email Input');
    this.passwordInput = new Input(page, passwordInputLoc, 'Password Input');
    this.loginBtn = new Button(page, loginBtnLoc, 'Login Button');
    this.loadingSpinner = new Div(page, spinnerLoc, "Loading Spinner");
  }

  async expectLoaded(timeout = 8000) {
    await this.section('CRM Login Page - expect loaded', async () => {
      await this.loadingSpinner.waitForDisappear(60000);
      await this.useEmailLink.expectVisible(timeout);
    });
  }
}

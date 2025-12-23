// src/pages/ats/login.page.ts
import { Page } from '@playwright/test';
import { Input } from '@src/components/input.component';
import { Button } from '@src/components/button.component';
import { BasePage } from '@src/pages/base.page';
import { Link } from '@src/components/link.component';

export class LoginPage extends BasePage {
  readonly username: Input;
  readonly continueBtn: Button;
  readonly password: Input;
  readonly submit: Button;
  readonly skipForNow: Link;

  constructor(page: Page) {
    super(page, page.locator('form#login'), 'Login Page');

    this.username = new Input(page, page.getByRole('textbox', { name: /username/i }), 'Username');
    this.continueBtn = new Button(page, page.getByRole('button', { name: /continue/i }), 'Continue');
    this.password = new Input(page, page.getByRole('textbox', { name: /password/i }), 'Password');
    this.submit = new Button(page, page.getByRole('button', { name: /log in/i }), 'Login Button');
    this.skipForNow = new Link(page, page.getByTestId('loginPromptsSkipButton'), 'Skip For Now');
  }

  async expectLoaded() {
    await this.username.expectVisible(8000);
  }

  async performLogin(username: string, password: string) {
    await this.username.fill(username);
    await this.continueBtn.click();

    await this.password.fill(password);
    await this.submit.click();

    // Optional skip prompt
    if (await this.skipForNow.isVisible(1000).catch(() => false)) {
      await this.skipForNow.click();
    }
  }
}

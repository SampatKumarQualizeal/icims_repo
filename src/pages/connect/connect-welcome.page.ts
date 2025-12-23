// src/pages/connect/connect-welcome.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Input } from '@src/components/input.component';
import { Link } from '@src/components/link.component';
import { Div } from '@src/components/div.component';

/**
 * ConnectWelcomePage
 * Connect Portal welcome page with email signup and social login
 */
export class ConnectWelcomePage extends BasePage {
  protected frameLocator?: FrameLocator;
  readonly emailInput: Input;
  readonly signUpBtn: Button;
  readonly loginLink: Link;
  readonly facebookBtn: Button;
  readonly googleBtn: Button;
  readonly linkedInBtn: Button;
  readonly connectHeading: Div;
  readonly interestsStep: Div;
  readonly resumeStep: Div;
  readonly profileStep: Div;

  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const contentFrame = page.frameLocator('iframe[name="icims_content_iframe"]');
    
    // STEP 2: Call super
    super(page, contentFrame.locator('body'), 'Connect Welcome Page');
    
    // STEP 3: Store frameLocator
    this.frameLocator = contentFrame;
    
    // STEP 4: Instantiate components
    this.emailInput = new Input(
      page,
      contentFrame.getByRole('textbox', { name: 'Sign up with your email and' }),
      'Email Signup Input'
    );
    
    this.signUpBtn = new Button(
      page,
      contentFrame.getByRole('button', { name: 'Sign Up' }),
      'Sign Up Button'
    );
    
    this.loginLink = new Link(
      page,
      contentFrame.getByRole('link', { name: 'Log in.' }),
      'Login Link'
    );
    
    this.facebookBtn = new Button(
      page,
      contentFrame.getByRole('button', { name: 'facebook' }),
      'Facebook Login Button'
    );
    
    this.googleBtn = new Button(
      page,
      contentFrame.getByRole('button', { name: 'google-plus' }),
      'Google Login Button'
    );
    
    this.linkedInBtn = new Button(
      page,
      contentFrame.getByRole('button', { name: 'linked-in' }),
      'LinkedIn Login Button'
    );
    
    this.connectHeading = new Div(
      page,
      contentFrame.getByRole('heading', { name: 'Connect', level: 1 }),
      'Connect Heading'
    );
    
    this.interestsStep = new Div(
      page,
      contentFrame.getByText('Interests').first(),
      'Interests Step'
    );
    
    this.resumeStep = new Div(
      page,
      contentFrame.getByText('Resume').first(),
      'Resume Step'
    );
    
    this.profileStep = new Div(
      page,
      contentFrame.getByText('Profile').first(),
      'Profile Step'
    );
  }

  async navigateTo(baseUrl: string) {
    await this.section('Navigate to Connect Portal', async () => {
      await this.page.goto(`${baseUrl}/connect`);
      await this.page.waitForLoadState('networkidle');
    });
  }

  async expectLoaded() {
    await this.section('Connect Welcome Page - verify loaded', async () => {
      await this.connectHeading.expectVisible();
      await this.emailInput.expectVisible();
      await this.signUpBtn.expectVisible();
    });
  }

  async verifyProgressStepper() {
    await this.section('Verify progress stepper visible', async () => {
      await this.connectHeading.expectVisible();
      await this.interestsStep.expectVisible();
      await this.resumeStep.expectVisible();
      await this.profileStep.expectVisible();
    });
  }

  async verifySocialLoginOptions() {
    await this.section('Verify social login buttons visible', async () => {
      await this.facebookBtn.expectVisible();
      await this.googleBtn.expectVisible();
      await this.linkedInBtn.expectVisible();
    });
  }

  async signUpWithEmail(email: string) {
    await this.section(`Sign up with email: ${email}`, async () => {
      await this.emailInput.fill(email);
      await this.signUpBtn.click();
      await this.page.waitForLoadState('networkidle');
    });
  }
}

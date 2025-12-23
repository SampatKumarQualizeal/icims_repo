// src/pages/connect/connect-resume.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Link } from '@src/components/link.component';
import { Div } from '@src/components/div.component';

/**
 * ConnectResumePage
 * Connect Portal resume upload page
 */
export class ConnectResumePage extends BasePage {
  protected frameLocator?: FrameLocator;
  readonly heading: Div;
  readonly myComputerBtn: Button;
  readonly googleDriveBtn: Button;
  readonly dropboxBtn: Button;
  readonly oneDriveBtn: Button;
  readonly skipLink: Link;
  readonly backLink: Link;

  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const contentFrame = page.frameLocator('iframe[name="icims_content_iframe"]');
    
    // STEP 2: Call super
    super(page, contentFrame.locator('body'), 'Connect Resume Page');
    
    // STEP 3: Store frameLocator
    this.frameLocator = contentFrame;
    
    // STEP 4: Instantiate components
    this.heading = new Div(
      page,
      contentFrame.getByRole('heading', { name: 'Resume', level: 1 }),
      'Resume Heading'
    );
    
    this.myComputerBtn = new Button(
      page,
      contentFrame.getByText('My Computer (Opens new window)My Computer'),
      'My Computer Button'
    );
    
    this.googleDriveBtn = new Button(
      page,
      contentFrame.getByText('Google Drive (Opens new window) Google Drive'),
      'Google Drive Button'
    );
    
    this.dropboxBtn = new Button(
      page,
      contentFrame.getByText('Dropbox (Opens new window)Dropbox'),
      'Dropbox Button'
    );
    
    this.oneDriveBtn = new Button(
      page,
      contentFrame.getByText('OneDrive (Opens new window)OneDrive'),
      'OneDrive Button'
    );
    
    this.skipLink = new Link(
      page,
      contentFrame.getByRole('link', { name: 'Skip', exact: true }),
      'Skip Link'
    );
    
    this.backLink = new Link(
      page,
      contentFrame.getByRole('link', { name: 'Back', exact: true }),
      'Back Link'
    );
  }

  async expectLoaded() {
    await this.section('Connect Resume Page - verify loaded', async () => {
      await this.heading.expectVisible();
      await this.myComputerBtn.expectVisible();
      await this.skipLink.expectVisible();
      await this.backLink.expectVisible();
    });
  }

  async verifyCloudStorageOptions() {
    await this.section('Verify cloud storage options', async () => {
      await this.googleDriveBtn.expectVisible();
      await this.dropboxBtn.expectVisible();
      await this.oneDriveBtn.expectVisible();
    });
  }

  async clickSkip() {
    await this.section('Skip resume upload', async () => {
      await this.skipLink.click();
      await this.page.waitForLoadState('networkidle');
    });
  }

  async uploadFromComputer(filePath: string) {
    await this.section(`Upload resume from computer: ${filePath}`, async () => {
      const fileChooserPromise = this.page.waitForEvent('filechooser');
      await this.myComputerBtn.click();
      const fileChooser = await fileChooserPromise;
      await fileChooser.setFiles(filePath);
      await this.page.waitForLoadState('networkidle');
    });
  }
}

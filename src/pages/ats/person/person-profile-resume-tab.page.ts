// src/pages/ats/person/person-profile-resume-tab.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Div } from '@src/components/div.component';

/**
 * PersonProfileResumeTabPage
 * Handles Resume tab verification in person profile
 * Structure: [data-testid="main-body-iframe"] → nested iframe → resume PDF iframe
 */
export class PersonProfileResumeTabPage extends BasePage {
  private mainFrame: FrameLocator;
  private resumeFrame: FrameLocator;
  
  readonly resumeTab: Button;

  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    const nestedFrame = mainFrame.locator('iframe').first().contentFrame();
    const resumeFrame = nestedFrame.locator('iframe').first().contentFrame();
    
    // STEP 2: Call super
    super(page, mainFrame.locator('body'), 'Person Profile Resume Tab');
    
    // STEP 3: Store frameLocators
    this.mainFrame = mainFrame;
    this.resumeFrame = resumeFrame;
    
    // STEP 4: Instantiate components
    this.resumeTab = new Button(
      page,
      mainFrame.getByRole('tab', { name: 'Resume' }),
      'Resume Tab'
    );
  }

  async clickResumeTab() {
    await this.section('Click Resume tab', async () => {
      await this.resumeTab.click();
    });
  }

  async verifyResumeContent(expectedText: string) {
    await this.section(`Verify resume contains: ${expectedText}`, async () => {
      const resumeText = new Div(
        this.page,
        this.resumeFrame.getByText(new RegExp(expectedText)),
        'Resume Content'
      );
      await resumeText.expectVisible();
    });
  }
}

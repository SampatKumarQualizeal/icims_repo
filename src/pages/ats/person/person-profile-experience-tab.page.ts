// src/pages/ats/person/person-profile-experience-tab.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Div } from '@src/components/div.component';

/**
 * PersonProfileExperienceTabPage
 * Handles Experience tab in person profile
 * Includes: Education, Skills, Employment, References
 * Structure: [data-testid="main-body-iframe"] → iframe
 * 
 * Note: This page is for basic navigation and checking data existence
 * Full editing support can be added as needed
 */
export class PersonProfileExperienceTabPage extends BasePage {
  private mainFrame: FrameLocator;
  private experienceFrame: FrameLocator;
  
  readonly experienceTab: Button;
  readonly editBtn: Button;
  readonly cancelBtn: Button;

  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    const experienceFrame = mainFrame.locator('iframe[name="target_frame_left"]').contentFrame();
    
    // STEP 2: Call super
    super(page, mainFrame.locator('body'), 'Person Profile Experience Tab');
    
    // STEP 3: Store frameLocators
    this.mainFrame = mainFrame;
    this.experienceFrame = experienceFrame;
    
    // STEP 4: Instantiate components
    this.experienceTab = new Button(
      page,
      mainFrame.getByRole('tab', { name: 'Experience' }),
      'Experience Tab'
    );
    
    this.editBtn = new Button(
      page,
      experienceFrame.getByRole('button', { name: 'Edit', exact: true }),
      'Edit Button'
    );
    
    this.cancelBtn = new Button(
      page,
      experienceFrame.getByRole('button', { name: 'Cancel', exact: true }),
      'Cancel Button'
    );
  }

  async clickExperienceTab() {
    await this.section('Click Experience tab', async () => {
      await this.experienceTab.click();
    });
  }

  async clickEdit() {
    await this.section('Click Edit button', async () => {
      await this.editBtn.click();
    });
  }

  async clickCancel() {
    await this.section('Click Cancel button', async () => {
      await this.cancelBtn.click();
    });
  }

  async hasExperienceData(): Promise<boolean> {
    let result = false;
    await this.section('Check if experience data exists', async () => {
      const noDataDiv = new Div(
        this.page,
        this.experienceFrame.getByText('No data exists.'),
        'No Data Message'
      );
      
      try {
        await noDataDiv.expectVisible();
        result = false;
      } catch {
        result = true;
      }
    });
    return result;
  }
}

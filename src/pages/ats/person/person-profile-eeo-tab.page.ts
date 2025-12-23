// src/pages/ats/person/person-profile-eeo-tab.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Div } from '@src/components/div.component';

/**
 * PersonProfileEEOTabPage
 * Handles EEO tab verification in person profile
 * Verifies: Gender, Race, Disability values
 * Structure: [data-testid="main-body-iframe"] → More menu → EEO menuitem → iframe
 */
export class PersonProfileEEOTabPage extends BasePage {
  private mainFrame: FrameLocator;
  private eeoFrame: FrameLocator;
  
  readonly moreTab: Button;
  readonly eeoMenuItem: Button;

  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    const eeoFrame = mainFrame.locator('iframe').first().contentFrame();
    
    // STEP 2: Call super
    super(page, mainFrame.locator('body'), 'Person Profile EEO Tab');
    
    // STEP 3: Store frameLocators
    this.mainFrame = mainFrame;
    this.eeoFrame = eeoFrame;
    
    // STEP 4: Instantiate components
    this.moreTab = new Button(
      page,
      mainFrame.getByRole('tab', { name: 'More' }),
      'More Tab'
    );
    
    this.eeoMenuItem = new Button(
      page,
      mainFrame.getByRole('menuitem', { name: 'EEO' }),
      'EEO Menu Item'
    );
  }

  async navigateToEEO() {
    await this.section('Navigate to EEO tab', async () => {
      await this.moreTab.click();
      await this.eeoMenuItem.click();
    });
  }

  async verifyGender(gender: string) {
    await this.section(`Verify Gender: ${gender}`, async () => {
      const genderLabel = new Div(
        this.page,
        this.eeoFrame.getByText('Gender'),
        'Gender Label'
      );
      await genderLabel.expectVisible();
      
      const genderValue = new Div(
        this.page,
        this.eeoFrame.getByText(gender),
        'Gender Value'
      );
      await genderValue.expectVisible();
    });
  }

  async verifyRace(race: string) {
    await this.section(`Verify Race: ${race}`, async () => {
      const raceLabel = new Div(
        this.page,
        this.eeoFrame.getByText('Race'),
        'Race Label'
      );
      await raceLabel.expectVisible();
      
      const raceValue = new Div(
        this.page,
        this.eeoFrame.getByText(race),
        'Race Value'
      );
      await raceValue.expectVisible();
    });
  }

  async verifyDisability(disability: string) {
    await this.section(`Verify Disability: ${disability}`, async () => {
      const disabilityLabel = new Div(
        this.page,
        this.eeoFrame.getByText(new RegExp('Disability', 'i')),
        'Disability Label'
      );
      await disabilityLabel.expectVisible();
      
      const disabilityValue = new Div(
        this.page,
        this.eeoFrame.getByText(disability),
        'Disability Value'
      );
      await disabilityValue.expectVisible();
    });
  }
}

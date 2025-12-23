// src/pages/common/navigation/people-menu.page.ts
import { Page, FrameLocator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';

/**
 * PeopleMenuPage
 * Represents the submenu shown under:
 * Navigator Menu → People
 * 
 * Options include:
 * - Add Person
 * - Other people-related actions
 */
export class PeopleMenuPage extends BasePage {
  private mainFrame: FrameLocator;
  
  readonly addPersonBtn: Button;

  constructor(page: Page) {
    // STEP 1: Resolve iframe context
    const mainFrame = page.frameLocator('[data-testid="main-body-iframe"]');
    
    // STEP 2: Call super
    super(page, mainFrame.locator('body'), 'People Menu Page');
    
    // STEP 3: Store frameLocator
    this.mainFrame = mainFrame;
    
    // STEP 4: Instantiate components
    this.addPersonBtn = new Button(
      page,
      mainFrame.getByText('Add Person'),
      'Add Person Button'
    );
  }

  async clickAddPerson() {
    await this.section('Click Add Person', async () => {
      await this.addPersonBtn.click();
    });
  }
}

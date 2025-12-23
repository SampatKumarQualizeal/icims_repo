// src/pages/common/person-quick-search.page.ts
import { Page } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Input } from '@src/components/input.component';
import { Div } from '@src/components/div.component';

/**
 * PersonQuickSearchPage
 * Handles quick search functionality for finding candidates/people
 * Quick search is on main page (no iframe)
 */
export class PersonQuickSearchPage extends BasePage {
  readonly quickSearchInput: Input;

  constructor(page: Page) {
    // STEP 1: No iframe - quick search on main page
    // STEP 2: Call super
    super(page, page.locator('body'), 'Person Quick Search');
    
    // STEP 3: Instantiate components
    this.quickSearchInput = new Input(
      page,
      page.getByRole('combobox', { name: 'Quick search' }),
      'Quick Search Input'
    );
  }

  async expectLoaded() {
    await this.section('Person Quick Search - verify loaded', async () => {
      await this.quickSearchInput.expectVisible();
    });
  }

  /**
   * Search for person by name and click on the result
   * @param firstName - Person's first name
   * @param lastName - Person's last name
   */
  async searchAndSelectPerson(firstName: string, lastName: string) {
    await this.section(`Quick search for person: ${firstName} ${lastName}`, async () => {
      // Click and fill search input
      await this.quickSearchInput.click();
      await this.quickSearchInput.fill(firstName);
      
      // Wait for search results to populate
      await this.page.waitForLoadState('networkidle');
      
      // Click on the person from search results
      const personOption = new Div(
        this.page,
        this.page.getByRole('option', { 
          name: new RegExp(`${firstName}.*${lastName}`, 'i') 
        }),
        `Person Result: ${firstName} ${lastName}`
      );
      
      await personOption.click();
      
      // Wait for profile to load
      await this.page.waitForLoadState('networkidle');
    });
  }

  /**
   * Verify person profile heading is displayed
   * @param firstName - Person's first name
   * @param lastName - Person's last name
   */
  async verifyPersonProfileDisplayed(firstName: string, lastName: string) {
    await this.section(`Verify person profile displayed: ${firstName} ${lastName}`, async () => {
      const profileHeading = new Div(
        this.page,
        this.page.getByRole('heading', { 
          name: new RegExp(`${firstName}.*${lastName}`, 'i') 
        }),
        `Profile Heading: ${firstName} ${lastName}`
      );
      
      await profileHeading.expectVisible();
    });
  }
}

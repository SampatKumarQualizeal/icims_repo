import { Page, Locator } from '@playwright/test';
import { Input } from '@src/components/input.component';
import { Button } from '@src/components/button.component';
import { BasePage } from '@src/pages/base.page';
import { Div } from '@src/components/div.component';

/**
 * QuickSearchPage
 * Handles opening Event → Job menu and performing quick searches.
 */
export class QuickSearchPage extends BasePage {

  readonly eventBtn: Button;
  readonly quickSearchInput: Input;
  readonly quickSearchButton: Button;

  constructor(page: Page) {

    // STEP 1: No iframe here — global nav lives on main page
    // STEP 2: Root is the top-level body
    super(page, page.locator('body'), 'Quick Search');

    // STEP 3: Resolve locators
    const eventBtnLoc: Locator = this.resolveLocator(
      page.getByRole('button', { name: 'Event' })
    );
    const jobMenuLoc: Locator = this.resolveLocator(
      page.getByRole('menuitem', { name: 'Job' })
    );
    const searchInputLoc: Locator = this.resolveLocator(
      page.getByRole('combobox', { name: 'Quick search...' })
    );
    const searchButoonLoc: Locator = this.resolveLocator(
      page.getByRole('button', { name: 'Quick Search' })
    );

    // STEP 4: Instantiate components
    this.eventBtn = new Button(page, eventBtnLoc, 'Event Menu');
    this.quickSearchInput = new Input(page, searchInputLoc, 'Quick Search Input');
    this.quickSearchButton = new Button(page, searchButoonLoc, 'Quick Search Button');
  }

  async expectLoaded() {
    await this.section('Quick Search - verify loaded', async () => {
      await this.eventBtn.expectVisible();
      await this.quickSearchInput.expectVisible();
    });
  }

  async searchFor(menu:string, value:string)  {
    await this.section(`Quick Search: ${menu} > ${value}`, async () => {
      const menuItem = new Button(this.page, this.page.getByRole('menuitem', { name: menu }), `Quick Search Menu Item: ${menu}`);
      const res = new Div(this.page, this.page.locator(`//div[@id='navbarquicksearch-autocomplete-popper']//li/div[contains(.,'${value}')]`), `Quick Search Result: ${value}`);
      await this.eventBtn.click();
      await menuItem.click();
      await this.quickSearchInput.click();
      await this.quickSearchInput.fill(value);
      await res.click();
      // await this.quickSearchButton.click();
    });
  }
  /**
   * Navigate to Jobs + search for jobId
   */
  async openJobProfile(jobId: string) {
    await this.section(`Open job profile: ${jobId}`, async () => {
      await this.searchFor('Job', jobId);
    });
  }
}

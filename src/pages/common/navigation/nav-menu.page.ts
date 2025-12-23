import { Page, Locator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Link } from '@src/components/link.component';

/**
 * NavigatorMenuPage
 * Represents the left-side global navigation menu for ATS.
 *
 * Assumptions:
 * - The "Navigator Menu" button opens the side navigation panel.
 * - Data-testid values are placeholders and should be replaced with real selectors.
 */
export class NavigatorMenuPage extends BasePage {
  readonly navMenuButton: Button;
  readonly createMenuButton: Button;
  readonly adminMenuButton: Button;
  readonly communicateMenuButton: Button;
  readonly peopleButton: Button;

  constructor(page: Page) {
    super(page, '[data-testid="navigator-root"]', 'Navigator Menu Page');

    const navMenuBtnLoc: Locator = page.getByRole('button', { name: 'Navigator Menu' });
    const createMenuBtnLoc: Locator = page.locator("#Create");
    const adminMenuBtnLoc: Locator = page.locator("#Admin");
    const communicateBtnLoc: Locator = page.locator("#Communicate");
    const peopleBtnLoc: Locator = page.locator("#People");

    this.navMenuButton = new Button(page, navMenuBtnLoc, 'Navigator Menu');
    this.createMenuButton = new Button(page, createMenuBtnLoc, 'Create Menu');
    this.adminMenuButton = new Button(page, adminMenuBtnLoc, 'Admin Menu');
    this.communicateMenuButton = new Button(page, communicateBtnLoc, "Communicate Menu");
    this.peopleButton = new Button(page, peopleBtnLoc, "People Menu");
  }

  async openNavigator() {
    await this.navMenuButton.click({force:true});
  }

  async openCreate() {
    await this.createMenuButton.click();
  }

  async openAdmin(){
    await this.adminMenuButton.click();
  }

  async openCommunicate()
  {
    await this.communicateMenuButton.click();
  }

  async clickPeople() {
    await this.peopleButton.click();
  }

  /**
   * Navigate to specific admin link by name
   * For dynamic navigation to admin menu items like "Hiring Automation", "iForm", etc.
   */
  async navigateToAdminLink(linkName: string) {
    await this.section(`Navigate to ${linkName} from Admin menu`, async () => {
      await this.openNavigator();
      await this.openAdmin();
      
      const link = new Link(
        this.page,
        this.page.getByRole('link', { name: linkName }),
        `${linkName} Link`
      );
      await link.click();
    });
  }

  //open Library



}
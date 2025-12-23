import { Page, Locator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';

/**
 * CreateMenuPage
 * Represents the "Create" menu after the user opens the global Navigator.
 *
 * Structure:
 *  Navigator Menu
 *    → Create
 *        → Person
 *        → Job
 *        → Company
 *
 * Only "Person" is required for ATS-T113, but the structure allows expansion.
 */
export class CreateMenuPage extends BasePage {
  readonly personBtn: Button;
  readonly jobBtn: Button;
  readonly companyBtn: Button;
  readonly systemconfigurationBtn: Button;

  constructor(page: Page) {
    super(page, '[data-testid=\"create-menu-root\"]', 'Create Menu');

    // STEP 3: Resolve element locators inside #main_body automatically
    const personLoc: Locator = this.page.locator("//button[contains(.,'Person')]");
    const jobLoc: Locator = this.page.locator("//button[contains(.,'Job')]");
    const companyLoc: Locator = this.page.locator("//button[contains(.,'Company')]");
    const systemconfigrationbtn:Locator = this.page.locator("//span[text()='System Configuration']/../..");

    // STEP 4: Instantiate components
    this.personBtn = new Button(page, personLoc, 'Create → Person');
    this.jobBtn = new Button(page, jobLoc, 'Create → Job');
    this.companyBtn = new Button(page, companyLoc, 'Create → Company');
    this.systemconfigurationBtn=new Button(page,systemconfigrationbtn , 'Admin -> System Configuration')
  }

  async openPerson() {
    await this.personBtn.click();
  }

  async openJob() {
    await this.jobBtn.click();
  }

  async openCompany() {
    await this.companyBtn.click();
  }

  async clickSystemConfiguration(){
    await this.systemconfigurationBtn.click();
  }
}
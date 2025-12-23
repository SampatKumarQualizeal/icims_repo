import { Page, Locator } from '@playwright/test';
import { BasePage } from '@src/pages/base.page';
import { Button } from '@src/components/button.component';
import { Link } from '@src/components/link.component';

/**
 * PersonMenuPage
 * Represents the submenu shown under:
 *
 * Navigator Menu → Create → Person
 *
 * This menu includes options:
 *  - Candidate
 *  - Employee (sometimes)
 *  - Contact (depends on config)
 *
 * Only "Candidate" is needed for ATS-T113, but structure supports expansion.
 */
export class PersonMenuPage extends BasePage {
  readonly candidateBtn: Button;
  readonly employeeBtn: Button;
  readonly contactBtn: Button;
  readonly personLink: Link;

  constructor(page: Page) {
    super(page, '[data-testid="person-menu-root"]', 'Create → Person Menu');

    // STEP 3: Resolve inside #main_body automatically
    const candidateLoc: Locator = this.page.locator("//a[contains(.,'Candidate')]");
    const employeeLoc: Locator = this.page.locator("//a[contains(.,'Employee')]");
    const contactLoc: Locator = this.page.locator("//a[contains(.,'Contact')]");
    const personLoc: Locator = this.page.getByRole('link', { name: /^Person$/ });

    // STEP 4
    this.candidateBtn = new Button(page, candidateLoc, 'Create → Person → Candidate');
    this.employeeBtn = new Button(page, employeeLoc, 'Create → Person → Employee');
    this.contactBtn = new Button(page, contactLoc, 'Create → Person → Contact');
    this.personLink = new Link(page, personLoc, 'Create → Person → Person');
  }

  /**
   * Open the Candidate creation wizard entry point.
   */
  async selectCandidate() {
    await this.candidateBtn.click();
  }

  async selectEmployee() {
    await this.employeeBtn.click();
  }

  async selectContact() {
    await this.contactBtn.click();
  }

  async selectPerson() {
    await this.personLink.click();
  }
}

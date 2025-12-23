import { Page } from '@playwright/test';
import { BaseTest } from '@src/utils/base-test.util';
import { BaseFlow } from '@src/utils/base-flow.util';
import { NavigatorMenuPage } from '@src/pages/common/navigation/nav-menu.page';
import { CreateMenuPage } from '@src/pages/common/navigation/create-menu.page';
import { PersonMenuPage } from '@src/pages/common/navigation/person-menu.page';
import { PersonCreateWizardPage } from '@src/pages/ats/person/person-create-wizard.page';

/**
 * PersonCreateFlow
 * Orchestrates person creation workflow with password validation:
 * - Navigate to Create > Person > Person
 * - Fill basic information (name, email)
 * - Upload documents
 * - Validate password re-enter field (mismatch error)
 * - Complete creation with matching passwords
 */
export class PersonCreateFlow extends BaseFlow {
  private navMenu: NavigatorMenuPage;
  private createMenu: CreateMenuPage;
  private personMenu: PersonMenuPage;
  private wizardPage: PersonCreateWizardPage;

  constructor(baseTest: BaseTest, page: Page) {
    super(baseTest, page);
    this.navMenu = new NavigatorMenuPage(page);
    this.createMenu = new CreateMenuPage(page);
    this.personMenu = new PersonMenuPage(page);
    this.wizardPage = new PersonCreateWizardPage(page);
  }

  /**
   * Navigate to person creation wizard
   */
  async navigateToPersonCreation() {
    await this.base.logger.section('Navigate to Create > Person > Person', async () => {
      await this.navMenu.openNavigator();
      await this.navMenu.openCreate();
      await this.createMenu.openPerson();
      await this.personMenu.selectPerson();
    });
  }

  /**
   * Fill basic person information (Step 1)
   */
  async fillBasicInformation(testData: {
    firstName: string;
    lastName: string;
    email: string;
  }) {
    await this.base.logger.section('Fill basic person information', async () => {
      await this.wizardPage.expectLoaded();
      await this.wizardPage.fillBasicInformation({
        firstName: testData.firstName,
        lastName: testData.lastName,
        email: testData.email
      });
      await this.wizardPage.clickNextScreen();
    });
  }

  /**
   * Upload document (Step 2)
   */
  async uploadDocument(filePath: string) {
    await this.base.logger.section('Upload document', async () => {
      await this.wizardPage.uploadDocument(filePath);
      await this.wizardPage.clickNextScreen();
    });
  }

  /**
   * Test password mismatch validation (Step 3)
   */
  async testPasswordMismatch(testData: {
    password: string;
    reenterPassword: string;
  }) {
    await this.base.logger.section('Test password mismatch validation', async () => {
      await this.wizardPage.fillLoginInformation({
        password: testData.password,
        reenterPassword: testData.reenterPassword
      });
      await this.wizardPage.clickFinish();
      await this.wizardPage.verifyPasswordMismatchError();
      
      this.base.logger.info('✓ Password mismatch error displayed correctly');
    });
  }

  /**
   * Complete profile creation with matching passwords
   */
  async completeProfileCreation(testData: {
    password: string;
    reenterPassword: string;
  }) {
    await this.base.logger.section('Complete profile creation', async () => {
      await this.wizardPage.fillLoginInformation({
        password: testData.password,
        reenterPassword: testData.reenterPassword
      });
      await this.wizardPage.clickFinish();
      await this.wizardPage.verifyProfileCreated();
      
      this.base.logger.info('✓ Profile created successfully');
    });
  }
}

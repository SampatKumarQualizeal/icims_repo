import { Page } from '@playwright/test';
import { BaseTest } from '@src/utils/base-test.util';
import { BaseFlow } from '@src/utils/base-flow.util';
import { PersonSearchPage } from '@src/pages/ats/person/person-search.page';
import { PersonProfileDetailPage } from '@src/pages/ats/person/person-profile-detail.page';
import { PersonProfileLoginPage } from '@src/pages/ats/person/person-profile-login.page';

/**
 * PersonProfileEditFlow
 * Orchestrates person profile edit workflow with re-enter field validation:
 * - Navigate to person search
 * - Search and select a person
 * - Open Detail tab OR Login tab and click Edit
 * - Fill fields with re-enter validation (test mismatch)
 * - Verify validation error
 * - Fill matching values and save
 * - Verify successful save
 */
export class PersonProfileEditFlow extends BaseFlow {
  private personSearchPage: PersonSearchPage;
  private profileDetailPage: PersonProfileDetailPage;
  private profileLoginPage: PersonProfileLoginPage;

  constructor(baseTest: BaseTest, page: Page) {
    super(baseTest, page);
    this.personSearchPage = new PersonSearchPage(page);
    this.profileDetailPage = new PersonProfileDetailPage(page);
    this.profileLoginPage = new PersonProfileLoginPage(page);
  }

  /**
   * Navigate to person search and select a person
   */
  async navigateToPersonProfile(searchCriteria: { email?: string; name?: string }) {
    await this.base.logger.section('Navigate to person search and select person', async () => {
      await this.personSearchPage.navigateTo();
      
      // Click on first search result to open profile (simplified - assumes person exists)
      await this.page.frameLocator('[data-testid="main-body-iframe"]')
        .locator('table tbody tr').first().click();
    });
  }

  /**
   * Open Detail tab and click Edit button
   */
  async startEditingProfile() {
    await this.base.logger.section('Open Detail tab and start editing', async () => {
      await this.profileDetailPage.clickDetailTab();
      await this.profileDetailPage.clickEdit();
    });
  }

  /**
   * Test field mismatch validation
   */
  async testFieldMismatch(fieldLabel: string, value: string, mismatchValue: string) {
    await this.base.logger.section(`Test ${fieldLabel} mismatch validation`, async () => {
      await this.profileDetailPage.fillFieldWithReenter(fieldLabel, value, mismatchValue);
      await this.profileDetailPage.verifyValidationError();
    });
  }

  /**
   * Complete profile edit with matching values
   */
  async completeProfileEdit(fieldLabel: string, value: string) {
    await this.base.logger.section(`Complete profile edit with matching ${fieldLabel}`, async () => {
      await this.profileDetailPage.fillFieldWithReenter(fieldLabel, value, value);
      await this.profileDetailPage.clickSave();
      await this.profileDetailPage.verifyProfileSaved();
    });
  }

  /**
   * Navigate to person profile and open Login tab
   */
  async navigateToLoginTab(personName: string) {
    await this.base.logger.section('Navigate to person profile and open Login tab', async () => {
      await this.personSearchPage.navigateTo();
      
      // Search and click on person
      await this.personSearchPage.runSearch();
      
      // Click on specific person by name
      const mainFrame = this.page.frameLocator('[data-testid="main-body-iframe"]');
      await mainFrame.getByRole('link', { name: personName }).click();
      
      // Click the "More" button to ensure the menu is open
      await this.profileLoginPage.clickMoreButton();

      // Click Login tab
      await this.profileLoginPage.clickLoginTab();
    });
  }

  /**
   * Test password field validation (Login tab)
   */
  async testPasswordValidation(testData: {
    password: string;
    retypePassword: string;
    expectedAlertMessage: string;
    expectedInlineMessage: string;
  }) {
    await this.base.logger.section('Test password field validation', async () => {
      await this.profileLoginPage.clickEdit();
      await this.profileLoginPage.fillPasswordFields(testData.password, testData.retypePassword);
      await this.profileLoginPage.clickSave();
      await this.profileLoginPage.verifyValidationErrors(
        testData.expectedAlertMessage,
        testData.expectedInlineMessage
      );
    });
  }
}

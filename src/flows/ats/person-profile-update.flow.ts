// src/flows/ats/person-profile-update.flow.ts
import { Page } from '@playwright/test';
import { BaseTest } from '@src/utils/base-test.util';
import { BaseFlow } from '@src/utils/base-flow.util';
import { PersonProfileContactEditPage } from '@src/pages/ats/person/person-profile-contact-edit.page';
import { PersonPhoneEditPopupPage } from '@src/pages/ats/person/person-phone-edit-popup.page';
import { PersonAddressEditPopupPage } from '@src/pages/ats/person/person-address-edit-popup.page';
import { PersonProfileOverviewPage } from '@src/pages/ats/person/person-profile-overview.page';
import { PersonProfileDetailsEditPage } from '@src/pages/ats/person/person-profile-details-edit.page';
import { PersonProfileExperienceTabPage } from '@src/pages/ats/person/person-profile-experience-tab.page';
import { NumberToWordUtil } from '@src/utils/number-to-word.util';

/**
 * PersonProfileUpdateFlow
 * Orchestrates person profile update workflows including:
 * - Searching for candidate via quick search
 * - Updating contact information (name, email, phone, address, tags)
 * - Verifying updates in profile header and activity log
 * - Conditional certification and experience updates
 */
export class PersonProfileUpdateFlow extends BaseFlow {
  private contactEditPage: PersonProfileContactEditPage;
  private overviewPage: PersonProfileOverviewPage;
  private detailsEditPage: PersonProfileDetailsEditPage;
  private experienceTabPage: PersonProfileExperienceTabPage;

  constructor(baseTest: BaseTest, page: Page) {
    super(baseTest, page);
    this.contactEditPage = new PersonProfileContactEditPage(page);
    this.overviewPage = new PersonProfileOverviewPage(page);
    this.detailsEditPage = new PersonProfileDetailsEditPage(page);
    this.experienceTabPage = new PersonProfileExperienceTabPage(page);
  }

  /**
   * Search for candidate by email using quick search
   */
  async searchForCandidate(email: string) {
    await this.base.logger.section('Search for candidate by email', async () => {
      const quickSearchInput = this.page.getByRole('combobox', { name: 'Quick search...' });
      await quickSearchInput.fill(email);
      await quickSearchInput.press('Enter');
      
      // Click on first result with candidate name pattern
      const candidateResult = this.page.getByRole('option', { name: /TestCandidate|Candidate|Person/ });
      await candidateResult.first().click();
    });
  }

  /**
   * Update contact information including name, email, phone, address, and tags
   */
  async updateContactInformation(testData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    city: string;
    tag?: string;
  }) {
    await this.base.logger.section('Update contact information', async () => {
      await this.contactEditPage.clickContactTab();
      await this.contactEditPage.clickEdit();
      
      // Update name and email
      await this.contactEditPage.updateFirstName(testData.firstName);
      await this.contactEditPage.updateLastName(testData.lastName);
      await this.contactEditPage.updateEmail(testData.email);
      
      // Update phone in popup
      await this.contactEditPage.clickPhoneEdit();
      await this.base.tabs.waitForNewTab('Phone Edit Popup');
      const phonePopupPage = this.base.tabs.as(PersonPhoneEditPopupPage, 'Phone Edit Popup');
      await phonePopupPage.updateNumber(testData.phoneNumber);
      await phonePopupPage.clickOk();
      await this.base.tabs.close('Phone Edit Popup');
      await this.base.tabs.switchTo('Main Tab');
      
      // Update address in popup
      await this.contactEditPage.clickAddressEdit();
      await this.base.tabs.waitForNewTab('Address Edit Popup');
      const addressPopupPage = this.base.tabs.as(PersonAddressEditPopupPage, 'Address Edit Popup');
      await addressPopupPage.updateCity(testData.city);
      await addressPopupPage.clickOk();
      
      // Handle potential validation warning
      await addressPopupPage.handleValidationWarning();
      
      await this.base.tabs.close('Address Edit Popup');
      await this.base.tabs.switchTo('Main Tab');
      
      // Add tag if provided
      if (testData.tag) {
        await this.contactEditPage.addTag(testData.tag);
      }
      
      // Save changes
      await this.contactEditPage.clickSave();
    });
  }

  /**
   * Verify updates are reflected in profile header/overview
   */
  async verifyProfileUpdates(testData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    city: string;
  }) {
    await this.base.logger.section('Verify profile updates in overview', async () => {
      await this.overviewPage.verifyName(testData.firstName, testData.lastName);
      await this.overviewPage.verifyEmail(testData.email);
      await this.overviewPage.verifyPhone(testData.phoneNumber);
      await this.overviewPage.verifyCity(testData.city);
    });
  }

  /**
   * Verify activity log shows profile edit
   */
  async verifyActivityLog() {
    await this.base.logger.section('Verify activity log', async () => {
      await this.overviewPage.verifyActivityLog('Profile Edited');
    });
  }

  /**
   * Check and update certifications if they exist (conditional)
   */
  async updateCertificationsIfExist() {
    await this.base.logger.section('Check and update certifications', async () => {
      await this.detailsEditPage.clickCandDetailsTab();
      await this.detailsEditPage.clickEdit();
      
      const hasCerts = await this.detailsEditPage.hasCertifications();
      
      if (hasCerts) {
        this.base.logger.info('Certifications found - would update status here');
        // TODO: Add certification status toggle logic when needed
      } else {
        this.base.logger.info('No certifications found - skipping certification update');
      }
      
      await this.detailsEditPage.clickCancel();
    });
  }

  /**
   * Check and update experience if data exists (conditional)
   */
  async updateExperienceIfExists() {
    await this.base.logger.section('Check and update experience', async () => {
      await this.experienceTabPage.clickExperienceTab();
      await this.experienceTabPage.clickEdit();
      
      const hasExperience = await this.experienceTabPage.hasExperienceData();
      
      if (hasExperience) {
        this.base.logger.info('Experience data found - would update fields here');
        // TODO: Add experience field update logic when needed
      } else {
        this.base.logger.info('No experience data found - skipping experience update');
      }
      
      await this.experienceTabPage.clickCancel();
    });
  }

  /**
   * Generate unique test data based on current time
   */
  static generateTimeBasedTestData(candidateEmail: string, basePhone: string, baseCity: string): {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    city: string;
    tag: string;
    candidateSearchEmail: string;
  } {
    const firstName = NumberToWordUtil.currentHourAsWord();
    const lastName = NumberToWordUtil.currentMinuteAsWord();
    const email = `${firstName}${lastName}@test.icims.com`;
    
    // Increment last digit of phone (0->1, 1->2, ..., 9->0)
    const phoneDigits = basePhone.split('');
    const lastDigitIndex = phoneDigits.length - 1;
    const lastDigit = parseInt(phoneDigits[lastDigitIndex]);
    phoneDigits[lastDigitIndex] = ((lastDigit + 1) % 10).toString();
    const phoneNumber = phoneDigits.join('');
    
    // Toggle city between two values
    const city = baseCity === 'Holmdel' ? 'Matawan' : 'Holmdel';
    
    return {
      firstName,
      lastName,
      email,
      phoneNumber,
      city,
      tag: 'Articulate',
      candidateSearchEmail: candidateEmail
    };
  }
}

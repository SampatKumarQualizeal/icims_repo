// src/flows/ats/portal-application.flow.ts
import { Page } from '@playwright/test';
import { BaseTest } from '@src/utils/base-test.util';
import { BaseFlow } from '@src/utils/base-flow.util';
import { CareerPortalPage } from '@src/pages/ats/career-portal.page';
import { PortalEmailEntryPage } from '@src/pages/ats/portal/portal-email-entry.page';
import { PortalBasicInfoPage } from '@src/pages/ats/portal/portal-basic-info.page';
import { PortalCandidateProfilePage } from '@src/pages/ats/portal/portal-candidate-profile.page';
import { PortalEEOPage } from '@src/pages/ats/portal/portal-eeo.page';
import { PersonProfileResumeTabPage } from '@src/pages/ats/person/person-profile-resume-tab.page';
import { PersonProfileContactTabPage } from '@src/pages/ats/person/person-profile-contact-tab.page';
import { PersonProfileDetailsTabPage } from '@src/pages/ats/person/person-profile-details-tab.page';
import { PersonProfileEEOTabPage } from '@src/pages/ats/person/person-profile-eeo-tab.page';
import path from 'path';
import fs from 'fs';
import os from 'os';

/**
 * PortalApplicationFlow
 * Orchestrates complete portal application workflow:
 * - Navigate to career portal and find job
 * - Complete application (email, basic info, candidate profile, EEO)
 * - Upload resume
 * - Verify profile created on platform with all data
 */
export class PortalApplicationFlow extends BaseFlow {
  private careerPortalPage: CareerPortalPage;
  private emailEntryPage: PortalEmailEntryPage;
  private basicInfoPage: PortalBasicInfoPage;
  private candidateProfilePage: PortalCandidateProfilePage;
  private eeoPage: PortalEEOPage;
  private resumeTabPage: PersonProfileResumeTabPage;
  private contactTabPage: PersonProfileContactTabPage;
  private detailsTabPage: PersonProfileDetailsTabPage;
  private eeoTabPage: PersonProfileEEOTabPage;

  constructor(baseTest: BaseTest, page: Page) {
    super(baseTest, page);
    this.careerPortalPage = new CareerPortalPage(page);
    this.emailEntryPage = new PortalEmailEntryPage(page);
    this.basicInfoPage = new PortalBasicInfoPage(page);
    this.candidateProfilePage = new PortalCandidateProfilePage(page);
    this.eeoPage = new PortalEEOPage(page);
    this.resumeTabPage = new PersonProfileResumeTabPage(page);
    this.contactTabPage = new PersonProfileContactTabPage(page);
    this.detailsTabPage = new PersonProfileDetailsTabPage(page);
    this.eeoTabPage = new PersonProfileEEOTabPage(page);
  }

  /**
   * Navigate to portal, search and apply for job
   */
  async navigateToJobAndApply(portalUrl: string, jobTitle: string) {
    await this.base.logger.section('Navigate to portal and apply for job', async () => {
      await this.page.goto(`${portalUrl}/jobs/intro`);
      await this.careerPortalPage.searchForJob(jobTitle);
      await this.careerPortalPage.openJobDetails(jobTitle);
      await this.careerPortalPage.verifyApplyButtonVisible();
      await this.careerPortalPage.clickApply();
    });
  }

  /**
   * Enter email on first page
   */
  async enterEmail(email: string) {
    await this.base.logger.section('Enter email address', async () => {
      await this.emailEntryPage.fillEmail(email);
      await this.emailEntryPage.clickNext();
    });
  }

  /**
   * Fill and submit Basic Information (Step 1/3)
   */
  async submitBasicInfo(testData: {
    firstName: string;
    lastName: string;
    login: string;
    password: string;
  }) {
    await this.base.logger.section('Submit Basic Information', async () => {
      await this.basicInfoPage.fillBasicInfo(testData);
      await this.basicInfoPage.submitProfile();
    });
  }

  /**
   * Fill and submit Candidate Profile (Step 2/3)
   */
  async submitCandidateProfile(testData: {
    phone: string;
    address: string;
    city: string;
    zip: string;
    state: string;
    source: string;
  }) {
    await this.base.logger.section('Submit Candidate Profile', async () => {
      // Skip initial resume upload
      await this.candidateProfilePage.skipResumeUpload();
      
      // Fill phone
      await this.candidateProfilePage.fillPhone('Mobile', testData.phone);
      
      // Fill address
      await this.candidateProfilePage.fillAddress({
        type: 'Home',
        address: testData.address,
        city: testData.city,
        zip: testData.zip
      });
      
      // Select country and state
      await this.candidateProfilePage.selectCountry('United States');
      await this.candidateProfilePage.selectState(testData.state, testData.state[0]);
      
      // Select source
      await this.candidateProfilePage.selectSource(testData.source);
      
      // Submit
      await this.candidateProfilePage.submitProfile();
    });
  }

  /**
   * Fill and submit EEO information (Step 3/3)
   */
  async submitEEO(gender: string, race: string) {
    await this.base.logger.section('Submit EEO Information', async () => {
      await this.eeoPage.fillEEO(gender, race);
      await this.eeoPage.submit();
    });
  }

  /**
   * Upload resume after returning to candidate profile
   */
  async uploadResume(testData: { firstName: string; lastName: string; email: string; phone: string }) {
    await this.base.logger.section('Upload resume', async () => {
      // Create temporary resume file
      const tempDir = os.tmpdir();
      const resumePath = path.join(tempDir, `${testData.firstName}_Resume.txt`);
      const resumeContent = `Test Resume for ${testData.firstName} ${testData.lastName}

Name: ${testData.firstName} ${testData.lastName}
Email: ${testData.email}
Phone: ${testData.phone}

Experience:
- Test experience 1
- Test experience 2`;
      
      fs.writeFileSync(resumePath, resumeContent);
      
      // Upload resume
      await this.candidateProfilePage.uploadResume(resumePath);
      await this.candidateProfilePage.updateProfile();
      
      // Clean up temp file
      fs.unlinkSync(resumePath);
      
      // Verify success message
      const contentFrame = this.page.frameLocator('iframe[name="icims_content_iframe"]');
      const successMsg = contentFrame.locator('text=Your application was submitted successfully');
      await successMsg.waitFor({ state: 'visible' });
    });
  }

  /**
   * Navigate to platform and search for created candidate
   */
  async navigateToPlatformAndSearch(platformUrl: string, email: string) {
    await this.base.logger.section('Navigate to platform and search candidate', async () => {
      await this.page.goto(`${platformUrl}/platform`);
      await this.page.getByRole('combobox', { name: 'Quick search...' }).fill(email);
      await this.page.getByRole('combobox', { name: 'Quick search...' }).press('Enter');
    });
  }

  /**
   * Open candidate profile from search results
   */
  async openCandidateProfile(fullName: string) {
    await this.base.logger.section(`Open candidate profile: ${fullName}`, async () => {
      await this.page.getByRole('option', { name: fullName }).click();
      // Profile loads automatically, framework's auto-wait handles it
    });
  }

  /**
   * Verify Resume tab content
   */
  async verifyResume(expectedTexts: string[]) {
    await this.base.logger.section('Verify Resume tab', async () => {
      // Resume tab should be default, but click to ensure
      for (const text of expectedTexts) {
        await this.resumeTabPage.verifyResumeContent(text);
      }
    });
  }

  /**
   * Verify Contact tab information
   */
  async verifyContact(testData: { phone: string; address: string; city: string; state: string; zip: string }) {
    await this.base.logger.section('Verify Contact tab', async () => {
      await this.contactTabPage.clickContactTab();
      await this.contactTabPage.verifyPhoneType('Mobile');
      await this.contactTabPage.verifyPhoneNumber(testData.phone);
      await this.contactTabPage.verifyAddress(testData.address);
      await this.contactTabPage.verifyCityStateZip(`${testData.city}, ${testData.state} ${testData.zip}`);
    });
  }

  /**
   * Verify Cand. Details tab source information
   */
  async verifySourceInformation(testData: {
    sourceChannel: string;
    source: string;
    sourceDevice: string;
    sourcePortal: string;
  }) {
    await this.base.logger.section('Verify Source Information', async () => {
      await this.detailsTabPage.clickCandDetailsTab();
      await this.detailsTabPage.verifySourceChannel(testData.sourceChannel);
      await this.detailsTabPage.verifySource(testData.source);
      await this.detailsTabPage.verifySourceDevice(testData.sourceDevice);
      await this.detailsTabPage.verifySourcePortal(testData.sourcePortal);
    });
  }

  /**
   * Verify EEO tab information
   */
  async verifyEEO(gender: string, race: string) {
    await this.base.logger.section('Verify EEO Information', async () => {
      await this.eeoTabPage.navigateToEEO();
      await this.eeoTabPage.verifyGender(gender);
      await this.eeoTabPage.verifyRace(race);
    });
  }
}

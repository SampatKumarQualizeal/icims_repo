// src/flows/crm/candidate.flow.ts
import { Page } from '@playwright/test';
import { BaseTest } from '@src/utils/base-test.util';
import { BaseFlow } from '@src/utils/base-flow.util';
import { CandidateSearchPage } from '@src/pages/crm/candidate-search.page';
import { CandidateCreatePage } from '@src/pages/crm/candidate-create.page';
import { CandidateProfilePage } from '@src/pages/crm/candidate-profile.page';

/**
 * CandidateFlow
 * Orchestrates CRM candidate workflows:
 * - Create candidate manually
 * - Verify candidate details
 * - Search for candidate
 * - Delete candidate
 */
export class CandidateFlow extends BaseFlow {
  readonly searchPage: CandidateSearchPage;
  readonly createPage: CandidateCreatePage;
  readonly profilePage: CandidateProfilePage;

  constructor(baseTest: BaseTest, page: Page) {
    super(baseTest, page);
    this.searchPage = new CandidateSearchPage(page);
    this.createPage = new CandidateCreatePage(page);
    this.profilePage = new CandidateProfilePage(page);
  }

  async navigateToCandidateSearch() {
    await this.base.logger.section('Navigate to Candidate Search', async () => {
      await this.searchPage.navigateTo();
    });
  }

  async initiateCandidateCreation() {
    await this.base.logger.section('Initiate candidate creation', async () => {
      await this.searchPage.clickCreateCandidate();
      await this.createPage.clickManualEntry();
    });
  }

  async createCandidate(testData: any) {
    await this.base.logger.section('Create candidate with form data', async () => {
      await this.createPage.fillCandidateForm({
        firstName: testData.candidateData.firstName,
        lastName: testData.candidateData.lastName,
        email: testData.candidateData.email,
        mobilePhone: testData.candidateData.mobilePhone,
        homePhone: testData.candidateData.homePhone,
        workPhone: testData.candidateData.workPhone,
        referralSource: testData.candidateData.referralSource,
      });
      await Promise.all([
        this.createPage.submitForm(),
        this.profilePage.verifySuccessMessage()
      ]);
    });
  }

  async verifyBasicInformation(testData: any) {
    await this.base.logger.section('Verify basic candidate information', async () => {
      await this.profilePage.verifyCandidateName(
        testData.candidateData.firstName,
        testData.candidateData.lastName
      );
      await this.profilePage.verifyEmail(testData.candidateData.email);
      await this.profilePage.verifyPhone(testData.candidateData.mobilePhone);
      await this.profilePage.verifyPhone(testData.candidateData.homePhone);
      await this.profilePage.verifyPhone(testData.candidateData.workPhone);
    });
  }

  async verifyAdditionalInformation(testData: any) {
    await this.base.logger.section('Verify additional information', async () => {
      await this.profilePage.clickAdditionalInfoTab();
      await this.profilePage.verifyReferralSource(testData.candidateData.referralSource);
    });
  }

  async searchForCandidate(testData: any) {
    await this.base.logger.section('Search for candidate', async () => {
      await this.searchPage.navigateTo();
      await this.searchPage.openSearchDrawer();
      await this.searchPage.searchByKeyword(testData.candidateData.email);
      await this.searchPage.closeSearchDrawer();
      
      const fullName = `${testData.candidateData.firstName} ${testData.candidateData.lastName}`;
      await this.searchPage.verifyCandidateInResults(fullName);
    });
  }

  async openCandidateProfile(testData: any) {
    await this.base.logger.section('Open candidate profile', async () => {
      const fullName = `${testData.candidateData.firstName} ${testData.candidateData.lastName}`;
      await this.searchPage.clickCandidateLink(fullName);
      await this.profilePage.expectLoaded();
    });
  }

  async deleteCandidate() {
    await this.base.logger.section('Delete candidate', async () => {
      await this.profilePage.deleteCandidate();
      await this.profilePage.verifyDeletionSuccess();
    });
  }

  async logout() {
    await this.profilePage.logout();
  }
}

// src/flows/crm/resume-upload.flow.ts
import { Page } from '@playwright/test';
import { BaseTest } from '@src/utils/base-test.util';
import { BaseFlow } from '@src/utils/base-flow.util';
import { PipelineListPage } from '@src/pages/crm/pipeline-list.page';
import { CandidateSearchPage } from '@src/pages/crm/candidate-search.page';
import { ResumeUploadPage } from '@src/pages/crm/resume-upload.page';
import { CandidateProfilePage } from '@src/pages/crm/candidate-profile.page';
import { Div } from '@src/components/div.component';
import { Link } from '@src/components/link.component';

/**
 * ResumeUploadFlow
 * Orchestrates CRM resume upload workflows:
 * - Create pipeline
 * - Upload resume to create candidate
 * - Verify parsed candidate details
 * - Delete candidate and pipeline
 */
export class ResumeUploadFlow extends BaseFlow {
  readonly pipelinePage: PipelineListPage;
  readonly searchPage: CandidateSearchPage;
  readonly uploadPage: ResumeUploadPage;
  readonly profilePage: CandidateProfilePage;
  private pipelineId: number = 0;

  constructor(baseTest: BaseTest, page: Page) {
    super(baseTest, page);
    this.pipelinePage = new PipelineListPage(page);
    this.searchPage = new CandidateSearchPage(page);
    this.uploadPage = new ResumeUploadPage(page);
    this.profilePage = new CandidateProfilePage(page);
  }

  async navigateToPipelines() {
    await this.base.logger.section('Navigate to Pipelines', async () => {
      await this.pipelinePage.navigateTo();
    });
  }

  async createPipeline(pipelineName: string): Promise<number> {
    let pipelineId = 0;
    
    await this.base.logger.section('Create pipeline', async () => {
      pipelineId = await this.pipelinePage.createPipeline(pipelineName);
      await this.pipelinePage.verifyPipelineHeading(pipelineName);
      this.pipelineId = pipelineId;
    });

    return pipelineId;
  }

  async navigateToCandidateSearch() {
    await this.base.logger.section('Navigate to Candidate Search', async () => {
      await this.searchPage.navigateTo();
    });
  }

  async initiateResumeUpload() {
    await this.base.logger.section('Initiate resume upload', async () => {
      await this.searchPage.clickCreateCandidate();
      await this.uploadPage.clickResumeUpload();
    });
  }

  async uploadResumeWithPipeline(testData: any) {
    await this.base.logger.section('Upload resume with pipeline selection', async () => {
      await this.uploadPage.selectPipeline(testData.pipelineName);
      await this.uploadPage.uploadResume(testData.resumeFilePath);
      await this.uploadPage.clickUpload();
    });
  }

  async waitForResumeParsing() {
    await this.base.logger.section('Wait for resume parsing', async () => {
      await this.uploadPage.waitForParsing(15);
    });
  }

  async searchForCandidate(email: string) {
    await this.base.logger.section('Search for created candidate', async () => {
      await this.searchPage.navigateTo();
      await this.searchPage.openSearchDrawer();
      await this.searchPage.searchByKeyword(email);
      await this.searchPage.closeSearchDrawer();
    });
  }

  async openCandidateProfile(candidateName: string) {
    await this.base.logger.section('Open candidate profile', async () => {
      await this.searchPage.verifyCandidateInResults(candidateName);
      await this.searchPage.clickCandidateLink(candidateName);
      await this.profilePage.expectLoaded();
    });
  }

  async verifyBasicInformation(testData: any) {
    await this.base.logger.section('Verify parsed basic information', async () => {
      await this.profilePage.verifyCandidateName(
        testData.expectedData.firstName,
        testData.expectedData.lastName
      );
      await this.profilePage.verifyEmail(testData.expectedData.email);
      
      if (testData.expectedData.mobilePhone) {
        // await this.profilePage.verifyPhone(testData.expectedData.mobilePhone);
      }
      if (testData.expectedData.homePhone) {
        // await this.profilePage.verifyPhone(testData.expectedData.homePhone);
      }
      if (testData.expectedData.workPhone) {
        // await this.profilePage.verifyPhone(testData.expectedData.workPhone);
      }
    });
  }

  async verifyAdditionalInformation(testData: any) {
    await this.base.logger.section('Verify additional information', async () => {
      await this.profilePage.clickAdditionalInfoTab();
      
      if (testData.expectedData.referralSource) {
        await this.profilePage.verifyReferralSource(testData.expectedData.referralSource);
      }
    });
  }

  async verifyPipelinesTab(pipelineName: string) {
    await this.base.logger.section('Verify Pipelines tab', async () => {
      await this.profilePage.clickPipelinesTab();
      
      // Dynamic link based on runtime parameter - acceptable pattern
      const pipelineLink = new Link(
        this.page,
        this.page.getByRole('link', { name: pipelineName }),
        `Pipeline Link: ${pipelineName}`
      );
      await pipelineLink.expectVisible();
    });
  }

  async verifyDocumentsTab(documentName: string) {
    await this.base.logger.section('Verify Documents tab', async () => {
      await this.profilePage.clickDocumentsTab();
      
      // Dynamic element based on runtime parameter - acceptable pattern
      const docLink = new Div(
        this.page,
        this.page.getByText(documentName),
        `Document: ${documentName}`
      );
      await docLink.expectVisible();
    });
  }

  async deleteCandidate() {
    await this.base.logger.section('Delete candidate', async () => {
      await this.profilePage.deleteCandidate();
      await this.profilePage.verifyDeletionSuccess();
    });
  }

  async deletePipeline(pipelineId?: number) {
    const idToDelete = pipelineId || this.pipelineId;
    
    await this.base.logger.section(`Delete pipeline ID: ${idToDelete}`, async () => {
      await this.pipelinePage.navigateTo();
      await this.pipelinePage.navigateToPipeline(idToDelete);
      await this.pipelinePage.deactivatePipeline();
    });
  }

  async logout() {
    await this.profilePage.logout();
  }
}

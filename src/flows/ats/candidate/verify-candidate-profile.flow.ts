// src/flows/ats/candidate/verify-candidate-profile.flow.ts
import { Page } from '@playwright/test';
import { BaseTest } from '@src/utils/base-test.util';
import { BaseFlow } from '@src/utils/base-flow.util';
import { CandidateViewPage } from '@src/pages/ats/candidate/candidate-view.page';

export class VerifyCandidateProfileFlow extends BaseFlow {
  constructor(base: BaseTest, page: Page) {
    super(base, page);
  }

  async verifyCandidateDetails(data: {
    resumePath: string;
    firstName: string;
    email: string;
    salary: string;
    expYears: string;
    source: string;
    phone: { type: string; number: string; extension?: string };
    address: { type: string; street: string; city: string; zip: string; country: string; state: string; county?: string };
  }) {

    const candidateViewPage = new CandidateViewPage(this.page);
    await candidateViewPage.expectLoaded();
    await candidateViewPage.verifyFullName(data.firstName);
    await candidateViewPage.verifyCandidateUniqueIDIsPresent();
    await candidateViewPage.verifyEmail(data.email);
    await candidateViewPage.verifyFolder("Cand:Active");

  }

  async verifyCandidateDetailsAsPerUploadedResume(resumeDetails: Array<any>, phoneType: string, phoneNumber: string, phoneExtension: string) {
    const candidateViewPage = new CandidateViewPage(this.page);
    await candidateViewPage.verifyUploadedResumeDetails(resumeDetails, phoneType, phoneNumber, phoneExtension);
  }

}

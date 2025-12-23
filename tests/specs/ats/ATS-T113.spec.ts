import { test } from '@tests/governance';

import { CandidateWizardFlow } from '@src/flows/ats/candidate/candidate-wizard.flow';
import { VerifyCandidateProfileFlow } from '@src/flows/ats/candidate/verify-candidate-profile.flow';
import { DuplicateCheckPopupPage } from '@src/pages/ats/candidate/duplicate-check-popup.page';
import { CandidateCreatePage } from '@src/pages/ats/candidate/candidate-create.page';
import { PhoneDetailsPage } from '@src/pages/ats/candidate/phone-details.page';
import { ensureAuth } from '@src/utils/auth-helper.util';

test.describe('Create Candidate', () => {

  test('ATS-T113 - Create Candidate via Create > Person > Candidate wizard and validate profile (DEBUG)', async ({ baseTest, authPage, testData }) => {
    (test.info() as any).metadata = {
      product: 'ATS',
      owner: 'ATS QA',
      risk: 'High'
    };

    const { page } = await ensureAuth(baseTest, authPage, 'recruiter', 'ats');

    let addressDetails: any[] = [];
    const candidateFlow = new CandidateWizardFlow(baseTest, page);
    const verifyCandidateFlow = new VerifyCandidateProfileFlow(baseTest, page);

    await baseTest.logger.section('Run candidate creation wizard', async () => {
      await candidateFlow.completeCandidateWizard(testData);

      await baseTest.tabs.waitForNewTab("Confirmation Popup ");
      const popupPage = baseTest.tabs.as(DuplicateCheckPopupPage);
      await popupPage.clickOnContinueAnywayButton();
      await baseTest.tabs.cleanupTabs();

      const candidateCreatePage = baseTest.tabs.as(CandidateCreatePage);
      await candidateCreatePage.clickOnNewPhoneButton();
      await baseTest.tabs.waitForNewTab("Phone Details Popup");
      const phoneDetailsPage = baseTest.tabs.as(PhoneDetailsPage);
      await phoneDetailsPage.enterPhoneDetails(testData.phone.type, testData.phone.number, testData.phone.extension);
      await baseTest.tabs.cleanupTabs();

      await candidateCreatePage.verifyEnteredPhoneDetails(testData.phone.type, testData.phone.number, testData.phone.extension);
    });

    await baseTest.logger.section('Add Details in Address Page', async () => {
      const candidateCreatePage = baseTest.tabs.as(CandidateCreatePage);
      addressDetails = await candidateFlow.addDetailsFromAddressPage(testData);
      await candidateFlow.navigateToFinishAndVerifyCandidateProfile(testData);
    });

    await baseTest.logger.section('Validate profile basics', async () => {
      await verifyCandidateFlow.verifyCandidateDetails(testData);
    });

    await baseTest.logger.section('Verify candidate detals against uploaded resume', async () => {
      await verifyCandidateFlow.verifyCandidateDetailsAsPerUploadedResume(addressDetails, testData.phone.type, testData.phone.number, testData.phone.extension);
    });

  });
});
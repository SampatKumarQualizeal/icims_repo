// tests/specs/crm/CRM-T170.spec.ts
import { test } from '@tests/governance';
import { CandidateFlow } from '@src/flows/crm/candidate.flow';
import { crmLogin } from '@src/flows/crm/common/crm.login.flow';
import { config } from '@config/config';

test.describe('CRM-T170: Manually Create Candidate', () => {
  test('CRM-T170: Create, verify, search, and delete candidate', async ({ baseTest, testData }) => {
    const page = baseTest.page;

    // Login
     await crmLogin(page, {
        user: config.secrets.crm.username,
        password: config.secrets.crm.password
      });
    
    // Initialize flow
    const candidateFlow = new CandidateFlow(baseTest, page);

    // Navigate to Candidate Search
    await candidateFlow.navigateToCandidateSearch();

    // Initiate candidate creation
    await candidateFlow.initiateCandidateCreation();

    // Create candidate
    await candidateFlow.createCandidate(testData);

    // Verify basic information on profile
    await candidateFlow.verifyBasicInformation(testData);

    // Verify additional information
    await candidateFlow.verifyAdditionalInformation(testData);

    // Navigate back and search for candidate
    await candidateFlow.searchForCandidate(testData);

    // Open candidate profile
    await candidateFlow.openCandidateProfile(testData);

    // Delete candidate
    await candidateFlow.deleteCandidate();

    // Logout
    await candidateFlow.logout();
  });
});

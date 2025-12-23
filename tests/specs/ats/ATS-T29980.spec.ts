import { test } from '@tests/governance';
import { JobFlow } from '@src/flows/ats/job/job.flow';
import { ensureAuth } from '@src/utils/auth-helper.util';

/**
 * ATS-T29980: Job Posting and Unposting Functionality
 * 
 * Test Case: Given I am a recruiter, when I am viewing a job, 
 * then I should be able to post and unpost the job
 * 
 * Objective: Verify that the posting tab shows the correct status of a job posting 
 * and allows the user to post and unpost a job to/from career portals
 * 
 * Test Flow:
 * 1. Login as recruiter 
 * 2. Search for job by ID
 * 3. Navigate to Posting Center
 * 4. Select a portal and post the job
 * 5. Verify job posting status
 * 6. Verify job appears on career portal
 * 7. Unpost the job
 * 8. Verify job is unposted
 * 
 * Prerequisites:
 * - Recruiter login credentials
 * - Approved job exists in system (job ID in test data)
 * - Career portal is configured with field mappings
 */

test.describe('ATS-T29980: Job Posting and Unposting', () => {
  const testId = 'ATS-T29980';

  test(`${testId}: Complete job posting and unposting lifecycle`, async ({
    baseTest,
    authPage,
    testData,
    tabs
  }) => {
    const { page } = await ensureAuth(baseTest, authPage, 'recruiter', 'ats');
    
    const flow = new JobFlow(baseTest, page);

    // Post job to portal (search, open posting center, select portal, post)
    await flow.postJobToPortal(testData.jobId, testData.portalName);

    // Verify job appears on external portal
    await flow.verifyOnPortal(testData.portalName);

    // Unpost job and verify status
    await flow.unpostFromPortal();

    baseTest.logger.info('Job posting lifecycle completed successfully');
  });
});

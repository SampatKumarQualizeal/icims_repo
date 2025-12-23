import { test } from '@tests/governance';
import { JobFlow } from '@src/flows/ats/job/job.flow';
import { ensureAuth } from '@src/utils/auth-helper.util';

test.describe('ATS Job Posting – Portal Posting Workflow', () => {

  test('ATS-T118 Post job to portal, verify posting, open external portal, and unpost', async ({
    baseTest,
    logger,
    testData,
    authPage,
    tabs
  }) => {
    const { page } = await ensureAuth(baseTest, authPage, 'recruiter', 'ats');
    
    const flow = new JobFlow(baseTest, page);
    const jobId = testData.jobId; //'1137';
    const portalName = 'External';

    logger.info(`Post job ${jobId} to portal: ${portalName}`);
    
    // 1. Search job + post
    await flow.postJobToPortal(jobId, portalName);

    // 2. Open external portal tab
    await flow.verifyOnPortal(portalName);
    
    // 3. Unpost
    await flow.unpostFromPortal();

    logger.info('Completed job posting workflow successfully');
  });
});

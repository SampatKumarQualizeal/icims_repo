// tests/specs/crm/CRM-T188.spec.ts
import { test } from '@tests/governance';
import { ResumeUploadFlow } from '@src/flows/crm/resume-upload.flow';
import { crmLogin } from '@src/flows/crm/common/crm.login.flow';
import path from 'path';
import { config } from '@config/config';

test.describe('CRM-T188: Resume Upload Candidate Create', () => {
    test('CRM-T188: Upload resume, verify parsed data, and cleanup', async ({ baseTest, testData }) => {
        const page = baseTest.page;
        let pipelineId: number;

        // Login
        await crmLogin(page, {
            user: config.secrets.crm.username,
            password: config.secrets.crm.password
        });

        // Initialize flow
        const resumeUploadFlow = new ResumeUploadFlow(baseTest, page);

        // Create pipeline
        await resumeUploadFlow.navigateToPipelines();
        pipelineId = await resumeUploadFlow.createPipeline(testData.pipelineName);

        // Navigate to candidate search
        await resumeUploadFlow.navigateToCandidateSearch();

        // Initiate resume upload
        await resumeUploadFlow.initiateResumeUpload();

        // Upload resume with pipeline selection
        const resumePath = path.join(process.cwd(), testData.resumeFilePath);
        await resumeUploadFlow.uploadResumeWithPipeline({
            pipelineName: testData.pipelineName,
            resumeFilePath: resumePath
        });

        // Wait for resume parsing
        await resumeUploadFlow.waitForResumeParsing();

        // Search for candidate with retry logic
        const fullName = `${testData.expectedData.firstName} ${testData.expectedData.lastName}`;
        await resumeUploadFlow.searchForCandidate(testData.expectedData.email);
        
        try {
            // Attempt to open candidate profile
            await resumeUploadFlow.openCandidateProfile(fullName);
        } catch (error) {
            // If not found, wait for backend indexing and retry
            await page.waitForTimeout(15000);
            await resumeUploadFlow.searchForCandidate(testData.expectedData.email);
            await resumeUploadFlow.openCandidateProfile(fullName);
        }

        // Verify basic information
        await resumeUploadFlow.verifyBasicInformation(testData);

        // Verify additional information
        await resumeUploadFlow.verifyAdditionalInformation(testData);

        // Verify pipelines tab
        await resumeUploadFlow.verifyPipelinesTab(testData.pipelineName);

        // Verify documents tab
        await resumeUploadFlow.verifyDocumentsTab(testData.documentName);

        // Delete candidate
        await resumeUploadFlow.deleteCandidate();

        // Delete pipeline
        await resumeUploadFlow.deletePipeline(pipelineId);

        // Logout
        await resumeUploadFlow.logout();
    });
});

// tests/specs/ats/ATS-T29917.spec.ts
import { test } from '@tests/governance';
import { PortalApplicationFlow } from '@src/flows/ats/portal-application.flow';

/**
 * ATS-T29917: Portal Application - Complete Candidate Profile Creation
 * 
 * Test validates end-to-end portal application flow including:
 * - Email entry and Basic Information submission
 * - Candidate Profile with contact details
 * - Custom State dropdown with search functionality
 * - Resume upload through file chooser
 * - EEO data submission
 * - Platform verification of all submitted data
 * 
 * Objective: Verify that candidate profile is created on platform with all portal data transferred correctly
 * 
 * Preconditions:
 * - Career portal configured with job postings
 * - EEO fields enabled and visible
 * - Source fields configured (Source Channel, Source)
 * - Resume upload enabled
 */
test.describe('ATS-T29917: Portal Application - Complete Candidate Profile Creation', () => {
    test('ATS-T29917: Create candidate profile through portal application', async ({
        baseTest,
        authPage,
        testData
    }) => {
        const page = baseTest.page;
        const flow = new PortalApplicationFlow(baseTest, page);

        // Step 1-4: Navigate to portal, search job, view details, click apply
        await flow.navigateToJobAndApply(testData.portalUrl, testData.jobTitle);

        // Step 5-6: Enter email and proceed
        await flow.enterEmail(testData.email);

        // Step 7-8: Fill and submit Basic Information (Step 1/3)
        await flow.submitBasicInfo({
            firstName: testData.firstName,
            lastName: testData.lastName,
            login: testData.login,
            password: testData.password
        });

        // Step 9-15: Fill and submit Candidate Profile (Step 2/3)
        await flow.submitCandidateProfile({
            phone: testData.phone,
            address: testData.address,
            city: testData.city,
            zip: testData.zip,
            state: testData.state,
            source: testData.source
        });

        // Step 16-17: Fill and submit EEO Information (Step 3/3)
        await flow.submitEEO(testData.gender, testData.race);

        // Step 18-20: Upload resume and finalize application
        await flow.uploadResume({
            firstName: testData.firstName,
            lastName: testData.lastName,
            email: testData.email,
            phone: testData.phone
        });

        // Step 21-24: Navigate to platform and search for candidate
        await flow.navigateToPlatformAndSearch(testData.platformUrl, testData.email);
        await flow.openCandidateProfile(`${testData.firstName} ${testData.lastName}`);

        // Step 25: Verify Resume tab
        await flow.verifyResume([
            `Test Resume for ${testData.firstName}`,
            testData.email
        ]);

        // Step 26: Verify Contact tab
        await flow.verifyContact({
            phone: testData.phone,
            address: testData.address,
            city: testData.city,
            state: testData.state,
            zip: testData.zip
        });

        // Step 27: Verify Cand. Details tab - Source Information
        await flow.verifySourceInformation({
            sourceChannel: testData.sourceChannel,
            source: testData.source,
            sourceDevice: testData.sourceDevice,
            sourcePortal: testData.sourcePortal
        });

        // Step 28: Verify EEO tab
        await flow.verifyEEO(testData.gender, testData.race);
    });
});

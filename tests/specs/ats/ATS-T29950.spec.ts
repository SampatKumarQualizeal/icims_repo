// tests/specs/ats/ATS-T29950.spec.ts
import { test } from '@tests/governance';
import { PersonProfileUpdateFlow } from '@src/flows/ats/person-profile-update.flow';
import { ensureAuth } from '@src/utils/auth-helper.util';

/**
 * ATS-T29950: Update Candidate Profile Information
 * 
 * Test validates that profile updates are reflected across:
 * - Profile header (name, email, phone, address)
 * - Overview section
 * - Contact tab
 * - Activity log
 * 
 * Updates:
 * - First Name: Current hour in words (e.g., "Thirteen")
 * - Last Name: Current minute in words (e.g., "Fiftyfour")
 * - Email: Generated from first/last name
 * - Phone: Last digit incremented by 1
 * - City: Toggled between Holmdel and Matawan
 * - Tag: "Articulate" added
 * 
 * Conditional checks (if data exists):
 * - Certifications: Would toggle status between Current/Suspended
 * - Experience: Would update School, Skills, Employer, Reference
 * 
 * Note: This test uses time-based naming to ensure unique values on each run
 */
test.describe('ATS-T29950: Update Candidate Profile Information', () => {
  test('ATS-T29950: Update profile and verify changes across tabs', async ({ 
    baseTest, 
    authPage,
    testData 
  }) => {
    const { page } = await ensureAuth(baseTest, authPage, 'recruiter', 'ats');
    
    // Initialize flow
    const flow = new PersonProfileUpdateFlow(baseTest, page);
    
    // Generate unique test data based on current time
    const updateData = PersonProfileUpdateFlow.generateTimeBasedTestData(
      testData.candidateSearchEmail,
      testData.basePhoneNumber,
      testData.baseCity
    );
    
    // Search for candidate by email
    await flow.searchForCandidate(updateData.candidateSearchEmail);
    
    // Update contact information (name, email, phone, address, tags)
    await flow.updateContactInformation({
      firstName: updateData.firstName,
      lastName: updateData.lastName,
      email: updateData.email,
      phoneNumber: updateData.phoneNumber,
      city: updateData.city,
      tag: updateData.tag
    });
    
    // Verify updates in profile header and overview
    await flow.verifyProfileUpdates({
      firstName: updateData.firstName,
      lastName: updateData.lastName,
      email: updateData.email,
      phoneNumber: updateData.phoneNumber,
      city: updateData.city
    });
    
    // Verify activity log shows "Profile Edited"
    await flow.verifyActivityLog();
    
    // Check and update certifications if they exist (conditional)
    await flow.updateCertificationsIfExist();
    
    // Check and update experience if data exists (conditional)
    await flow.updateExperienceIfExists();
  });
});

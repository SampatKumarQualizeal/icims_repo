// tests/specs/ats/ATS-T73.spec.ts
import { test } from '@tests/governance';
import { ConnectPortalFlow } from '@src/flows/ats/connect-portal.flow';
import { config } from '@config/config';
import { processPlaceholders } from '@src/config/placeholder-processor.util';
import testDataJson from '@tests/data/scenarios/ats/ATS-T73.json';

/**
 * ATS-T73: Connect Portal Mobile Responsiveness
 * Verifies Connect Portal career site is mobile responsive
 * Tests signup workflow on iPhone SE viewport (375x667)
 */
test.describe('ATS-T73: Connect Portal Mobile Responsiveness', () => {
  // Process placeholders once before all tests
  const processedData = processPlaceholders(testDataJson);
  
  for (const data of processedData.data) {
    test(`ATS-T73: ${data.testCase}`, async ({ baseTest }) => {
      const connectPortalFlow = new ConnectPortalFlow(baseTest.page);

      // Execute complete mobile responsive workflow
      await connectPortalFlow.completeMobileResponsiveTest(config.connectPortalUrl, {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        zip: data.zip,
        jobTitle: data.jobTitle,
        talentPools: data.talentPools,
      });
    });
  }
});

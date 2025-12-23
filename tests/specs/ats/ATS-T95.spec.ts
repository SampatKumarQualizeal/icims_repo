import { navigateBackToFieldGroupToUpdateAccessAndVerifyPerson, personConfigurationFlow } from '@src/flows/ats/candidate/person-configuration-create-verify.flow';
import { ensureAuth } from '@src/utils/auth-helper.util';
import { test } from '@tests/governance';

test.describe('Configurations Creation using Admin', () => {

  test('ATS-T95 - Admin can create, validate, set read-only & hidden state, then delete fields', async ({ baseTest, authPage }) => {
    (test.info() as any).metadata = {
      product: 'ATS',
      owner: 'ATS QA',
      risk: 'High'
    };

    // const adminCtx = await baseTest.as('admin', { fresh: true });
    // const admin = adminCtx.base;
    // const page = admin.page;

    const { page, dispose } = await ensureAuth(baseTest, authPage, 'admin', 'ats');
    
    baseTest.logger.info('ATS-T95: Starting custom profile field creation process');

    const testData = baseTest.testData;

    const random = Math.floor(1000 + Math.random() * 9000);

    await baseTest.logger.section('Add Field group , fields and verify the edit mode', async () => {
      await personConfigurationFlow(page, `auto${random}`);
    });

    await baseTest.logger.section('Verify the read mode', async () => {
      await navigateBackToFieldGroupToUpdateAccessAndVerifyPerson(page, `auto${random}`, 'read');
    });

    await baseTest.logger.section('Verify the hide mode', async () => {
      await navigateBackToFieldGroupToUpdateAccessAndVerifyPerson(page, `auto${random}`, 'hide');
    });

    await baseTest.logger.section('Delete the added fields and Verify the delete mode', async () => {
      await navigateBackToFieldGroupToUpdateAccessAndVerifyPerson(page, `auto${random}`, 'delete');
    });
  });

});
import { test } from '@tests/governance';
import { ensureAuth } from '@src/utils/auth-helper.util';
import { EmailCampaignFlow } from '@src/flows/ats/email/email-campaign.flow';

test.describe('Email Campaign creation and verifiction', () => {

  test('ATS-T192 Email Campaign Creation and campaign email validation', async ({
    baseTest,
    logger,
    testData,
    authPage,
    tabs
  }) => {
    const { page } = await ensureAuth(baseTest, authPage, 'recruiter', 'ats');
    const emailFlow = new EmailCampaignFlow(baseTest, page);
    
    const recipientName = "Recipient Auto" + Math.floor(1000 + Math.random() * 9000);
    const campaignName = "Camp Auto" + Math.floor(1000 + Math.random() * 9000);


    logger.info(`Email campaign creation has started`);

    await emailFlow.createEmailCampaign("sai gymkala","abc@gmail.com",recipientName,campaignName,"Career Opportunities");

    await emailFlow.verifyEmailCampaignCreation();

    await emailFlow.verifyEmailCampaignSchedule(recipientName,campaignName,"Career Opportunities");

    logger.info('Email campaign creation and verifiction has completed');
  });
});
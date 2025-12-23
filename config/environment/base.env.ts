// config/environment/base.env.ts
export const baseEnv = {
  disableAuthManager: process.env.DISABLE_AUTH === "1",
  executionMode: 'DEBUG', // FAST | SAFE | DEBUG
  appBaseUrl: 'http://localhost:3000',
  apiBaseUrl: 'http://localhost:3001',
  crmBaseUrl: 'https://recruiterapp.cc.staging.us-east-1.jibe.com/',
  cmsApiUrl: 'https://staging.cms.talentplatform.us',
  connectPortalUrl: 'https://careers-test720.icims.com/connect',
  ldEnabled: false,
  slackEnabled: false,
  teamsEnabled: false,
  // base urls (non-sensitive)
  twilioUrl: 'https://api.twilio.com',
  ldWriteUrl: undefined,
  retryCount: 0,
  timeouts: {
    pageLoad: 30000,
    component: 5000,
    navigation: 15000,
    api: 15000,
    poll: 1000,
    modal: 7000
  }
};

// config/config.ts
import { baseEnv } from './environment/base.env';
import { devEnv } from './environment/dev.env';
import { qaEnv } from './environment/qa.env';
import { stageEnv } from './environment/stage.env';


// try to import secrets.local (if present) otherwise fallback to process.env mapper
let secretsImport: any = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  secretsImport = require('./secrets/secrets.local').secrets;
} catch {
  // not present; map from environment variables
  secretsImport = {
    ats: {
      uiUser: process.env.UI_USER,
      uiPass: process.env.UI_PASS,
      apiAdminUser: process.env.API_ADMIN_USER,
      apiAdminPassword: process.env.API_ADMIN_PASSWORD,
      roleCredentials: {
        recruiter: { username: process.env.RECRUITER_USER, password: process.env.RECRUITER_PASS },
        manager: { username: process.env.MANAGER_USER, password: process.env.MANAGER_PASS },
        admin: { username: process.env.ADMIN_USER, password: process.env.ADMIN_PASS }
      }
    },
    cst: {},
    crm: {},
    slackWebhook: process.env.SLACK_WEBHOOK,
    teamsWebhook: process.env.TEAMS_WEBHOOK,
    ldSdkKey: process.env.LD_SDK_KEY,
    ldWriteKey: process.env.LD_WRITE_KEY,
    twilioApiKey: process.env.TWILIO_API_KEY,
    miscTokens: {}
  }
};


// pick env
const envName = (process.env.ENV || 'dev').toLowerCase();

const envMap: Record<string, any> = {
  dev: devEnv,
  qa: qaEnv,
  stage: stageEnv,
};

const env = {
  ...baseEnv,
  ...(envMap[envName] || devEnv)
};

// The merged "config" exported everywhere
export type Secrets = typeof secretsImport;
export type Config = typeof env & { secrets: Secrets } & {
  // convenient top-level aliases for legacy code
  slackWebhook?: string;
  teamsWebhook?: string;
  ldSdkKey?: string;
  ldWriteKey?: string;
  twilioApiKey?: string;
};

export const config: Config = {
  ...env,
  secrets: secretsImport,
  // convenience aliases (populated from secrets where appropriate)
  slackWebhook: secretsImport?.slackWebhook,
  teamsWebhook: secretsImport?.teamsWebhook,
  ldSdkKey: secretsImport?.ldSdkKey,
  ldWriteKey: secretsImport?.ldWriteKey || env.ldWriteUrl || undefined,
  twilioApiKey: secretsImport?.twilioApiKey,
};

// default export if other modules import it
export default config;

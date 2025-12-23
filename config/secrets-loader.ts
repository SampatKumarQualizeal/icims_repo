// config/secrets/secrets-loader.ts
import { secrets as localSecrets } from './secrets/secrets.local';

// Define the Secrets interface
interface Secrets {
  [key: string]: string | undefined;
}

// Map of known secret paths to process.env names for CI
const secretEnvMapping = {
  'ats.uiUser': 'ATS_UI_USER',
  'ats.uiPass': 'ATS_UI_PASS',
  'ats.apiAdminUser': 'ATS_API_ADMIN_USER',
  'ats.apiAdminPassword': 'ATS_API_ADMIN_PASSWORD',
  'crm.username': 'CRM_USERNAME',
  'crm.password': 'CRM_PASSWORD',
  'slackWebhook': 'SLACK_WEBHOOK',
  'teamsWebhook': 'TEAMS_WEBHOOK',
  'ldSdkKey': 'LD_SDK_KEY',
  'ldWriteKey': 'LD_WRITE_KEY',
  'twilioApiKey': 'TWILIO_API_KEY',
  'cmsApiKey': 'CMS_API_KEY',
};

// Utility: set deep value
function setDeep(obj: any, path: string, value: any) {
  const parts = path.split('.');
  let current = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) current[parts[i]] = {};
    current = current[parts[i]];
  }

  current[parts[parts.length - 1]] = value;
}

// Utility: flatten nested secrets
function flattenSecrets(obj: any, prefix = ''): Secrets {
  const result: Secrets = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenSecrets(value, newKey));
    } else if (typeof value === 'string') {
      result[newKey] = value;
    }
  }

  return result;
}

export function loadSecrets(envName: string): Secrets {
  const isCI = !!process.env.CI;
  const secrets: Secrets = {};

  if (isCI) {
    // Load from process.env using the mapping
    for (const [path, envName] of Object.entries(secretEnvMapping)) {
      const val = process.env[envName];
      if (val) setDeep(secrets, path, val);
    }
  } else {
    // Local run → use secrets.local.ts
    // Flatten the nested structure to match the Secrets interface
    const flattened = flattenSecrets(localSecrets);
    globalThis.secrets = flattened;
    return flattened;
  }

  // For CI, make secrets available globally
  globalThis.secrets = secrets;
  return secrets;
}
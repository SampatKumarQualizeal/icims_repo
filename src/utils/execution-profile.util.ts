// src/utils/execution-profile.util.ts

import { config } from '@config/config';
import { loadSecrets } from '@config/secrets-loader';
import { loadEnvironment } from '@config/env-loader';

export function getExecutionProfile() {
  const env = loadEnvironment();
  const secrets = loadSecrets(env.name);

  const mode = env.executionMode ?? 'SAFE';

  // existing timeout/mode switching
  let profile: any;

  switch (mode) {
    case 'FAST':
      profile = {
        mode: 'FAST', retries: 1, evidence: false, timeouts: {
          pageLoad: 3000,
          component: 2000,
          navigation: 5000,
          api: 5000,
          poll: 4000,
          modal: 3000
        }
      };
      break;

    case 'DEBUG':
      profile = {
        mode: 'DEBUG', retries: 3, evidence: true, timeouts: {
          retryInterval: 1000,
          pageLoad: 15000,
          component: 8000,
          navigation: 20000,
          api: 15000,
          poll: 10000,
          modal: 8000
        }
      };
      break;

    case 'SAFE':
    default:
      profile = {
        mode: 'SAFE', retries: 2, evidence: true, timeouts: {
          retryInterval: 1000,
          pageLoad: 8000,
          component: 4000,
          navigation: 10000,
          api: 8000,
          poll: 6000,
          modal: 5000
        }
      };
  }

  return {
    ...profile,
    envName: env.name,
    env,
    secrets,
  };
}



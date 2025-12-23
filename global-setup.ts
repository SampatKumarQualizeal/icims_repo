import { FullConfig, BrowserType, chromium } from '@playwright/test';
import { getExecutionProfile } from './src/utils/execution-profile.util';
import { registerExternalSecrets } from './src/utils/secret-keys.util';

export default async function globalSetup(config: FullConfig) {
  const profile = getExecutionProfile();
  registerExternalSecrets(profile.secrets);

  console.log('[INIT] Loaded and registered secrets for sanitization');
  // Launch a temporary browser instance and immediately close startup pages/contexts
  // NOTE: keep this lightweight and not used in CI heavy runs unless needed
  const browser = await chromium.launch(); // headless by default
  try {
    for (const ctx of browser.contexts()) {
      for (const p of ctx.pages()) {
        try { await p.close(); } catch {}
      }
      try { await ctx.close(); } catch {}
    }
  } finally {
    await browser.close();
  }
}


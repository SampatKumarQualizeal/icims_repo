// src/utils/auth-helper.util.ts
import { Page } from '@playwright/test';
import { ATSLoginFlow } from '@src/flows/ats/common/ats.login.flow';
import { crmLogin } from '@src/flows/crm/common/crm.login.flow';
import config from '@config/config';
import { BaseTest } from './base-test.util';

export type RoleType = 'recruiter' | 'admin' | 'manager' | 'candidate';
export type SystemType = 'ats' | 'crm';

/**
 * Ensures authentication is handled correctly based on authManager configuration.
 * 
 * When authManager is DISABLED (dev/debug mode):
 * - Performs manual login using the appropriate login flow
 * - Returns { page, dispose: undefined }
 * 
 * When authManager is ENABLED (production mode):
 * - If role is 'recruiter': returns { page: authPage, dispose: undefined } (default role, no cleanup needed)
 * - If role is NOT 'recruiter': uses baseTest.as(role) and returns { page, dispose }
 * 
 * IMPORTANT: When dispose is provided, you MUST call it to clean up resources:
 * ```typescript
 * const { page, dispose } = await ensureAuth(baseTest, authPage, 'admin', 'ats');
 * try {
 *   const flow = new SomeFlow(baseTest, page);
 *   await flow.doSomething();
 * } finally {
 *   if (dispose) await dispose();
 * }
 * ```
 * 
 * @example Simple usage (recruiter or disabled authManager - no cleanup needed)
 * ```typescript
 * const { page } = await ensureAuth(baseTest, authPage, 'recruiter', 'ats');
 * const flow = new SomeFlow(baseTest, page);
 * ```
 * 
 * @example Admin role (requires cleanup)
 * ```typescript
 * const { page, dispose } = await ensureAuth(baseTest, authPage, 'admin', 'ats');
 * try {
 *   const flow = new AdminFlow(baseTest, page);
 *   await flow.performAdminAction();
 * } finally {
 *   if (dispose) await dispose();
 * }
 * ```
 */
export async function ensureAuth(
  baseTest: BaseTest,
  authPage: Page,
  role: RoleType = 'recruiter',
  system: SystemType = 'ats'
): Promise<{ page: Page; dispose?: () => Promise<void> }> {
  // When authManager is DISABLED → perform manual login
  if (config.disableAuthManager) {
    const page = baseTest.page;
    const creds = config.secrets[system].roleCredentials[role];
    
    if (!creds) {
      throw new Error(`No credentials found for role '${role}' in system '${system}'`);
    }

    if (system === 'ats') {
      const loginFlow = new ATSLoginFlow(page, baseTest.logger);
      await loginFlow.login(
        { username: creds.username, password: creds.password },
        `${system.toUpperCase()} ${role.charAt(0).toUpperCase() + role.slice(1)} User`
      );
    } else if (system === 'crm') {
      await crmLogin(page, {
        user: creds.username,
        password: creds.password
      });
    }

    // No disposal needed - using baseTest.page directly
    return { page, dispose: undefined };
  }

  // When authManager is ENABLED
  // authPage fixture provides 'recruiter' by default - no disposal needed
  if (role === 'recruiter') {
    return { page: authPage, dispose: undefined };
  }

  // For other roles, use baseTest.as() to get authenticated page for that role
  // IMPORTANT: Must return dispose function so caller can clean up
  const { base, dispose } = await baseTest.as(role);
  return { page: base.page, dispose };
}

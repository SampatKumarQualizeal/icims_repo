import type { Page, Browser } from '@playwright/test';
import type { Logger } from '@src/utils/logger.util';
import type { TabManager } from '@src/components/tab-manager.component';
import type { BaseTest } from '@src/utils/base-test.util';
import type { AuthManager } from '@src/utils/auth-manager.util';
import type { TestMetadata } from '@tests/governance/types';

declare module '@playwright/test' {
  // ----------------------------------------
  // Test-scoped fixtures
  // ----------------------------------------
  interface PlaywrightTestArgs {
    logger: Logger;            // test-level logger (child of workerLogger)
    metadata: TestMetadata;
    runPreChecks: () => Promise<void>;
    authPage: Page;
    rolePage: Page;
    tabs: TabManager;
    baseTest: BaseTest;
    testId: string;
    testData: any;
  }

  // ----------------------------------------
  // Worker-scoped fixtures
  // ----------------------------------------
  interface PlaywrightWorkerArgs {
    authManager: AuthManager;
    workerLogger: Logger;      // <-- ADD THIS (new worker-scoped fixture)
  }
}

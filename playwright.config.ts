import { defineConfig, devices } from '@playwright/test';
import os from 'os';
import { config } from './config';
import SanitizingReporter from './src/reporters/sanitizing-reporter';


const cpuCount = os.cpus().length || 2;
const isCI = !!process.env.CI;

export default defineConfig({
  globalSetup: require.resolve('./global-setup'),
  testDir: './tests',
  timeout: 10 * 60_000,
  expect: { timeout: 10_000 },
  forbidOnly: !!process.env.CI,
  workers: process.env.CI_WORKERS ? Number(process.env.CI_WORKERS) : undefined,
  globalTimeout: 30 * 60_000,
  retries: isCI ? 2 : 0,
  outputDir: 'test-results/',
  reporter: [
    ['./src/reporters/sanitizing-reporter.ts'],
    ['list'], 
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],
  

  // global "use" (typed)
  use: {
    actionTimeout: 60_000,
    navigationTimeout: 45_000,
    // baseURL: config.appBaseUrl,
    ignoreHTTPSErrors: true,
    // viewport: { width: 1920, height: 1080 },
    // deviceScaleFactor: 1,
    trace: 'on',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',

    // Add general launch flags that reduce Chrome startup UI
    launchOptions: {
      args: ['--disable-dev-shm-usage',
        // '--window-size=1920,1080',
        // '--force-device-scale-factor=1',
        // '--start-maximized',
        // '--disable-infobars',
        // '--disable-renderer-backgrounding'
      ],
    },
  },

  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        ...devices['Desktop Chromium'],
        // channel: 'chrome',
        headless: process.env.CI ? true : false
      },
      fullyParallel: true,
      // workers: 1,
    },
    // {
    //   name: 'firefox',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //     headless: false,
    //   },
    // },
  ],
});

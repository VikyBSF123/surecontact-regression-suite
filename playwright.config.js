import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  globalSetup: './utils/global-setup.js',
  globalTeardown: './utils/global-teardown.js',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  // Phase 0 flake policy: 0 retries locally, max 1 on CI
  retries: process.env.CI ? 1 : 0,
  // CI uses sharding (see .github/workflows/e2e.yml); locally use 2 workers
  workers: process.env.CI ? 2 : 2,
  timeout: 30000,
  expect: {
    timeout: 10000,
    // Visual regression — allowed pixel drift per screenshot
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    },
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.02,
    },
  },

  reporter: [
    // ── Monocart — beautiful interactive HTML report ──────────────────────
    [
      'monocart-reporter',
      {
        name: 'SureContact Platform — Regression Test Report',
        outputFile: 'monocart-report/index.html',

        // Columns shown in the report table
        columns: (defaultColumns) => {
          const index = defaultColumns.findIndex((column) => column.id === 'duration');
          defaultColumns.splice(index, 0, {
            id: 'retry',
            name: 'Retry',
            align: 'center',
            width: 60,
          });
          return defaultColumns;
        },

        // Summary trends / charts
        trends: './monocart-report/trends.json',

        // Global tags for all tests
        tags: {
          smoke: { style: { background: '#6E40C9' } },
          critical: { style: { background: '#E03A3A' } },
          regression: { style: { background: '#1D7FFA' } },
          api: { style: { background: '#0E9F6E' } },
          visual: { style: { background: '#F59E0B' } },
          a11y: { style: { background: '#8B5CF6' } },
          mocked: { style: { background: '#F97316' } },
          performance: { style: { background: '#06B6D4' } },
          security: { style: { background: '#DC2626' } },
        },

        // Screenshot / video / trace attachments shown inline
        attachmentPath: (currentPath) => currentPath,
      },
    ],

    // ── Built-in Playwright HTML (backup) ─────────────────────────────────
    ['html', { outputFolder: 'playwright-report', open: 'never' }],

    // ── Blob reporter — used in CI to merge sharded results ───────────────
    ...(process.env.CI ? [['blob', { outputDir: 'blob-report' }]] : []),

    // ── Terminal output ───────────────────────────────────────────────────
    ['list'],
  ],

  // webServer: Boot the Next.js frontend locally when USE_LOCAL_SERVER=true.
  // In CI the suite points directly at the deployed QA environment via BASE_URL.
  // Uncomment and adapt when running the full stack locally:
  //
  // webServer: process.env.USE_LOCAL_SERVER ? {
  //   command: process.env.CI ? 'npm run build && npm run start' : 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120000,
  //   env: { ...process.env },
  // } : undefined,

  use: {
    baseURL: process.env.BASE_URL || 'https://qaing.surecontact.com',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },

  projects: [
    // ── Auth setup (runs once, saves session) ─────────────────────────────
    {
      name: 'setup',
      testDir: './utils',
      testMatch: '**/auth.setup.js',
    },

    // ── Desktop browsers ──────────────────────────────────────────────────
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'utils/auth-state.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'utils/auth-state.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        storageState: 'utils/auth-state.json',
      },
      dependencies: ['setup'],
    },

    // ── Mobile viewports (Chromium engine) ────────────────────────────────
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        storageState: 'utils/auth-state.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 13'],
        storageState: 'utils/auth-state.json',
      },
      dependencies: ['setup'],
    },

    // ── Visual regression (Chromium only — snapshots are browser-specific) ──
    {
      name: 'visual',
      testMatch: '**/visual/**/*.spec.js',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'utils/auth-state.json',
        // Fixed viewport for reproducible screenshots
        viewport: { width: 1440, height: 900 },
      },
      dependencies: ['setup'],
    },

    // ── Accessibility (Chromium only — axe runs in-browser) ────────────────
    {
      name: 'accessibility',
      testMatch: '**/accessibility/**/*.spec.js',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'utils/auth-state.json',
      },
      dependencies: ['setup'],
    },
  ],
});

/**
 * Playwright Component Testing Config
 *
 * Tests individual React components in isolation — no full browser navigation,
 * no login, no network — just the component mounted in a minimal sandbox.
 *
 * Requires the surecontact-nextjs repo to be cloned alongside this suite.
 * Set COMPONENT_ROOT in .env to the path of the Next.js src/ directory.
 *
 * Run:  npm run test:components
 * Docs: https://playwright.dev/docs/test-components
 */
import { defineConfig, devices } from '@playwright/experimental-ct-react';

export default defineConfig({
  testDir: './tests/components',
  testMatch: '**/*.ct.js',

  timeout: 10000,
  retries: 0,
  workers: 4, // component tests are fast and safe to parallelise

  reporter: [['list'], ['html', { outputFolder: 'playwright-ct-report', open: 'never' }]],

  use: {
    ctPort: 3100,
    ctViteConfig: {
      // If the Next.js project is cloned locally, point to its path aliases here:
      // resolve: { alias: { '@': '/path/to/surecontact-nextjs/src' } },
    },
  },

  projects: [
    {
      name: 'components-chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'components-firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});

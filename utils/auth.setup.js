import { test as setup, expect } from '@playwright/test';
import { CREDENTIALS } from './test-data.js';

const AUTH_FILE = 'utils/auth-state.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');

  // Fill email — try label, then placeholder, then first email input
  const emailField = page.getByLabel(/email/i).first() || page.getByPlaceholder(/email/i).first();
  await emailField.fill(CREDENTIALS.valid.email);

  // Fill password — input[type=password] does NOT have role=textbox, use locator directly
  const passwordField = page.locator('input[type="password"]').first();
  await passwordField.fill(CREDENTIALS.valid.password);

  await page.getByRole('button', { name: /sign in/i }).click();

  await page.waitForURL(/dashboard/, { timeout: 15000 });

  await page.context().storageState({ path: AUTH_FILE });
});

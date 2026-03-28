import { test as setup, expect } from '@playwright/test';
import { CREDENTIALS } from './test-data.js';

const AUTH_FILE = 'utils/auth-state.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await expect(page).toHaveTitle(/Login/);

  await page.getByRole('textbox', { name: 'Email' }).fill(CREDENTIALS.valid.email);
  await page.getByRole('textbox', { name: 'Password' }).fill(CREDENTIALS.valid.password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await expect(page).toHaveURL(/dashboard/);

  await page.context().storageState({ path: AUTH_FILE });
});

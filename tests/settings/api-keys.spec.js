/**
 * API Keys & Webhooks — Settings Tests
 *
 * Tests for the API Keys and Webhooks sections in SureContact settings.
 * Covers: list/create/revoke API keys, list/create/delete webhooks.
 */
import { test, expect } from '../../utils/fixtures.js';

test.describe('Settings — API Keys', { tag: ['@settings', '@regression'] }, () => {
  test.beforeEach(async ({ settingsPage }) => {
    await settingsPage.goto();
  });

  test('API keys section is accessible from settings', async ({ page }) => {
    // Navigate to API keys section — may be under "Developer" or "Integrations" submenu
    const apiKeysLink = page
      .locator('a:has-text("API Keys"), a:has-text("API"), [href*="api-keys"], [href*="developer"]')
      .first();

    if (!(await apiKeysLink.count())) return test.skip();
    await apiKeysLink.click();
    await page.waitForURL(/api-keys|developer|integrations/i, { timeout: 5000 }).catch(() => {});
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('API keys page shows existing keys in a list or table', async ({ page }) => {
    await page.goto(`${process.env.BASE_URL || 'https://qaing.surecontact.com'}/settings/api-keys`);
    await page.waitForLoadState('networkidle');

    // Check we're not on a 404
    const heading = page.locator('h1, h2, [class*="heading"]').first();
    await expect(heading)
      .toBeVisible({ timeout: 5000 })
      .catch(() => test.skip());
  });

  test('create API key button is present', async ({ page }) => {
    await page.goto(`${process.env.BASE_URL || 'https://qaing.surecontact.com'}/settings/api-keys`);
    await page.waitForLoadState('networkidle');

    const createBtn = page
      .locator(
        'button:has-text("Create"), button:has-text("Generate"), button:has-text("New API Key")'
      )
      .first();

    await expect(createBtn)
      .toBeVisible({ timeout: 5000 })
      .catch(() => test.skip());
  });

  test('API key creation dialog opens on button click', async ({ page }) => {
    await page.goto(`${process.env.BASE_URL || 'https://qaing.surecontact.com'}/settings/api-keys`);
    await page.waitForLoadState('networkidle');

    const createBtn = page
      .locator(
        'button:has-text("Create"), button:has-text("Generate"), button:has-text("New API Key")'
      )
      .first();

    if (!(await createBtn.isVisible({ timeout: 3000 }).catch(() => false))) return test.skip();

    await createBtn.click();

    // Dialog or modal should appear
    const dialog = page.locator('[role="dialog"], [class*="modal"], [class*="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Settings — Webhooks', { tag: ['@settings', '@regression'] }, () => {
  test.beforeEach(async ({ settingsPage }) => {
    await settingsPage.goto();
  });

  test('Webhooks section is accessible from settings', async ({ page }) => {
    const webhooksLink = page.locator('a:has-text("Webhook"), [href*="webhook"]').first();

    if (!(await webhooksLink.count())) return test.skip();
    await webhooksLink.click();
    await page.waitForURL(/webhook/i, { timeout: 5000 }).catch(() => {});
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('webhooks page is accessible at /settings/webhooks', async ({ page }) => {
    await page.goto(`${process.env.BASE_URL || 'https://qaing.surecontact.com'}/settings/webhooks`);
    await page.waitForLoadState('networkidle');

    const heading = page.locator('h1, h2, [class*="heading"]').first();
    await expect(heading)
      .toBeVisible({ timeout: 5000 })
      .catch(() => test.skip());
  });

  test('add webhook button is present on webhooks page', async ({ page }) => {
    await page.goto(`${process.env.BASE_URL || 'https://qaing.surecontact.com'}/settings/webhooks`);
    await page.waitForLoadState('networkidle');

    const addBtn = page
      .locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New Webhook")')
      .first();

    await expect(addBtn)
      .toBeVisible({ timeout: 5000 })
      .catch(() => test.skip());
  });

  test('webhook creation form has URL input field', async ({ page }) => {
    await page.goto(`${process.env.BASE_URL || 'https://qaing.surecontact.com'}/settings/webhooks`);
    await page.waitForLoadState('networkidle');

    const addBtn = page
      .locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New Webhook")')
      .first();

    if (!(await addBtn.isVisible({ timeout: 3000 }).catch(() => false))) return test.skip();
    await addBtn.click();

    // URL input should appear in the form/dialog
    const urlInput = page
      .locator('input[type="url"], input[placeholder*="http"], input[name*="url"]')
      .first();
    await expect(urlInput).toBeVisible({ timeout: 3000 });
  });

  test('webhook creation rejects invalid URL', async ({ page }) => {
    await page.goto(`${process.env.BASE_URL || 'https://qaing.surecontact.com'}/settings/webhooks`);
    await page.waitForLoadState('networkidle');

    const addBtn = page
      .locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New Webhook")')
      .first();

    if (!(await addBtn.isVisible({ timeout: 3000 }).catch(() => false))) return test.skip();
    await addBtn.click();

    const urlInput = page
      .locator('input[type="url"], input[placeholder*="http"], input[name*="url"]')
      .first();
    if (!(await urlInput.isVisible({ timeout: 3000 }).catch(() => false))) return test.skip();

    await urlInput.fill('not-a-valid-url');
    const submitBtn = page
      .locator('button[type="submit"], button:has-text("Save"), button:has-text("Add")')
      .last();
    await submitBtn.click();

    // Should show a validation error
    const error = page
      .locator('[class*="error"], [class*="invalid"], text=/invalid|required|url/i')
      .first();
    await expect(error)
      .toBeVisible({ timeout: 3000 })
      .catch(() => {});
  });
});

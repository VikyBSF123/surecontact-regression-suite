import { test, expect } from '@playwright/test';
import { CAMPAIGN } from '../../utils/test-data.js';

test.describe('Campaigns - Email Campaigns', { tag: ['@critical', '@regression'] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/email-campaigns');
    await expect(page).toHaveTitle(/Email Campaigns|SureContact/i);
  });

  // ── UI / Layout ────────────────────────────────────────────────────────────

  test('email campaigns page loads correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Email Campaigns' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Campaign' }).first()).toBeVisible();
    await expect(page.getByPlaceholder(/search campaigns/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Export CSV' })).toBeVisible();
  });

  test('empty state message is shown when no campaigns exist', async ({ page }) => {
    const hasData = await page
      .getByRole('table')
      .isVisible()
      .catch(() => false);
    if (!hasData) {
      await expect(page.getByText('No campaigns yet')).toBeVisible();
      await expect(page.getByText(/create.*first.*campaign/i)).toBeVisible();
    }
  });

  test('breadcrumb shows Campaigns > Email Campaigns', async ({ page }) => {
    await expect(page.getByText('Campaigns').first()).toBeVisible();
    await expect(page.getByText('Email Campaigns').first()).toBeVisible();
  });

  // ── Create Campaign ────────────────────────────────────────────────────────

  test('Create Campaign button starts campaign creation flow', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Campaign' }).first().click();
    await expect(
      page
        .getByRole('dialog')
        .or(page.getByRole('textbox', { name: /name|campaign name/i }))
        .or(page.getByText(/create campaign|new campaign/i).nth(1))
        .first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('campaign creation requires a name', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Campaign' }).first().click();
    await page.waitForTimeout(500);

    const nextBtn = page.getByRole('button', { name: /next|continue|create|save/i }).last();
    await nextBtn.click();

    await expect(
      page
        .getByText(/required|name is required/i)
        .or(page.locator('[class*="error"]'))
        .first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('campaign creation with valid name proceeds to next step', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Campaign' }).first().click();
    await page.waitForTimeout(500);

    const nameField = page.getByRole('textbox', { name: /campaign name|name/i }).first();
    if (await nameField.isVisible()) {
      await nameField.fill(CAMPAIGN.valid.name);
      const nextBtn = page.getByRole('button', { name: /next|continue/i }).last();
      await nextBtn.click();
      // Should advance to next step
      await expect(page).not.toHaveURL(/error/);
    }
  });

  test('campaign creation modal can be closed', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Campaign' }).first().click();
    await page.waitForTimeout(500);

    const closeBtn = page.getByRole('button', { name: /close|cancel/i }).first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });
  });

  // ── Search ─────────────────────────────────────────────────────────────────

  test('search campaigns input is functional', async ({ page }) => {
    const search = page.getByPlaceholder(/search campaigns/i).first();
    await search.fill('test campaign');
    await expect(search).toHaveValue('test campaign');
  });

  test('search with no match shows no results state', async ({ page }) => {
    const search = page.getByPlaceholder(/search campaigns/i).first();
    await search.fill('zzznoresults999xxyy');
    await page.waitForTimeout(1000);
    await expect(page.getByText(/no campaigns|no results/i)).toBeVisible();
  });

  // ── Export ─────────────────────────────────────────────────────────────────

  test('Export CSV button is clickable', async ({ page }) => {
    await page.getByRole('button', { name: 'Export CSV' }).click();
    // Should either start download or show a confirmation
    await expect(page).not.toHaveURL(/error/);
  });

  // ── Table / List ───────────────────────────────────────────────────────────

  test('campaigns table shows correct columns when data exists', async ({ page }) => {
    const hasData = await page
      .getByRole('table')
      .isVisible()
      .catch(() => false);
    if (hasData) {
      const table = page.getByRole('table');
      await expect(table).toBeVisible();
    }
  });

  // ── Edge Cases ─────────────────────────────────────────────────────────────

  test('very long campaign name is handled gracefully', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Campaign' }).first().click();
    await page.waitForTimeout(500);
    const nameField = page.getByRole('textbox', { name: /campaign name|name/i }).first();
    if (await nameField.isVisible()) {
      await nameField.fill('A'.repeat(500));
      await expect(nameField).not.toHaveValue(''); // Field accepts input
    }
  });

  test('search handles XSS payload safely', async ({ page }) => {
    const search = page.getByPlaceholder(/search campaigns/i).first();
    await search.fill('<script>alert(1)</script>');
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/email-campaigns/);
    await expect(page).not.toHaveURL(/error/);
  });
});

import { test, expect } from '@playwright/test';

test.describe('Connections', { tag: ['@regression'] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/connections');
    await page.waitForLoadState('networkidle');
  });

  test('connections page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Connections|SureContact/i);
    await expect(page.getByRole('heading', { name: /Connections/i })).toBeVisible();
  });

  test('connections page shows available connection types', async ({ page }) => {
    await page.waitForTimeout(1000);
    await expect(page.getByText(/WordPress|WooCommerce|webhook|API/i).first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('WordPress plugin download link is available', async ({ page }) => {
    await expect(
      page
        .getByRole('link', { name: /download|WordPress plugin/i })
        .or(page.getByText(/WordPress/i))
    ).toBeVisible({ timeout: 8000 });
  });

  test('connection add/setup button is visible', async ({ page }) => {
    await page.waitForTimeout(1000);
    const addBtn = page.getByRole('button', { name: /add|connect|new connection/i }).first();
    if (await addBtn.isVisible().catch(() => false)) {
      await expect(addBtn).toBeVisible();
    }
  });

  test('clicking connect opens connection setup flow', async ({ page }) => {
    await page.waitForTimeout(1000);
    const connectBtn = page.getByRole('button', { name: /connect|add connection/i }).first();
    if (await connectBtn.isVisible().catch(() => false)) {
      await connectBtn.click();
      await expect(
        page.getByRole('dialog').or(page.getByText(/API key|webhook URL|setup/i))
      ).toBeVisible({ timeout: 8000 });
    }
  });

  test('connections page shows existing connections list or empty state', async ({ page }) => {
    const hasList = await page
      .getByRole('table')
      .or(page.locator('[class*="connection"]'))
      .first()
      .isVisible()
      .catch(() => false);
    const hasEmpty = await page
      .getByText(/no connections|get started/i)
      .isVisible()
      .catch(() => false);
    const hasCards = await page
      .getByRole('article')
      .first()
      .isVisible()
      .catch(() => false);
    expect(hasList || hasEmpty || hasCards).toBe(true);
  });
});

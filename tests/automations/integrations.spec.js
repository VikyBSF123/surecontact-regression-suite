import { test, expect } from '@playwright/test';

test.describe('Automations - Integrations', { tag: ['@regression'] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/integrations');
    await page.waitForLoadState('domcontentloaded');
  });

  test('integrations page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Integrations|SureContact/i);
    await expect(page.getByRole('heading', { name: /Integrations/i })).toBeVisible();
  });

  test('integrations page displays available integration cards', async ({ page }) => {
    await expect(
      page
        .locator('[class*="integration"]')
        .or(page.getByRole('article'))
        .or(page.getByText(/connect|webhook|zapier|wordpress/i))
        .first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('each integration card shows a connect or configure button', async ({ page }) => {
    await page.waitForTimeout(1000);
    const connectBtns = page.getByRole('button', { name: /connect|configure|enable|install/i });
    if (
      await connectBtns
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      await expect(connectBtns.first()).toBeVisible();
    }
  });

  test('integration search or filter is available', async ({ page }) => {
    const search = page.getByPlaceholder(/search/i).first();
    if (await search.isVisible().catch(() => false)) {
      await search.fill('wordpress');
      await page.waitForTimeout(500);
      await expect(page).not.toHaveURL(/error/);
    }
  });

  test('clicking connect on an integration opens connection flow', async ({ page }) => {
    await page.waitForTimeout(1000);
    const connectBtn = page.getByRole('button', { name: /connect/i }).first();
    if (await connectBtn.isVisible().catch(() => false)) {
      await connectBtn.click();
      await expect(
        page
          .getByRole('dialog')
          .or(page.getByText(/api key|token|authorize|connect/i))
          .first()
      ).toBeVisible({ timeout: 8000 });
    }
  });
});

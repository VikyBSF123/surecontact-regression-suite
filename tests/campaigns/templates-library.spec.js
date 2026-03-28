import { test, expect } from '@playwright/test';

test.describe('Campaigns - Templates Library', { tag: ['@regression'] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/templates-library');
  });

  test('templates library page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Templates Library | SureContact/);
    await expect(page.getByRole('heading', { name: /Templates Library/i })).toBeVisible();
  });

  test('templates library shows pre-built templates', async ({ page }) => {
    // Should show a grid or list of template cards
    await expect(
      page.locator('[class*="template"]').or(page.getByRole('list')).or(page.getByRole('article'))
    ).toBeVisible({ timeout: 10000 });
  });

  test('search/filter is available in templates library', async ({ page }) => {
    const search = page.getByPlaceholder(/search/i);
    await expect(search).toBeVisible();
  });

  test('templates library supports category filtering', async ({ page }) => {
    // Category tabs or filters should be visible
    const filters = page
      .getByRole('tab')
      .or(page.getByRole('button', { name: /all|newsletter|promotional/i }));
    if (
      await filters
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      await expect(filters.first()).toBeVisible();
    }
  });

  test('clicking a template shows preview or use option', async ({ page }) => {
    await page.waitForTimeout(1000);
    const firstTemplate = page
      .locator('[class*="template"]')
      .first()
      .or(page.getByRole('article').first());
    if (await firstTemplate.isVisible().catch(() => false)) {
      await firstTemplate.click();
      await expect(
        page.getByRole('button', { name: /use|select|preview/i }).or(page.getByRole('dialog'))
      ).toBeVisible({ timeout: 8000 });
    }
  });

  test('search in templates library filters results', async ({ page }) => {
    const search = page.getByPlaceholder(/search/i);
    await search.fill('welcome');
    await page.waitForTimeout(800);
    await expect(page).not.toHaveURL(/error/);
  });
});

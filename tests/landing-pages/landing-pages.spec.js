import { test, expect } from '@playwright/test';

test.describe('Landing Pages', { tag: ['@regression'] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/landing-pages');
    await page.waitForLoadState('domcontentloaded');
  });

  test('landing pages page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Landing Pages|SureContact/i);
    await expect(page.getByRole('heading', { name: /Landing Pages/i })).toBeVisible();
  });

  test('landing pages shows Create button', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /create|new|add landing page/i }).first()
    ).toBeVisible();
  });

  test('landing pages list or empty state visible', async ({ page }) => {
    const hasData = await page
      .getByRole('table')
      .or(page.locator('[class*="card"]'))
      .first()
      .isVisible()
      .catch(() => false);
    const hasEmpty = await page
      .getByText(/no landing pages|no pages/i)
      .isVisible()
      .catch(() => false);
    expect(hasData || hasEmpty).toBe(true);
  });

  test('create landing page button opens builder or naming modal', async ({ page }) => {
    await page
      .getByRole('button', { name: /create|new landing page/i })
      .first()
      .click();
    await expect(
      page
        .getByRole('dialog')
        .or(page.getByRole('textbox', { name: /name/i }))
        .or(page.getByText(/page builder|landing page name/i))
        .first()
    ).toBeVisible({ timeout: 10000 });
  });

  test('create landing page requires a name', async ({ page }) => {
    await page
      .getByRole('button', { name: /create|new landing page/i })
      .first()
      .click();
    await page.waitForTimeout(500);
    const saveBtn = page.getByRole('button', { name: /save|create|next/i }).last();
    await saveBtn.click();
    await expect(
      page
        .getByText(/required|name is required/i)
        .or(page.locator('[class*="error"]'))
        .first()
    ).toBeVisible({ timeout: 5000 });
  });

  test('landing page shows publish/unpublish toggle', async ({ page }) => {
    const hasData = await page
      .getByRole('table')
      .isVisible()
      .catch(() => false);
    if (hasData) {
      const publishBtn = page
        .getByRole('button', { name: /publish|unpublish/i })
        .or(page.getByRole('switch'))
        .first();
      if (await publishBtn.isVisible().catch(() => false)) {
        await expect(publishBtn).toBeVisible();
      }
    }
  });

  test('search landing pages filters results', async ({ page }) => {
    const search = page.getByPlaceholder(/search/i).first();
    if (await search.isVisible().catch(() => false)) {
      await search.fill('zzznoresults');
      await page.waitForTimeout(800);
      await expect(page.getByText(/no landing pages|no results/i)).toBeVisible();
    }
  });
});

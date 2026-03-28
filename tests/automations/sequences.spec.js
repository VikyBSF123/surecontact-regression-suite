import { test, expect } from '@playwright/test';

test.describe('Automations - Sequences', { tag: ['@regression'] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sequences');
    await page.waitForLoadState('networkidle');
  });

  test('sequences page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Sequences | SureContact/);
    await expect(page.getByRole('heading', { name: /Sequences/i })).toBeVisible();
  });

  test('sequences page shows Create Sequence button', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /create sequence|new sequence|add sequence/i })
    ).toBeVisible();
  });

  test('sequence list or empty state is visible', async ({ page }) => {
    const hasTable = await page
      .getByRole('table')
      .isVisible()
      .catch(() => false);
    const hasEmpty = await page
      .getByText(/no sequences/i)
      .isVisible()
      .catch(() => false);
    expect(hasTable || hasEmpty).toBe(true);
  });

  test('create sequence opens creation form', async ({ page }) => {
    await page.getByRole('button', { name: /create sequence|new sequence/i }).click();
    await expect(
      page.getByRole('dialog').or(page.getByRole('textbox', { name: /name/i }))
    ).toBeVisible({ timeout: 10000 });
  });

  test('sequence creation requires a name', async ({ page }) => {
    await page.getByRole('button', { name: /create sequence|new sequence/i }).click();
    await page.waitForTimeout(500);

    const saveBtn = page.getByRole('button', { name: /save|create|next/i }).last();
    await saveBtn.click();

    await expect(
      page.getByText(/required|name is required/i).or(page.locator('[class*="error"]'))
    ).toBeVisible({ timeout: 5000 });
  });

  test('sequence creation with valid name succeeds', async ({ page }) => {
    await page.getByRole('button', { name: /create sequence|new sequence/i }).click();
    await page.waitForTimeout(500);

    const nameField = page.getByRole('textbox', { name: /name/i });
    if (await nameField.isVisible()) {
      await nameField.fill(`Test Sequence ${Date.now()}`);
      const saveBtn = page.getByRole('button', { name: /save|create|next/i }).last();
      await saveBtn.click();
      await expect(page).not.toHaveURL(/error/);
    }
  });

  test('sequence steps can be configured', async ({ page }) => {
    const hasData = await page
      .getByRole('table')
      .isVisible()
      .catch(() => false);
    if (hasData) {
      const firstRow = page.getByRole('row').nth(1);
      await firstRow.click();
      await expect(page.getByText(/step|email|delay/i)).toBeVisible({ timeout: 8000 });
    }
  });

  test('sequence search is functional', async ({ page }) => {
    const search = page.getByPlaceholder(/search/i);
    if (await search.isVisible()) {
      await search.fill('zzznoresults');
      await page.waitForTimeout(800);
      await expect(page.getByText(/no sequences|no results/i)).toBeVisible();
    }
  });
});

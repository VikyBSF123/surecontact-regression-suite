import { test, expect } from '@playwright/test';
import { LIST } from '../../utils/test-data.js';

test.describe('CRM - Lists', { tag: ['@regression'] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/lists');
  });

  // ── UI / Layout ────────────────────────────────────────────────────────────

  test('lists page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Lists | SureContact/);
    await expect(page.getByRole('heading', { name: 'Lists' })).toBeVisible();
  });

  test('lists page shows Create List button', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /create list|add list|new list/i })
    ).toBeVisible();
  });

  test('lists page shows search input', async ({ page }) => {
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
  });

  test('empty state shown when no lists exist', async ({ page }) => {
    const hasData = await page
      .getByRole('table')
      .isVisible()
      .catch(() => false);
    if (!hasData) {
      await expect(page.getByText(/no lists/i)).toBeVisible();
    }
  });

  // ── Create List ────────────────────────────────────────────────────────────

  test('create list button opens creation form', async ({ page }) => {
    await page.getByRole('button', { name: /create list|add list|new list/i }).click();
    await expect(
      page.getByRole('dialog').or(page.getByRole('textbox', { name: /name/i }))
    ).toBeVisible({ timeout: 8000 });
  });

  test('create list with valid name succeeds', async ({ page }) => {
    await page.getByRole('button', { name: /create list|add list|new list/i }).click();
    await page.waitForTimeout(500);

    const nameField = page.getByRole('textbox', { name: /name/i });
    await nameField.fill(LIST.valid.name);

    const saveBtn = page.getByRole('button', { name: /save|create|add/i }).last();
    await saveBtn.click();

    await expect(
      page.getByText(/success|created|saved/i).or(page.getByText(LIST.valid.name))
    ).toBeVisible({ timeout: 10000 });
  });

  test('create list fails with empty name', async ({ page }) => {
    await page.getByRole('button', { name: /create list|add list|new list/i }).click();
    await page.waitForTimeout(500);

    const saveBtn = page.getByRole('button', { name: /save|create|add/i }).last();
    await saveBtn.click();

    await expect(
      page.getByText(/required|name is required/i).or(page.locator('[class*="error"]'))
    ).toBeVisible({ timeout: 5000 });
  });

  // ── Search ─────────────────────────────────────────────────────────────────

  test('search filters lists correctly', async ({ page }) => {
    const search = page.getByPlaceholder(/search/i);
    await search.fill('zzznoresults999');
    await page.waitForTimeout(800);
    await expect(page.getByText(/no lists|no results|not found/i)).toBeVisible();
  });

  // ── Edit / Delete ──────────────────────────────────────────────────────────

  test('list has edit and delete actions visible on hover/menu', async ({ page }) => {
    const hasData = await page
      .getByRole('table')
      .isVisible()
      .catch(() => false);
    if (hasData) {
      const firstRow = page.getByRole('row').nth(1);
      await firstRow.hover();
      const actions = page.getByRole('button', { name: /edit|delete|more|options/i });
      await expect(actions.first()).toBeVisible({ timeout: 5000 });
    }
  });

  // ── Edge Cases ─────────────────────────────────────────────────────────────

  test('search with special characters does not crash page', async ({ page }) => {
    const search = page.getByPlaceholder(/search/i);
    await search.fill('<>&"\'');
    await page.waitForTimeout(500);
    await expect(page).not.toHaveURL(/error/);
  });
});

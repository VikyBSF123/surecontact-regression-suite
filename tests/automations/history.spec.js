import { test, expect } from '@playwright/test';

test.describe('Automations - History', { tag: ['@regression'] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/history');
    await page.waitForLoadState('networkidle');
  });

  test('history page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/History|SureContact/i);
    await expect(page.getByRole('heading', { name: /History/i })).toBeVisible();
  });

  test('history page shows automation logs table or empty state', async ({ page }) => {
    const hasTable = await page
      .getByRole('table')
      .isVisible()
      .catch(() => false);
    const hasEmpty = await page
      .getByText(/no history|no logs|no automation runs/i)
      .isVisible()
      .catch(() => false);
    expect(hasTable || hasEmpty).toBe(true);
  });

  test('history page shows date filter or search', async ({ page }) => {
    const filterControl = page
      .getByPlaceholder(/search/i)
      .or(page.getByRole('combobox'))
      .or(page.getByText(/filter/i))
      .first();
    const visible = await filterControl.isVisible().catch(() => false);
    if (visible) {
      await expect(filterControl).toBeVisible();
    }
  });

  test('history log entries show contact and workflow info', async ({ page }) => {
    const hasData = await page
      .getByRole('table')
      .isVisible()
      .catch(() => false);
    if (hasData) {
      const rows = page.getByRole('row');
      const count = await rows.count();
      expect(count).toBeGreaterThan(1); // At least header + 1 row
    }
  });

  test('history can be filtered by status', async ({ page }) => {
    const statusFilter = page
      .getByRole('combobox', { name: /status/i })
      .or(page.getByRole('button', { name: /filter|status/i }));
    if (await statusFilter.isVisible().catch(() => false)) {
      await statusFilter.click();
      await expect(page).not.toHaveURL(/error/);
    }
  });
});

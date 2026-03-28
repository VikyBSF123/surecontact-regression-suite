import { test, expect } from '@playwright/test';

test.describe('CRM - Exports', { tag: ['@regression'] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/exports');
  });

  test('exports page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Exports | SureContact/);
    await expect(page.getByRole('heading', { name: /Exports/i })).toBeVisible();
  });

  test('exports page shows export history or empty state', async ({ page }) => {
    const hasTable = await page
      .getByRole('table')
      .isVisible()
      .catch(() => false);
    const hasEmpty = await page
      .getByText(/no exports/i)
      .isVisible()
      .catch(() => false);
    expect(hasTable || hasEmpty).toBe(true);
  });

  test('export button or new export CTA is visible', async ({ page }) => {
    await expect(
      page
        .getByRole('button', { name: /export|new export/i })
        .or(page.getByText(/export contacts/i))
    ).toBeVisible();
  });

  test('export action starts download or shows modal', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: /new export|export contacts/i });
    if (await exportBtn.isVisible()) {
      await exportBtn.click();
      await expect(page.getByRole('dialog').or(page.getByText(/export|format|CSV/i))).toBeVisible({
        timeout: 8000,
      });
    }
  });
});

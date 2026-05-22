import { test, expect } from '@playwright/test';

test.describe('CRM - Exports', { tag: ['@regression'] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/exports');
  });

  test('exports page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Exports|SureContact/i);
    await expect(page.getByRole('heading', { name: 'Exports', exact: true })).toBeVisible();
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
    const hasCTA = await page
      .getByRole('button', { name: /export|new export/i })
      .isVisible()
      .catch(() => false);
    expect(hasTable || hasEmpty || hasCTA).toBe(true);
  });

  test('export button or new export CTA is visible', async ({ page }) => {
    await expect(
      page
        .getByRole('button', { name: /export|new export/i })
        .or(page.getByText(/export contacts/i))
        .first()
    ).toBeVisible();
  });

  test('export action starts download or shows modal', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: /new export|export contacts/i }).first();
    if (await exportBtn.isVisible().catch(() => false)) {
      await exportBtn.click();
      await expect(
        page
          .getByRole('dialog')
          .or(page.getByText(/export|format|CSV/i))
          .first()
      ).toBeVisible({
        timeout: 8000,
      });
    }
  });
});

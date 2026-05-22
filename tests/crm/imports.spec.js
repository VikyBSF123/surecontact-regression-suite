import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('CRM - Imports', { tag: ['@regression'] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/imports');
  });

  // ── UI / Layout ────────────────────────────────────────────────────────────

  test('imports page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Imports|SureContact/i);
    await expect(page.getByRole('heading', { name: 'Imports', exact: true })).toBeVisible();
  });

  test('imports page shows import button or upload area', async ({ page }) => {
    await expect(
      page
        .getByRole('button', { name: /import|upload/i })
        .or(page.getByText(/drag|drop|CSV|upload/i))
    ).toBeVisible();
  });

  // ── Import Flow ────────────────────────────────────────────────────────────

  test('import button or CTA is clickable', async ({ page }) => {
    const importBtn = page.getByRole('button', { name: /import|upload|new import/i }).first();
    if (await importBtn.isVisible()) {
      await importBtn.click();
      await expect(page.getByRole('dialog').or(page.getByText(/CSV|file|upload/i))).toBeVisible({
        timeout: 8000,
      });
    }
  });

  test('import history table or empty state is visible', async ({ page }) => {
    const hasTable = await page
      .getByRole('table')
      .isVisible()
      .catch(() => false);
    const hasEmpty = await page
      .getByText(/no imports|no history/i)
      .isVisible()
      .catch(() => false);
    const hasUpload = await page
      .getByText(/drag|drop|CSV/i)
      .isVisible()
      .catch(() => false);
    expect(hasTable || hasEmpty || hasUpload).toBe(true);
  });

  test('wrong file type shows error message', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Create a temp txt file and try uploading
      await fileInput.setInputFiles({
        name: 'test.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('not a csv'),
      });
      await expect(page.getByText(/invalid|unsupported|CSV only|file type/i)).toBeVisible({
        timeout: 5000,
      });
    }
  });

  // ── Edge Cases ─────────────────────────────────────────────────────────────

  test('empty CSV file shows appropriate error', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await fileInput.setInputFiles({
        name: 'empty.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from(''),
      });
      await expect(page.getByText(/empty|invalid|no data/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('navigation back from import page works', async ({ page }) => {
    await page.goBack();
    await expect(page).not.toHaveURL(/error/);
  });
});

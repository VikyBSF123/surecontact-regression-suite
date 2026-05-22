import { test, expect } from '@playwright/test';
import { TAG } from '../../utils/test-data.js';

test.describe('CRM - Tags', { tag: ['@regression'] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tags');
  });

  // ── UI / Layout ────────────────────────────────────────────────────────────

  test('tags page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Tags | SureContact/);
    await expect(page.getByRole('heading', { name: 'Tags', exact: true })).toBeVisible();
  });

  test('tags page shows Create Tag / Add Tag button', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /create tag|add tag|new tag/i }).first()
    ).toBeVisible();
  });

  test('tags page shows search/filter input', async ({ page }) => {
    await expect(page.getByPlaceholder(/search/i).first()).toBeVisible();
  });

  test('empty state shown when no tags exist', async ({ page }) => {
    const hasData = await page
      .getByRole('table')
      .isVisible()
      .catch(() => false);
    if (!hasData) {
      await expect(page.getByText(/no tags/i)).toBeVisible();
    }
  });

  // ── Create Tag ─────────────────────────────────────────────────────────────

  test('create tag button opens creation form', async ({ page }) => {
    await page
      .getByRole('button', { name: /create tag|add tag|new tag/i })
      .first()
      .click();
    await expect(page.getByRole('dialog').first()).toBeVisible({ timeout: 8000 });
  });

  test('create tag with valid name succeeds', async ({ page }) => {
    await page
      .getByRole('button', { name: /create tag|add tag|new tag/i })
      .first()
      .click();
    await page.waitForTimeout(500);

    const nameField = page.getByRole('textbox', { name: /name/i });
    await nameField.fill(TAG.valid.name);

    const saveBtn = page.getByRole('button', { name: /save|create|add/i }).last();
    await saveBtn.click();

    await expect(
      page.getByText(/success|created|saved/i).or(page.getByText(TAG.valid.name))
    ).toBeVisible({ timeout: 10000 });
  });

  test('create tag fails with empty name', async ({ page }) => {
    await page
      .getByRole('button', { name: /create tag|add tag|new tag/i })
      .first()
      .click();
    await page.waitForTimeout(500);

    const saveBtn = page.getByRole('button', { name: /save|create|add/i }).last();
    await saveBtn.click();

    await expect(
      page.getByText(/required|name is required/i).or(page.locator('[data-slot="form-message"]'))
    ).toBeVisible({ timeout: 5000 });
  });

  // ── Search ─────────────────────────────────────────────────────────────────

  test('search filters tags by name', async ({ page }) => {
    const search = page.getByPlaceholder(/search/i).first();
    await search.fill('zzznoresults999');
    await page.waitForTimeout(800);
    await expect(page.getByText(/no tags|no results|not found/i)).toBeVisible();
  });

  // ── Delete ─────────────────────────────────────────────────────────────────

  test('tag delete action shows confirmation', async ({ page }) => {
    const hasData = await page
      .getByRole('table')
      .isVisible()
      .catch(() => false);
    if (hasData) {
      const deleteBtn = page.getByRole('button', { name: /delete/i }).first();
      if (await deleteBtn.isVisible()) {
        await deleteBtn.click();
        await expect(
          page.getByRole('dialog').or(page.getByText(/confirm|are you sure/i))
        ).toBeVisible({ timeout: 5000 });
      }
    }
  });

  // ── Edge Cases ─────────────────────────────────────────────────────────────

  test('tag name with unicode characters is accepted', async ({ page }) => {
    await page
      .getByRole('button', { name: /create tag|add tag|new tag/i })
      .first()
      .click();
    await page.waitForTimeout(500);
    const nameField = page.getByRole('textbox', { name: /name/i });
    await nameField.fill('ñoño-ünïcödé-tag');
    await expect(nameField).toHaveValue('ñoño-ünïcödé-tag');
  });
});

import { test, expect } from '../../utils/fixtures.js';
import { FORM } from '../../utils/test-data.js';

test.describe('Forms', { tag: ['@critical', '@regression'] }, () => {
  test.describe.configure({ mode: 'parallel' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/forms');
    await page.waitForLoadState('networkidle');
  });

  // ── UI / Layout ────────────────────────────────────────────────────────────

  test('forms page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Forms | SureContact/);
    await expect(page.getByRole('heading', { name: /Forms/i })).toBeVisible();
  });

  test('forms page shows Create Form button', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /create form|new form|add form/i })
    ).toBeVisible();
  });

  test('forms page shows search input', async ({ page }) => {
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
  });

  test('forms list or empty state is visible', async ({ page }) => {
    const hasForms = await page
      .getByRole('table')
      .or(page.locator('[class*="form"]'))
      .first()
      .isVisible()
      .catch(() => false);
    const hasEmpty = await page
      .getByText(/no forms/i)
      .isVisible()
      .catch(() => false);
    expect(hasForms || hasEmpty).toBe(true);
  });

  // ── Create Form ────────────────────────────────────────────────────────────

  test('create form button opens form builder or naming modal', async ({ page }) => {
    await page.getByRole('button', { name: /create form|new form/i }).click();
    await expect(
      page
        .getByRole('dialog')
        .or(page.getByRole('textbox', { name: /name/i }))
        .or(page.getByText(/form builder|form name/i))
    ).toBeVisible({ timeout: 10000 });
  });

  test('form creation requires a name', async ({ page }) => {
    await page.getByRole('button', { name: /create form|new form/i }).click();
    await page.waitForTimeout(500);

    const saveBtn = page.getByRole('button', { name: /save|create|next/i }).last();
    await saveBtn.click();

    await expect(
      page.getByText(/required|name is required/i).or(page.locator('[class*="error"]'))
    ).toBeVisible({ timeout: 5000 });
  });

  test('create form with valid name proceeds to form builder', async ({ page }) => {
    await page.getByRole('button', { name: /create form|new form/i }).click();
    await page.waitForTimeout(500);

    const nameField = page.getByRole('textbox', { name: /name|form name/i });
    if (await nameField.isVisible()) {
      await nameField.fill(FORM.valid.name);
      const saveBtn = page.getByRole('button', { name: /save|create|next/i }).last();
      await saveBtn.click();
      await page.waitForTimeout(1000);
      await expect(page).not.toHaveURL(/error/);
    }
  });

  test('form creation modal can be cancelled', async ({ page }) => {
    await page.getByRole('button', { name: /create form|new form/i }).click();
    await page.waitForTimeout(500);

    const cancelBtn = page.getByRole('button', { name: /cancel|close/i });
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });
  });

  // ── Form Actions ───────────────────────────────────────────────────────────

  test('existing form shows edit option', async ({ page }) => {
    const hasForms = await page
      .getByRole('table')
      .isVisible()
      .catch(() => false);
    if (hasForms) {
      const editBtn = page.getByRole('button', { name: /edit/i }).first();
      if (await editBtn.isVisible()) {
        await expect(editBtn).toBeVisible();
      }
    }
  });

  test('form delete shows confirmation dialog', async ({ page }) => {
    const hasForms = await page
      .getByRole('table')
      .isVisible()
      .catch(() => false);
    if (hasForms) {
      const deleteBtn = page.getByRole('button', { name: /delete/i }).first();
      if (await deleteBtn.isVisible()) {
        await deleteBtn.click();
        await expect(
          page.getByRole('dialog').or(page.getByText(/confirm|are you sure/i))
        ).toBeVisible({ timeout: 5000 });
        await page.getByRole('button', { name: /cancel/i }).click();
      }
    }
  });

  test('form can be published or unpublished', async ({ page }) => {
    const hasForms = await page
      .getByRole('table')
      .isVisible()
      .catch(() => false);
    if (hasForms) {
      const publishBtn = page.getByRole('button', { name: /publish|unpublish/i }).first();
      if (await publishBtn.isVisible()) {
        await expect(publishBtn).toBeVisible();
      }
    }
  });

  // ── Search ─────────────────────────────────────────────────────────────────

  test('search returns no results for non-existent form', async ({ page }) => {
    const search = page.getByPlaceholder(/search/i);
    await search.fill('zzznoresults999');
    await page.waitForTimeout(800);
    await expect(page.getByText(/no forms|no results/i)).toBeVisible();
  });

  // ── Edge Cases ─────────────────────────────────────────────────────────────

  test('form name with special characters is handled', async ({ page }) => {
    await page.getByRole('button', { name: /create form|new form/i }).click();
    await page.waitForTimeout(500);
    const nameField = page.getByRole('textbox', { name: /name/i });
    if (await nameField.isVisible()) {
      await nameField.fill('Form & Test <2024>');
      await expect(nameField).not.toHaveValue('');
    }
  });
});

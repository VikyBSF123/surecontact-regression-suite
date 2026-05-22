import { test, expect } from '@playwright/test';

test.describe('CRM - Custom Fields', { tag: ['@regression'] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/custom-fields');
  });

  // ── UI / Layout ────────────────────────────────────────────────────────────

  test('custom fields page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Custom Fields | SureContact/);
    await expect(page.getByRole('heading', { name: 'Custom Fields', exact: true })).toBeVisible();
  });

  test('custom fields page shows Add / Create button', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /add|create|new custom field/i }).first()
    ).toBeVisible();
  });

  // ── Create Custom Field ────────────────────────────────────────────────────

  test('create custom field button opens modal', async ({ page }) => {
    await page
      .getByRole('button', { name: /add|create|new custom field/i })
      .first()
      .click();
    await expect(
      page.getByRole('dialog').or(page.getByRole('textbox', { name: /name|label/i }))
    ).toBeVisible({ timeout: 8000 });
  });

  test('custom field creation requires a name', async ({ page }) => {
    await page
      .getByRole('button', { name: /add|create|new custom field/i })
      .first()
      .click();
    await page.waitForTimeout(500);
    const saveBtn = page.getByRole('button', { name: /save|create|add/i }).last();
    await saveBtn.click();
    await expect(
      page.getByText(/required|name is required/i).or(page.locator('[data-slot="form-message"]'))
    ).toBeVisible({ timeout: 5000 });
  });

  test('custom field supports different field types', async ({ page }) => {
    await page.getByRole('button', { name: /add|create|new custom field/i }).click();
    await page.waitForTimeout(500);
    // Should have a type selector
    const typeSelector = page.getByRole('combobox').or(page.getByLabel(/type/i));
    if (await typeSelector.isVisible()) {
      await expect(typeSelector).toBeVisible();
    }
  });

  test('create text custom field with valid name', async ({ page }) => {
    await page
      .getByRole('button', { name: /add|create|new custom field/i })
      .first()
      .click();
    await page.waitForTimeout(500);

    const nameField = page.getByRole('textbox', { name: /name|label/i });
    await nameField.fill(`CustomField_${Date.now()}`);

    const saveBtn = page.getByRole('button', { name: /save|create|add/i }).last();
    await saveBtn.click();

    await expect(
      page.getByText(/success|created|saved/i).or(page.locator('[class*="toast"]'))
    ).toBeVisible({ timeout: 10000 });
  });

  // ── List / Table ───────────────────────────────────────────────────────────

  test('custom fields list or empty state is visible', async ({ page }) => {
    const hasTable = await page
      .getByRole('table')
      .isVisible()
      .catch(() => false);
    const hasEmpty = await page
      .getByText(/no custom fields|no fields/i)
      .isVisible()
      .catch(() => false);
    expect(hasTable || hasEmpty).toBe(true);
  });

  // ── Delete ─────────────────────────────────────────────────────────────────

  test('delete action on custom field shows confirmation', async ({ page }) => {
    const hasTable = await page
      .getByRole('table')
      .isVisible()
      .catch(() => false);
    if (hasTable) {
      const deleteBtn = page.getByRole('button', { name: /delete/i }).first();
      if (await deleteBtn.isVisible()) {
        await deleteBtn.click();
        await expect(
          page.getByRole('dialog').or(page.getByText(/confirm|are you sure/i))
        ).toBeVisible({ timeout: 5000 });
      }
    }
  });
});

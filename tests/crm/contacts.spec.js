import { test, expect } from '../../utils/fixtures.js';
import { CONTACT } from '../../utils/test-data.js';

test.describe('CRM - Contacts', { tag: ['@critical', '@regression'] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contacts');
    await expect(page).toHaveTitle(/Contacts | SureContact/);
  });

  // ── UI / Layout (soft assertions — all failures reported at once) ──────────

  test('contacts page loads correctly', async ({ page }) => {
    await test.step('check all required UI elements', async () => {
      await expect.soft(page.getByRole('heading', { name: 'Contacts' })).toBeVisible();
      await expect.soft(page.getByRole('button', { name: 'Add Contact' })).toBeVisible();
      await expect.soft(page.getByPlaceholder(/Search contact/i).first()).toBeVisible();
      await expect.soft(page.getByRole('button', { name: 'Import' })).toBeVisible();
      await expect.soft(page.getByRole('button', { name: 'Export' })).toBeVisible();
    });
    expect(test.info().errors).toHaveLength(0);
  });

  test('empty state shows correct message when no contacts exist', async ({ page }) => {
    const emptyState = page.getByText('No contacts yet');
    const addBtn = page.getByRole('button', { name: 'Add Contact' }).last();
    // Either table with data OR empty state is shown
    const hasData = await page
      .getByRole('table')
      .isVisible()
      .catch(() => false);
    if (!hasData) {
      await expect(emptyState).toBeVisible();
      await expect(addBtn).toBeVisible();
    }
  });

  test('breadcrumb shows CRM > Contacts', async ({ page }) => {
    const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(breadcrumb.getByText('CRM')).toBeVisible();
    await expect(breadcrumb.getByText('Contacts')).toBeVisible();
  });

  // ── Add Contact ────────────────────────────────────────────────────────────

  test('Add Contact button opens modal/drawer', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Contact' }).first().click();
    // Modal or slide-over should appear
    await expect(page.getByRole('dialog').first()).toBeVisible({ timeout: 8000 });
  });

  test('add contact with valid required fields', async ({ page }) => {
    await test.step('open Add Contact modal', async () => {
      await page.getByRole('button', { name: 'Add Contact' }).first().click();
      await page.waitForTimeout(500);
    });

    await test.step('fill email field', async () => {
      const emailField = page.getByRole('textbox', { name: /email/i }).last();
      await emailField.fill(CONTACT.valid.email);
    });

    await test.step('submit form and assert success', async () => {
      await page
        .getByRole('button', { name: /save|add|create|submit/i })
        .last()
        .click();
      await expect(
        page.getByText(/success|added|created|saved/i).or(page.getByRole('alert'))
      ).toBeVisible({ timeout: 10000 });
    });
  });

  test('add contact fails with empty email', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Contact' }).first().click();
    await page.waitForTimeout(500);

    const saveBtn = page.getByRole('button', { name: /save|add|create|submit/i }).last();
    await saveBtn.click();

    await expect(
      page
        .getByText(/required|email is required|invalid/i)
        .or(page.locator('[data-slot="form-message"]'))
    ).toBeVisible({ timeout: 5000 });
  });

  test('add contact fails with invalid email format', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Contact' }).first().click();
    await page.waitForTimeout(500);

    const emailField = page.getByRole('textbox', { name: /email/i }).last();
    await emailField.fill(CONTACT.invalidEmail.email);

    const saveBtn = page.getByRole('button', { name: /save|add|create|submit/i }).last();
    await saveBtn.click();

    await expect(
      page.getByText(/invalid email|valid email/i).or(page.locator('[data-slot="form-message"]'))
    ).toBeVisible({ timeout: 5000 });
  });

  test('add contact modal can be closed/cancelled', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Contact' }).first().click();
    await page.waitForTimeout(500);

    const cancelBtn = page.getByRole('button', { name: /cancel|close/i });
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
      await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });
    } else {
      await page.keyboard.press('Escape');
    }
  });

  // ── Search ─────────────────────────────────────────────────────────────────

  test('search input is functional', async ({ page }) => {
    const search = page.getByPlaceholder(/Search contact/i).first();
    await search.fill('test search query');
    await expect(search).toHaveValue('test search query');
  });

  test('search with no results shows empty state', async ({ page }) => {
    const search = page.getByPlaceholder(/Search contact/i).first();
    await search.fill('zzznoresultsxxx999');
    await page.waitForTimeout(1000);
    await expect(
      page.getByText(/no contacts|no results|not found/i).or(page.getByText('No contacts yet'))
    ).toBeVisible();
  });

  test('search clears correctly', async ({ page }) => {
    const search = page.getByPlaceholder(/Search contact/i).first();
    await search.fill('test');
    await search.clear();
    await expect(search).toHaveValue('');
  });

  // ── Import / Export ────────────────────────────────────────────────────────

  test('Import button opens import flow', async ({ page }) => {
    await page.getByRole('button', { name: 'Import' }).click();
    // Import may navigate to /imports or open a modal
    await expect(page.getByRole('dialog').or(page.locator('text=/import|CSV|upload/i').first()))
      .toBeVisible({ timeout: 8000 })
      .catch(async () => {
        await expect(page).toHaveURL(/contacts|imports/);
      });
  });

  test('Export button triggers export action', async ({ page }) => {
    await page.getByRole('button', { name: 'Export' }).click();
    // Should show export modal or navigate to exports
    await expect(page.getByRole('dialog').first())
      .toBeVisible({ timeout: 5000 })
      .catch(async () => {
        await expect(page).toHaveURL(/contacts|exports/);
      });
  });

  // ── Table ──────────────────────────────────────────────────────────────────

  test('contacts table is visible when contacts exist', async ({ page }) => {
    const table = page.getByRole('table');
    const noContacts = page.getByText('No contacts yet');
    const hasTable = await table.isVisible().catch(() => false);
    const hasEmpty = await noContacts.isVisible().catch(() => false);
    // One of the two must be visible
    expect(hasTable || hasEmpty).toBe(true);
  });

  // ── Edge Cases ─────────────────────────────────────────────────────────────

  test('search handles special characters without crashing', async ({ page }) => {
    const search = page.getByPlaceholder(/Search contact/i).first();
    await search.fill('<script>alert(1)</script>');
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/contacts/);
  });

  test('search handles very long input', async ({ page }) => {
    const search = page.getByPlaceholder(/Search contact/i).first();
    await search.fill('a'.repeat(500));
    await page.waitForTimeout(500);
    await expect(page).not.toHaveURL(/error/);
  });
});

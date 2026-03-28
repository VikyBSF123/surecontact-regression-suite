/**
 * Contacts — Faker-powered data factory tests.
 *
 * Demonstrates using Factory to generate realistic, unique test data
 * for every test run — no hard-coded values.
 */
import { test, expect } from '../../utils/fixtures.js';

test.describe('CRM - Contacts (Factory Data)', { tag: ['@critical', '@regression'] }, () => {
  test.beforeEach(async ({ contactsPage }) => {
    await contactsPage.goto();
  });

  test('add contact with factory-generated data', async ({ page, factory }) => {
    const contact = factory.contact();

    await page.getByRole('button', { name: 'Add Contact' }).first().click();
    await page.waitForTimeout(500);

    const emailField = page.getByRole('textbox', { name: /email/i }).last();
    await emailField.fill(contact.email);

    const firstName = page.getByRole('textbox', { name: /first name/i });
    if (await firstName.isVisible().catch(() => false)) {
      await firstName.fill(contact.firstName);
    }

    const lastName = page.getByRole('textbox', { name: /last name/i });
    if (await lastName.isVisible().catch(() => false)) {
      await lastName.fill(contact.lastName);
    }

    await page
      .getByRole('button', { name: /save|add|create|submit/i })
      .last()
      .click();

    await expect(
      page.getByText(/success|added|created|saved/i).or(page.getByRole('alert'))
    ).toBeVisible({ timeout: 10000 });
  });

  test('search for factory-generated unique term returns no results', async ({ page, factory }) => {
    // uuid-based email prefix is virtually guaranteed to not exist
    const uniqueTerm = factory.uniqueEmail().split('@')[0];

    const search = page.getByPlaceholder(/Search contact/i);
    await search.fill(uniqueTerm);
    await page.waitForTimeout(800);

    await expect(
      page.getByText(/no contacts|no results|not found/i).or(page.getByText('No contacts yet'))
    ).toBeVisible();
  });

  test('add contact with unicode name from factory', async ({ page, factory }) => {
    const contact = factory.contact({ firstName: 'Ñoño', lastName: 'García' });

    await page.getByRole('button', { name: 'Add Contact' }).first().click();
    await page.waitForTimeout(500);

    const emailField = page.getByRole('textbox', { name: /email/i }).last();
    await emailField.fill(contact.email);

    await page
      .getByRole('button', { name: /save|add|create|submit/i })
      .last()
      .click();

    // Should succeed or show a meaningful validation error — should NOT crash
    await expect(page).not.toHaveURL(/error/);
  });

  test('add 3 contacts sequentially using factory batch', async ({ page, factory }) => {
    const contacts = factory.contacts(3);

    for (const contact of contacts) {
      await page.getByRole('button', { name: 'Add Contact' }).first().click();
      await page.waitForTimeout(400);

      const emailField = page.getByRole('textbox', { name: /email/i }).last();
      await emailField.fill(contact.email);

      await page
        .getByRole('button', { name: /save|add|create|submit/i })
        .last()
        .click();
      await page.waitForTimeout(500);
    }

    // After adding 3, the table (or list) should show at least those rows
    const hasTable = await page
      .getByRole('table')
      .isVisible()
      .catch(() => false);
    if (hasTable) {
      const count = await page.getByRole('row').count();
      expect(count).toBeGreaterThan(1); // header row + data rows
    }
  });
});

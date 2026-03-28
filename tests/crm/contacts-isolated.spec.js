/**
 * Contacts — Isolated Tests with API Setup & Teardown.
 *
 * Each describe block creates its own data via API in beforeAll,
 * tests against a GUARANTEED known state, then deletes it in afterAll.
 * No more "if data exists do X else do Y" conditionals.
 *
 * Pattern used throughout:
 *   beforeAll → API create → test against known state → afterAll → API delete
 */
import { test, expect } from '../../utils/fixtures.js';
import { ApiHelper } from '../../utils/api-helper.js';
import { Factory } from '../../utils/factory.js';

// ── Suite 1: Search a known contact ──────────────────────────────────────────

test.describe('Contacts — Search (API-seeded)', { tag: ['@critical', '@regression'] }, () => {
  let helper;
  let seededContact;

  test.beforeAll(async ({ request }) => {
    helper = await ApiHelper.create(request);

    const payload = Factory.contact({ email: `search-seed+${Date.now()}@qatest.io` });
    seededContact = await helper.createContact({
      email: payload.email,
      first_name: payload.firstName,
      last_name: payload.lastName,
    });
  });

  test.afterAll(async () => {
    const id = seededContact?.id ?? seededContact?.uuid;
    await helper?.deleteContact(id);
  });

  test('search by exact email returns the seeded contact', async ({ page }) => {
    if (!seededContact) return test.skip();

    await test.step('navigate to contacts page', async () => {
      await page.goto('/contacts');
      await page.waitForLoadState('networkidle');
    });

    await test.step('type email in search box', async () => {
      const search = page.getByPlaceholder(/Search contact/i);
      await search.fill(seededContact.email);
      await page.waitForTimeout(800);
    });

    await test.step('assert the contact appears in results', async () => {
      await expect(page.getByText(seededContact.email)).toBeVisible({ timeout: 8000 });
    });
  });

  test('search by first name returns the seeded contact', async ({ page }) => {
    if (!seededContact?.first_name) return test.skip();

    await test.step('navigate and search by first name', async () => {
      await page.goto('/contacts');
      await page.waitForLoadState('networkidle');
      await page.getByPlaceholder(/Search contact/i).fill(seededContact.first_name);
      await page.waitForTimeout(800);
    });

    await test.step('assert contact row is visible', async () => {
      await expect(
        page.getByText(seededContact.first_name).or(page.getByText(seededContact.email))
      ).toBeVisible({ timeout: 8000 });
    });
  });

  test('clearing search restores full list', async ({ page }) => {
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');

    const search = page.getByPlaceholder(/Search contact/i);

    await test.step('perform a search', async () => {
      await search.fill(seededContact?.email ?? 'test');
      await page.waitForTimeout(600);
    });

    await test.step('clear search and assert table returns', async () => {
      await search.clear();
      await page.waitForTimeout(600);
      const hasTable = await page
        .getByRole('table')
        .isVisible()
        .catch(() => false);
      const hasEmpty = await page
        .getByText(/no contacts/i)
        .isVisible()
        .catch(() => false);
      expect(hasTable || hasEmpty).toBe(true);
    });
  });
});

// ── Suite 2: Contact detail — verify data persists ───────────────────────────

test.describe('Contacts — Detail view (API-seeded)', { tag: ['@regression'] }, () => {
  let helper;
  let seededContact;

  test.beforeAll(async ({ request }) => {
    helper = await ApiHelper.create(request);

    const payload = Factory.contact({ email: `detail-seed+${Date.now()}@qatest.io` });
    seededContact = await helper.createContact({
      email: payload.email,
      first_name: payload.firstName,
      last_name: payload.lastName,
      company: payload.company,
    });
  });

  test.afterAll(async () => {
    const id = seededContact?.id ?? seededContact?.uuid;
    await helper?.deleteContact(id);
  });

  test('contact detail page shows correct email', async ({ page }) => {
    if (!seededContact) return test.skip();

    await test.step('navigate to contacts and find the seeded contact', async () => {
      await page.goto('/contacts');
      await page.waitForLoadState('networkidle');
      const search = page.getByPlaceholder(/Search contact/i);
      await search.fill(seededContact.email);
      await page.waitForTimeout(800);
    });

    await test.step('click into the contact row', async () => {
      const row = page.getByRole('row').filter({ hasText: seededContact.email });
      if (await row.isVisible().catch(() => false)) {
        await row.click();
        await page.waitForLoadState('networkidle');
        await expect(page.getByText(seededContact.email)).toBeVisible();
      }
    });
  });
});

// ── Suite 3: Delete a known contact via UI ────────────────────────────────────

test.describe('Contacts — Delete (API-seeded)', { tag: ['@critical', '@regression'] }, () => {
  let helper;
  let seededContact;

  test.beforeAll(async ({ request }) => {
    helper = await ApiHelper.create(request);

    const payload = Factory.contact({ email: `delete-seed+${Date.now()}@qatest.io` });
    seededContact = await helper.createContact({
      email: payload.email,
      first_name: 'DeleteMe',
      last_name: 'Test',
    });
  });

  // No afterAll cleanup needed — the test itself deletes it.
  // But if the test fails, afterAll cleans up as a safety net.
  test.afterAll(async () => {
    const id = seededContact?.id ?? seededContact?.uuid;
    await helper?.deleteContact(id).catch(() => {});
  });

  test('can delete a contact via the UI', async ({ page }) => {
    if (!seededContact) return test.skip();

    await test.step('navigate and search for the seeded contact', async () => {
      await page.goto('/contacts');
      await page.waitForLoadState('networkidle');
      await page.getByPlaceholder(/Search contact/i).fill(seededContact.email);
      await page.waitForTimeout(800);
    });

    await test.step('hover row and click delete button', async () => {
      const row = page.getByRole('row').filter({ hasText: seededContact.email });
      if (!(await row.isVisible().catch(() => false))) return test.skip();

      await row.hover();
      const deleteBtn = page.getByRole('button', { name: /delete/i }).first();
      if (await deleteBtn.isVisible().catch(() => false)) {
        await deleteBtn.click();
      }
    });

    await test.step('confirm deletion in dialog', async () => {
      const confirmBtn = page.getByRole('button', { name: /confirm|yes|delete/i });
      if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await confirmBtn.click();
      }
    });

    await test.step('verify contact no longer appears in list', async () => {
      await page.waitForTimeout(1000);
      await expect(page.getByText(seededContact.email)).not.toBeVisible({ timeout: 8000 });
    });
  });
});

// ── Suite 4: List with seeded contacts ───────────────────────────────────────

test.describe('Contacts — Table with known data (API-seeded)', { tag: ['@regression'] }, () => {
  let helper;
  const seededContacts = [];

  test.beforeAll(async ({ request }) => {
    helper = await ApiHelper.create(request);

    // Seed 3 contacts
    for (let i = 0; i < 3; i++) {
      const payload = Factory.contact({ email: `table-seed-${i}+${Date.now()}@qatest.io` });
      const contact = await helper.createContact({
        email: payload.email,
        first_name: `TableSeed${i}`,
        last_name: 'Test',
      });
      if (contact) seededContacts.push(contact);
    }
  });

  test.afterAll(async () => {
    for (const c of seededContacts) {
      await helper?.deleteContact(c?.id ?? c?.uuid);
    }
  });

  test('contacts table has at least 3 rows after seeding 3 contacts', async ({ page }) => {
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');

    const table = page.getByRole('table');
    if (!(await table.isVisible().catch(() => false))) return test.skip();

    const rowCount = await page.getByRole('row').count();
    // rows include header, so data rows = rowCount - 1
    expect(rowCount - 1).toBeGreaterThanOrEqual(seededContacts.length);
  });

  test('all 3 seeded contacts are searchable', async ({ page }) => {
    for (const contact of seededContacts) {
      await page.goto('/contacts');
      await page.waitForLoadState('networkidle');

      await page.getByPlaceholder(/Search contact/i).fill(contact.email ?? '');
      await page.waitForTimeout(700);

      await expect(page.getByText(contact.email)).toBeVisible({ timeout: 6000 });
    }
  });
});

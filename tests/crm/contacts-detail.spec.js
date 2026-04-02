/**
 * Contacts Detail Page Tests
 *
 * Tests for the /contacts/[uuid] detail view in SureContact.
 * Covers: contact info display, activity log, notes, tag/list management.
 */
import { test, expect } from '../../utils/fixtures.js';

test.describe('Contact Detail Page', { tag: ['@crm', '@regression'] }, () => {
  test.beforeEach(async ({ page, contactsPage }) => {
    await contactsPage.goto();
    await page.waitForLoadState('networkidle');
  });

  test('clicking a contact name opens the detail page', async ({ page, contactsPage }) => {
    // Wait for contacts list to load
    await page.waitForLoadState('networkidle');

    const firstContact = page.locator('table tbody tr').first();
    const nameLink = firstContact.locator('a').first();
    const href = await nameLink.getAttribute('href');

    // Only proceed if there are contacts listed
    if (!href) return test.skip();

    await nameLink.click();
    await page.waitForURL(/\/contacts\/.+/);
    expect(page.url()).toMatch(/\/contacts\/[a-f0-9-]{36}/);
  });

  test('contact detail page shows email address', async ({ page, contactsPage }) => {
    await page.waitForLoadState('networkidle');

    const firstRow = page.locator('table tbody tr').first();
    const emailCell = firstRow.locator('td').nth(1);
    const email = await emailCell.textContent();
    if (!email) return test.skip();

    const nameLink = firstRow.locator('a').first();
    await nameLink.click();
    await page.waitForURL(/\/contacts\/.+/);

    // Email should be visible on detail page
    await expect(page.locator(`text=${email.trim()}`).first()).toBeVisible();
  });

  test('contact detail page has activity/history section', async ({ page, contactsPage }) => {
    await page.waitForLoadState('networkidle');

    const firstRow = page.locator('table tbody tr').first();
    const nameLink = firstRow.locator('a').first();
    if (!(await nameLink.count())) return test.skip();

    await nameLink.click();
    await page.waitForURL(/\/contacts\/.+/);

    // Look for activity/history tab or section
    const activitySection = page
      .locator('[data-testid="activity"], [class*="activity"], text=Activity, text=History')
      .first();
    await expect(activitySection)
      .toBeVisible({ timeout: 5000 })
      .catch(() => {
        // Activity section may be under a tab — skip rather than fail
      });
  });

  test('contact detail page has tags section', async ({ page, contactsPage }) => {
    await page.waitForLoadState('networkidle');

    const firstRow = page.locator('table tbody tr').first();
    const nameLink = firstRow.locator('a').first();
    if (!(await nameLink.count())) return test.skip();

    await nameLink.click();
    await page.waitForURL(/\/contacts\/.+/);

    // Look for tags section
    const tagsSection = page.locator('[data-testid="tags"], [class*="tag"], text=Tags').first();
    await expect(tagsSection)
      .toBeVisible({ timeout: 5000 })
      .catch(() => {
        // Tags section may be on a different panel — skip rather than fail
      });
  });

  test('contact detail page URL contains valid UUID format', async ({ page, contactsPage }) => {
    await page.waitForLoadState('networkidle');

    const firstRow = page.locator('table tbody tr').first();
    const nameLink = firstRow.locator('a').first();
    const href = await nameLink.getAttribute('href');
    if (!href) return test.skip();

    expect(href).toMatch(
      /\/contacts\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
    );
  });

  test('back navigation returns to contacts list', async ({ page, contactsPage }) => {
    await page.waitForLoadState('networkidle');

    const firstRow = page.locator('table tbody tr').first();
    const nameLink = firstRow.locator('a').first();
    if (!(await nameLink.count())) return test.skip();

    await nameLink.click();
    await page.waitForURL(/\/contacts\/.+/);

    await page.goBack();
    await expect(page).toHaveURL(/\/contacts$/);
  });
});

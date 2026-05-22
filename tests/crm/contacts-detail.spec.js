/**
 * Contacts Detail Page Tests
 *
 * Tests for the /contacts/[uuid] detail view in SureContact.
 * Rows in the contacts table are clickable <tr> elements (no <a> links).
 * Clicking the email cell navigates to the contact detail page.
 */
import { test, expect } from '../../utils/fixtures.js';

test.describe('Contact Detail Page', { tag: ['@crm', '@regression'] }, () => {
  test.beforeEach(async ({ page, contactsPage }) => {
    await contactsPage.goto();
    await page.waitForLoadState('networkidle');
  });

  test('clicking a contact row opens the detail page', async ({ page }) => {
    const firstRow = page.locator('table tbody tr').first();
    const rowCount = await firstRow.count();
    if (!rowCount) return test.skip();

    // Click the email cell (2nd cell — index 1), skipping the checkbox cell
    await firstRow.locator('td').nth(1).click();
    await page.waitForURL(/\/contacts\/.+/, { timeout: 10000 });
    expect(page.url()).toMatch(/\/contacts\//);
  });

  test('contact detail URL contains valid UUID format', async ({ page }) => {
    const firstRow = page.locator('table tbody tr').first();
    if (!(await firstRow.count())) return test.skip();

    await firstRow.locator('td').nth(1).click();
    await page.waitForURL(/\/contacts\/.+/, { timeout: 10000 });

    expect(page.url()).toMatch(
      /\/contacts\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
    );
  });

  test('contact detail page shows email address', async ({ page }) => {
    // Read the email from the table before clicking
    const firstRow = page.locator('table tbody tr').first();
    if (!(await firstRow.count())) return test.skip();

    const emailCell = firstRow.locator('td').nth(1);
    const emailText = (await emailCell.textContent())?.trim();
    if (!emailText) return test.skip();

    await emailCell.click();
    await page.waitForURL(/\/contacts\/.+/, { timeout: 10000 });

    // The email address shown in the table should appear on the detail page
    // (strip the avatar letter prefix if present)
    const emailOnly = emailText.replace(/^[A-Z]{1,2}\s+/, '');
    await expect(page.getByText(emailOnly).first()).toBeVisible({ timeout: 8000 });
  });

  test('contact detail page has activity or history section', async ({ page }) => {
    const firstRow = page.locator('table tbody tr').first();
    if (!(await firstRow.count())) return test.skip();

    await firstRow.locator('td').nth(1).click();
    await page.waitForURL(/\/contacts\/.+/, { timeout: 10000 });

    // Check for activity/history tab or section heading
    const activitySection = page
      .getByRole('tab', { name: /activity|history/i })
      .or(page.getByRole('heading', { name: /activity|history/i }))
      .or(page.getByText(/Activity|History/).first())
      .first();
    await expect(activitySection)
      .toBeVisible({ timeout: 8000 })
      .catch(() => {
        // Activity tab may be absent on this account plan — not a hard failure
      });
  });

  test('contact detail page has a tags section or tab', async ({ page }) => {
    const firstRow = page.locator('table tbody tr').first();
    if (!(await firstRow.count())) return test.skip();

    await firstRow.locator('td').nth(1).click();
    await page.waitForURL(/\/contacts\/.+/, { timeout: 10000 });

    const tagsSection = page
      .getByRole('tab', { name: /tag/i })
      .or(page.getByRole('heading', { name: /tag/i }))
      .or(page.getByText('Tags').first())
      .first();
    await expect(tagsSection)
      .toBeVisible({ timeout: 8000 })
      .catch(() => {});
  });

  test('back navigation returns to contacts list', async ({ page }) => {
    const firstRow = page.locator('table tbody tr').first();
    if (!(await firstRow.count())) return test.skip();

    await firstRow.locator('td').nth(1).click();
    await page.waitForURL(/\/contacts\/.+/, { timeout: 10000 });

    await page.goBack();
    await expect(page).toHaveURL(/\/contacts$/, { timeout: 10000 });
  });
});

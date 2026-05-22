/**
 * Infrastructure Health Check — Phase 0
 *
 * Validates that the Playwright + CI + Fixtures setup is wired correctly.
 * Does NOT test application features — those live in phase-specific PRs.
 *
 * Phase progression:
 *   Phase 0 (this PR):  infrastructure only → tests/infrastructure/
 *   Phase 1:            CRM tests           → tests/crm/
 *   Phase 2:            Campaigns tests     → tests/campaigns/
 *   Phase 3:            Automations tests   → tests/automations/
 *   ...
 */
import { test, expect } from '../../utils/fixtures.js';
import { CONTACT, CAMPAIGN, WORKFLOW, CREDENTIALS, BASE_URL } from '../../utils/test-data.js';
import { ContactsPage } from '../../utils/pages/ContactsPage.js';

test.describe('Infrastructure Health Check', { tag: ['@infrastructure', '@smoke'] }, () => {
  test('auth session is active — protected route reachable without redirect', async ({ page }) => {
    await page.goto('/dashboard');
    // auth.setup.js must have saved a valid session — we should NOT land on /login
    await expect(page).not.toHaveURL(/\/login/);
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  test('base URL responds without 5xx error', async ({ page }) => {
    const response = await page.goto('/dashboard');
    expect(response.status()).toBeLessThan(500);
    await expect(page).not.toHaveURL(/error|5\d\d/);
  });

  test('ContactsPage object is importable and exposes expected API', async ({ page }) => {
    const contactsPage = new ContactsPage(page);
    // Verify the public interface expected by Phase 1 CRM tests
    expect(typeof contactsPage.goto).toBe('function');
    expect(typeof contactsPage.openAddContact).toBe('function');
    expect(typeof contactsPage.search).toBe('function');
    expect(typeof contactsPage.hasData).toBe('function');
    expect(typeof contactsPage.isEmpty).toBe('function');
    // Navigate via the page object — must not throw or redirect to login
    await contactsPage.goto();
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('test-data.js exports well-formed fixtures for all phases', async () => {
    // CONTACT — Phase 1 (CRM)
    expect(CONTACT.valid).toHaveProperty('email');
    expect(CONTACT.valid).toHaveProperty('firstName');
    expect(CONTACT.invalidEmail).toHaveProperty('email');
    // CAMPAIGN — Phase 2 (Campaigns)
    expect(CAMPAIGN.valid).toHaveProperty('name');
    // WORKFLOW — Phase 3 (Automations)
    expect(WORKFLOW.valid).toHaveProperty('name');
    // Auth credentials — used by auth.setup.js
    expect(CREDENTIALS.valid).toHaveProperty('email');
    expect(CREDENTIALS.valid).toHaveProperty('password');
    // BASE_URL is a valid URL
    expect(BASE_URL).toMatch(/^https?:\/\//);
  });

  test('custom fixtures extend Playwright — page and context are injected', async ({
    page,
    context,
  }) => {
    expect(page).toBeDefined();
    expect(context).toBeDefined();
    // Confirm the fixture-provided page navigates correctly
    await page.goto('/dashboard');
    await expect(page).not.toHaveURL(/\/login/);
  });
});

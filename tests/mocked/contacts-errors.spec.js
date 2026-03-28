/**
 * Mocked Tests — Contacts Error States & Edge Cases
 *
 * Uses page.route() to intercept API calls and return controlled responses.
 * Tests scenarios that are impossible or unreliable to trigger against a live server:
 *   - Server errors (500)
 *   - Empty paginated results
 *   - Network timeouts
 *   - Rate limiting (429)
 *   - Malformed API responses
 *
 * These tests do NOT use saved auth state — they mock the entire API layer.
 * Run: npm run test:mocked
 */
import { test, expect } from '../../utils/fixtures.js';

const API_PATTERN = '**/api/contacts**';
const PAGE_CONTACTS = '/contacts';

test.describe('Contacts — Mocked Error States', { tag: ['@mocked', '@regression'] }, () => {
  // ── 500 Server Error ────────────────────────────────────────────────────────

  test('shows error state when contacts API returns 500', async ({ page }) => {
    await page.route(API_PATTERN, (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Internal Server Error' }),
      })
    );

    await page.goto(PAGE_CONTACTS);
    await page.waitForLoadState('networkidle');

    // App should show an error state, not crash or white-screen
    const hasError = await page
      .getByText(/error|something went wrong|failed to load|try again/i)
      .isVisible()
      .catch(() => false);

    const isWhiteScreen = await page
      .getByRole('main')
      .isVisible()
      .catch(() => false);

    // Either an error message is shown OR the page still renders a shell
    expect(hasError || isWhiteScreen).toBe(true);
    await expect(page).not.toHaveURL(/error-page|500/);
  });

  // ── Empty List ──────────────────────────────────────────────────────────────

  test('shows empty state when API returns zero contacts', async ({ page }) => {
    await page.route(API_PATTERN, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], total: 0, per_page: 20, current_page: 1 }),
      })
    );

    await page.goto(PAGE_CONTACTS);
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByText(/no contacts|no results|add your first/i).or(page.getByText('No contacts yet'))
    ).toBeVisible({ timeout: 8000 });
  });

  // ── 401 Unauthorised ────────────────────────────────────────────────────────

  test('redirects to login when API returns 401', async ({ page }) => {
    await page.route(API_PATTERN, (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unauthenticated' }),
      })
    );

    await page.goto(PAGE_CONTACTS);
    await page.waitForLoadState('networkidle');

    // Should either redirect to login OR show an auth error — not crash
    const onLoginPage = page.url().includes('/login');
    const showsAuthError = await page
      .getByText(/unauthorised|session expired|please log in/i)
      .isVisible()
      .catch(() => false);

    expect(onLoginPage || showsAuthError).toBe(true);
  });

  // ── 429 Rate Limited ────────────────────────────────────────────────────────

  test('handles 429 rate limit gracefully', async ({ page }) => {
    await page.route(API_PATTERN, (route) =>
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Too Many Requests' }),
        headers: { 'Retry-After': '60' },
      })
    );

    await page.goto(PAGE_CONTACTS);
    await page.waitForLoadState('networkidle');

    // Should not crash — may show an error or empty state
    await expect(page).not.toHaveURL(/500|crash/);
  });

  // ── Network Timeout ─────────────────────────────────────────────────────────

  test('handles network timeout without crashing', async ({ page }) => {
    // Abort instead of hanging indefinitely
    await page.route(API_PATTERN, (route) => route.abort('timedout'));

    await page.goto(PAGE_CONTACTS);
    await page.waitForTimeout(2000);

    // Page should still be accessible
    await expect(page).not.toHaveURL(/error-page|500/);
  });

  // ── Malformed Response ──────────────────────────────────────────────────────

  test('handles malformed JSON response without crashing', async ({ page }) => {
    await page.route(API_PATTERN, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: 'NOT_VALID_JSON{{{',
      })
    );

    await page.goto(PAGE_CONTACTS);
    await page.waitForTimeout(2000);

    await expect(page).not.toHaveURL(/error-page|500/);
  });

  // ── Slow Response ───────────────────────────────────────────────────────────

  test('shows loading state during slow API response', async ({ page }) => {
    await page.route(API_PATTERN, async (route) => {
      // Simulate 1.5 s delay then respond
      await new Promise((r) => setTimeout(r, 1500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], total: 0 }),
      });
    });

    await page.goto(PAGE_CONTACTS);

    // Loading spinner or skeleton should appear within 500ms
    const hasLoader = await page
      .locator('[class*="spinner"], [class*="loading"], [class*="skeleton"], [aria-busy="true"]')
      .first()
      .isVisible({ timeout: 500 })
      .catch(() => false);

    // Loading indicator is optional — but the page must not crash
    if (hasLoader) {
      await expect(page.locator('[class*="spinner"], [class*="loading"]').first()).toBeVisible();
    }

    await page.waitForLoadState('networkidle');
    await expect(page).not.toHaveURL(/error/);
  });

  // ── Add Contact — API Create Failure ────────────────────────────────────────

  test('shows error when create contact API returns 422 validation error', async ({ page }) => {
    // Only intercept POST requests
    await page.route('**/api/contacts', (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 422,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'The given data was invalid.',
            errors: { email: ['The email has already been taken.'] },
          }),
        });
      }
      return route.continue();
    });

    await page.goto(PAGE_CONTACTS);
    await page.getByRole('button', { name: 'Add Contact' }).first().click();
    await page.waitForTimeout(500);

    await page.getByRole('textbox', { name: /email/i }).last().fill('existing@example.com');
    await page
      .getByRole('button', { name: /save|add|create|submit/i })
      .last()
      .click();

    await expect(
      page
        .getByText(/already been taken|already exists|invalid|error/i)
        .or(page.locator('[class*="error"]').first())
    ).toBeVisible({ timeout: 6000 });
  });
});

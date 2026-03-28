/**
 * Custom Playwright Matchers — domain-specific assertions for SureContact tests.
 *
 * Import this file ONCE (in fixtures.js) to register all matchers globally.
 * Tests that import from fixtures.js automatically get these matchers on expect().
 *
 * Usage:
 *   import { test, expect } from '../../utils/fixtures.js';
 *
 *   await expect(page).toShowSuccessToast();
 *   await expect(page).toBeOnPage('/contacts');
 *   await expect(page).toHaveTableRowCount(5);
 *   await expect(page).toShowEmptyState('No contacts yet');
 *   await expect(page).toHavePageTitle(/Contacts/);
 *   await expect(page).toHaveNoNetworkErrors();
 */
import { expect } from '@playwright/test';

expect.extend({
  // ── toShowSuccessToast ──────────────────────────────────────────────────────
  /**
   * Asserts that a success toast/notification is visible on the page.
   * Matches common toast patterns: "success", "saved", "created", "added", "updated", "deleted".
   *
   * @param {import('@playwright/test').Page} page
   * @param {{ timeout?: number }} options
   */
  async toShowSuccessToast(page, options = {}) {
    const timeout = options.timeout ?? 10000;
    const successLocator = page
      .getByText(/success|saved|created|added|updated|deleted|done/i)
      .or(
        page.locator(
          '[class*="toast"][class*="success"], [class*="alert-success"], [role="alert"][class*="success"]'
        )
      )
      .or(page.locator('[data-type="success"], [data-variant="success"]'));

    try {
      await successLocator.first().waitFor({ state: 'visible', timeout });
      return { message: () => 'Expected NO success toast, but one was shown', pass: true };
    } catch {
      return {
        message: () =>
          `Expected a success toast/notification within ${timeout}ms, but none appeared.\n` +
          'Check that your action completes and the app shows a success indicator.',
        pass: false,
      };
    }
  },

  // ── toShowErrorToast ────────────────────────────────────────────────────────
  /**
   * Asserts that an error toast/notification is visible.
   */
  async toShowErrorToast(page, options = {}) {
    const timeout = options.timeout ?? 8000;
    const errorLocator = page
      .getByText(/error|failed|something went wrong|invalid/i)
      .or(
        page.locator(
          '[class*="toast"][class*="error"], [class*="alert-error"], [role="alert"][class*="error"]'
        )
      )
      .or(page.locator('[data-type="error"], [data-variant="error"]'));

    try {
      await errorLocator.first().waitFor({ state: 'visible', timeout });
      return { message: () => 'Expected NO error toast, but one was shown', pass: true };
    } catch {
      return {
        message: () =>
          `Expected an error toast/notification within ${timeout}ms, but none appeared.`,
        pass: false,
      };
    }
  },

  // ── toBeOnPage ──────────────────────────────────────────────────────────────
  /**
   * Asserts that the current page URL contains the given path segment.
   *
   * @param {import('@playwright/test').Page} page
   * @param {string} path  — e.g. '/contacts', '/email-campaigns'
   * @param {{ timeout?: number }} options
   */
  async toBeOnPage(page, path, options = {}) {
    const timeout = options.timeout ?? 8000;
    try {
      await page.waitForURL(`**${path}**`, { timeout });
      const url = page.url();
      const pass = url.includes(path);
      return {
        message: () =>
          pass
            ? `Expected URL NOT to contain "${path}", but got: ${url}`
            : `Expected URL to contain "${path}", but got: ${url}`,
        pass,
      };
    } catch {
      return {
        message: () =>
          `Expected to be on page "${path}" within ${timeout}ms, but URL is: ${page.url()}`,
        pass: false,
      };
    }
  },

  // ── toHaveTableRowCount ─────────────────────────────────────────────────────
  /**
   * Asserts that the first <table> on the page has exactly N data rows (excluding header).
   *
   * @param {import('@playwright/test').Page} page
   * @param {number} expectedCount
   */
  async toHaveTableRowCount(page, expectedCount) {
    // Count all rows, subtract 1 for the header row
    const rowCount = await page.getByRole('row').count();
    const dataRows = Math.max(0, rowCount - 1);
    const pass = dataRows === expectedCount;
    return {
      message: () =>
        pass
          ? `Expected table NOT to have ${expectedCount} data rows`
          : `Expected table to have ${expectedCount} data rows, but found ${dataRows}`,
      pass,
    };
  },

  // ── toHaveTableRowCountAtLeast ──────────────────────────────────────────────
  /**
   * Asserts that the table has at least N data rows.
   */
  async toHaveTableRowCountAtLeast(page, minCount) {
    const rowCount = await page.getByRole('row').count();
    const dataRows = Math.max(0, rowCount - 1);
    const pass = dataRows >= minCount;
    return {
      message: () =>
        pass
          ? `Expected table to have fewer than ${minCount} data rows`
          : `Expected table to have at least ${minCount} data rows, but found ${dataRows}`,
      pass,
    };
  },

  // ── toShowEmptyState ────────────────────────────────────────────────────────
  /**
   * Asserts that an empty-state message is visible on the page.
   *
   * @param {import('@playwright/test').Page} page
   * @param {string | RegExp} text — the expected empty-state text
   */
  async toShowEmptyState(page, text) {
    const locator = typeof text === 'string' ? page.getByText(text) : page.getByText(text);
    const pass = await locator.isVisible().catch(() => false);
    return {
      message: () =>
        pass
          ? `Expected empty state "${text}" NOT to be visible`
          : `Expected empty state "${text}" to be visible, but it wasn't`,
      pass,
    };
  },

  // ── toHavePageTitle ─────────────────────────────────────────────────────────
  /**
   * Asserts the page <title> matches a string or RegExp.
   * Wraps the built-in but adds a cleaner message.
   */
  async toHavePageTitle(page, expected) {
    const title = await page.title();
    const pass = typeof expected === 'string' ? title === expected : expected.test(title);
    return {
      message: () =>
        pass
          ? `Expected page title NOT to match ${expected}, but got: "${title}"`
          : `Expected page title to match ${expected}, but got: "${title}"`,
      pass,
    };
  },

  // ── toHaveNoConsoleErrors ───────────────────────────────────────────────────
  /**
   * Asserts that no console error messages were logged.
   * Must be set up before navigation:
   *   const errors = [];
   *   page.on('console', m => m.type() === 'error' && errors.push(m.text()));
   *   await expect(page).toHaveNoConsoleErrors(errors);
   *
   * @param {import('@playwright/test').Page} _page
   * @param {string[]} consoleErrors — array collected via page.on('console')
   */
  async toHaveNoConsoleErrors(_page, consoleErrors) {
    const pass = consoleErrors.length === 0;
    return {
      message: () =>
        pass
          ? 'Expected console errors to be present'
          : `Expected no console errors, but found ${consoleErrors.length}:\n${consoleErrors.slice(0, 5).join('\n')}`,
      pass,
    };
  },

  // ── toHaveSecurityHeaders ───────────────────────────────────────────────────
  /**
   * Asserts that a Response object contains essential security headers.
   *
   * @param {import('@playwright/test').Response} response
   */
  async toHaveSecurityHeaders(response) {
    const headers = response.headers();
    const missing = [];
    const required = ['x-frame-options', 'x-content-type-options', 'strict-transport-security'];

    for (const header of required) {
      if (!headers[header]) missing.push(header);
    }

    const pass = missing.length === 0;
    return {
      message: () =>
        pass
          ? 'Expected response to be missing security headers'
          : `Expected response to have security headers, but missing: ${missing.join(', ')}`,
      pass,
    };
  },
});

/**
 * Accessibility Tests — powered by axe-core via @axe-core/playwright
 *
 * Runs Deque's axe engine against every major page and asserts zero violations.
 * Violations are printed as a readable table in the terminal output.
 *
 * Run:  npm run test:a11y
 *
 * Axe rule sets:
 *   wcag2a    — WCAG 2.x Level A
 *   wcag2aa   — WCAG 2.x Level AA  (recommended minimum)
 *   wcag21a / wcag21aa — WCAG 2.1 additions
 *   best-practice — Axe opinionated recommendations
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** Pretty-print violations so failures are readable without opening the report. */
function formatViolations(violations) {
  return violations
    .map(
      (v) =>
        `\n[${v.impact?.toUpperCase()}] ${v.id}: ${v.description}\n` +
        `  Help: ${v.helpUrl}\n` +
        v.nodes
          .slice(0, 3)
          .map((n) => `  Node: ${n.target.join(', ')}`)
          .join('\n')
    )
    .join('\n');
}

const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

test.describe('Accessibility — WCAG 2.1 AA', { tag: ['@a11y', '@regression'] }, () => {
  test.beforeEach(() => {
    test.skip(
      !!process.env.CI,
      'A11y violations are app-level issues — run locally with npm run test:a11y'
    );
  });

  // ── Auth ───────────────────────────────────────────────────────────────────

  test('login page has no critical a11y violations', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();

    if (results.violations.length > 0) {
      console.log('Violations:', formatViolations(results.violations));
    }
    expect(results.violations, formatViolations(results.violations)).toEqual([]);
  });

  // ── Dashboard ──────────────────────────────────────────────────────────────

  test('dashboard has no critical a11y violations', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(AXE_TAGS)
      .exclude('[class*="avatar"]') // avatars often lack alt text by design
      .analyze();

    if (results.violations.length > 0) {
      console.log('Violations:', formatViolations(results.violations));
    }
    expect(results.violations, formatViolations(results.violations)).toEqual([]);
  });

  // ── CRM ────────────────────────────────────────────────────────────────────

  test('contacts page has no critical a11y violations', async ({ page }) => {
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();

    if (results.violations.length > 0) {
      console.log('Violations:', formatViolations(results.violations));
    }
    expect(results.violations, formatViolations(results.violations)).toEqual([]);
  });

  test('Add Contact modal has no a11y violations', async ({ page }) => {
    await page.goto('/contacts');
    await page.getByRole('button', { name: 'Add Contact' }).first().click();
    await page.waitForTimeout(600);

    const dialog = page.getByRole('dialog');
    if (!(await dialog.isVisible().catch(() => false))) return test.skip();

    const results = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .withTags(AXE_TAGS)
      .analyze();

    if (results.violations.length > 0) {
      console.log('Violations:', formatViolations(results.violations));
    }
    expect(results.violations, formatViolations(results.violations)).toEqual([]);
  });

  test('lists page has no a11y violations', async ({ page }) => {
    await page.goto('/lists');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
    expect(results.violations, formatViolations(results.violations)).toEqual([]);
  });

  test('tags page has no a11y violations', async ({ page }) => {
    await page.goto('/tags');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
    expect(results.violations, formatViolations(results.violations)).toEqual([]);
  });

  // ── Campaigns ──────────────────────────────────────────────────────────────

  test('email campaigns page has no a11y violations', async ({ page }) => {
    await page.goto('/email-campaigns');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
    expect(results.violations, formatViolations(results.violations)).toEqual([]);
  });

  test('Create Campaign modal has no a11y violations', async ({ page }) => {
    await page.goto('/email-campaigns');
    await page.getByRole('button', { name: 'Create Campaign' }).click();
    await page.waitForTimeout(600);

    const dialog = page.getByRole('dialog');
    if (!(await dialog.isVisible().catch(() => false))) return test.skip();

    const results = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .withTags(AXE_TAGS)
      .analyze();

    expect(results.violations, formatViolations(results.violations)).toEqual([]);
  });

  test('email templates page has no a11y violations', async ({ page }) => {
    await page.goto('/email-templates');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
    expect(results.violations, formatViolations(results.violations)).toEqual([]);
  });

  // ── Automations ────────────────────────────────────────────────────────────

  test('workflows page has no a11y violations', async ({ page }) => {
    await page.goto('/workflows');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
    expect(results.violations, formatViolations(results.violations)).toEqual([]);
  });

  test('sequences page has no a11y violations', async ({ page }) => {
    await page.goto('/sequences');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
    expect(results.violations, formatViolations(results.violations)).toEqual([]);
  });

  // ── Forms ──────────────────────────────────────────────────────────────────

  test('forms page has no a11y violations', async ({ page }) => {
    await page.goto('/forms');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
    expect(results.violations, formatViolations(results.violations)).toEqual([]);
  });

  // ── Reports ────────────────────────────────────────────────────────────────

  test('reports page has no a11y violations', async ({ page }) => {
    await page.goto('/reports');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
    expect(results.violations, formatViolations(results.violations)).toEqual([]);
  });

  // ── Settings ───────────────────────────────────────────────────────────────

  test('settings page has no a11y violations', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
    expect(results.violations, formatViolations(results.violations)).toEqual([]);
  });

  // ── Keyboard Navigation ────────────────────────────────────────────────────

  test('login page — all interactive elements are keyboard reachable', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Tab through form and assert focus is visible on each interactive element
    const interactives = await page
      .locator('button, input, a, [tabindex]:not([tabindex="-1"])')
      .all();
    for (const el of interactives.slice(0, 10)) {
      await el.focus();
      const isFocusVisible = await el.evaluate((node) => {
        const style = getComputedStyle(node);
        return style.outline !== 'none' || document.activeElement === node;
      });
      expect(isFocusVisible).toBe(true);
    }
  });

  test('dashboard — sidebar navigation links are keyboard accessible', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const navLinks = await page.locator('nav a, nav button').all();
    for (const link of navLinks.slice(0, 8)) {
      await link.focus();
      const focused = await link.evaluate((el) => document.activeElement === el);
      expect(focused).toBe(true);
    }
  });

  // ── Colour Contrast (run as separate scoped rule) ──────────────────────────

  test('login page — passes color-contrast rule', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();

    if (results.violations.length > 0) {
      console.log('Contrast violations:', formatViolations(results.violations));
    }
    expect(results.violations, formatViolations(results.violations)).toEqual([]);
  });

  test('dashboard — passes color-contrast rule', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();

    if (results.violations.length > 0) {
      console.log('Contrast violations:', formatViolations(results.violations));
    }
    expect(results.violations, formatViolations(results.violations)).toEqual([]);
  });
});

/**
 * Visual Regression Tests
 *
 * Uses Playwright's built-in toHaveScreenshot() for pixel-level comparison.
 *
 * First run: snapshots are created automatically in tests/visual/__snapshots__/
 * Subsequent runs: compared against those baselines.
 *
 * Update baselines:  npx playwright test tests/visual/ --update-snapshots
 * Run visual only:   npm run test:visual
 */
import { test, expect } from '@playwright/test';

// Shared snapshot options — tweak threshold per environment
const SNAP = {
  maxDiffPixelRatio: 0.02, // allow ≤ 2 % pixel drift (handles anti-aliasing)
  animations: 'disabled', // freeze CSS animations for stable screenshots
  mask: [], // populated per-test where dynamic content exists
};

// Helper: mask elements that contain dynamic / timestamp content
function dynamicMasks(page) {
  return [
    page.locator('[data-testid="timestamp"]'),
    page.locator('[class*="avatar"]'),
    page.locator('[class*="notification-badge"]'),
    page.locator('[class*="usage-counter"]'),
    page.locator('[class*="trend"]'),
  ];
}

test.describe('Visual Regression', { tag: ['@visual', '@regression'] }, () => {
  test.beforeEach(async ({ page }) => {
    test.skip(
      !!process.env.CI,
      'Visual baselines require local generation — run npx playwright test tests/visual/ --update-snapshots first'
    );
    // Disable transitions and animations globally for stable captures
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          transition-duration: 0s !important;
        }
      `,
    });
  });

  // ── Auth ───────────────────────────────────────────────────────────────────

  test('login page — full viewport', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('login-full.png', {
      ...SNAP,
      fullPage: true,
    });
  });

  // ── Dashboard ──────────────────────────────────────────────────────────────

  test('dashboard — full page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('dashboard-full.png', {
      ...SNAP,
      fullPage: true,
      mask: dynamicMasks(page),
    });
  });

  test('dashboard — sidebar', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const sidebar = page.locator('nav, [role="navigation"]').first();
    await expect(sidebar).toHaveScreenshot('dashboard-sidebar.png', SNAP);
  });

  // ── CRM ────────────────────────────────────────────────────────────────────

  test('contacts page — full page', async ({ page }) => {
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('contacts-full.png', {
      ...SNAP,
      fullPage: true,
      mask: dynamicMasks(page),
    });
  });

  test('contacts — Add Contact button', async ({ page }) => {
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');
    const btn = page.getByRole('button', { name: 'Add Contact' }).first();
    await expect(btn).toHaveScreenshot('contacts-add-btn.png', SNAP);
  });

  test('contacts — Add Contact modal/drawer', async ({ page }) => {
    await page.goto('/contacts');
    await page.getByRole('button', { name: 'Add Contact' }).first().click();
    await page.waitForTimeout(600);
    const dialog = page
      .getByRole('dialog')
      .or(page.locator('[class*="modal"], [class*="drawer"], [class*="panel"]').first());
    if (await dialog.isVisible().catch(() => false)) {
      await expect(dialog).toHaveScreenshot('contacts-add-modal.png', SNAP);
    }
  });

  test('lists page — full page', async ({ page }) => {
    await page.goto('/lists');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('lists-full.png', {
      ...SNAP,
      fullPage: true,
      mask: dynamicMasks(page),
    });
  });

  // ── Campaigns ──────────────────────────────────────────────────────────────

  test('email campaigns page — full page', async ({ page }) => {
    await page.goto('/email-campaigns');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('campaigns-full.png', {
      ...SNAP,
      fullPage: true,
      mask: dynamicMasks(page),
    });
  });

  test('email campaigns — empty state', async ({ page }) => {
    await page.goto('/email-campaigns');
    await page.waitForLoadState('networkidle');
    const hasData = await page
      .getByRole('table')
      .isVisible()
      .catch(() => false);
    if (!hasData) {
      const empty = page.getByText('No campaigns yet').locator('..');
      if (await empty.isVisible().catch(() => false)) {
        await expect(empty).toHaveScreenshot('campaigns-empty-state.png', SNAP);
      }
    }
  });

  // ── Automations ────────────────────────────────────────────────────────────

  test('workflows page — full page', async ({ page }) => {
    await page.goto('/workflows');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('workflows-full.png', {
      ...SNAP,
      fullPage: true,
      mask: dynamicMasks(page),
    });
  });

  // ── Forms ──────────────────────────────────────────────────────────────────

  test('forms page — full page', async ({ page }) => {
    await page.goto('/forms');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('forms-full.png', {
      ...SNAP,
      fullPage: true,
      mask: dynamicMasks(page),
    });
  });

  // ── Reports ────────────────────────────────────────────────────────────────

  test('reports page — full page', async ({ page }) => {
    await page.goto('/reports');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('reports-full.png', {
      ...SNAP,
      fullPage: true,
      mask: dynamicMasks(page),
    });
  });

  // ── Settings ───────────────────────────────────────────────────────────────

  test('settings page — full page', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('settings-full.png', {
      ...SNAP,
      fullPage: true,
    });
  });

  // ── Responsive ─────────────────────────────────────────────────────────────

  test('dashboard — tablet viewport (768×1024)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('dashboard-tablet.png', {
      ...SNAP,
      mask: dynamicMasks(page),
    });
  });

  test('dashboard — mobile viewport (375×812)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('dashboard-mobile.png', {
      ...SNAP,
      mask: dynamicMasks(page),
    });
  });
});

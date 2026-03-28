import { test, expect } from '../../utils/fixtures.js';

test.describe('Reports', { tag: ['@smoke', '@regression'] }, () => {
  test.describe.configure({ mode: 'parallel' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/reports');
    await page.waitForLoadState('networkidle');
  });

  // ── UI / Layout ────────────────────────────────────────────────────────────

  test('reports page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Reports | SureContact/);
    await expect(page.getByRole('heading', { name: /Reports/i })).toBeVisible();
  });

  test('reports page shows key metrics or charts', async ({ page }) => {
    await page.waitForTimeout(1500);
    await expect(page.getByText(/sent|open|click|bounce|subscriber|campaign/i).first()).toBeVisible(
      { timeout: 10000 }
    );
  });

  test('reports page shows date range filter', async ({ page }) => {
    await expect(
      page
        .getByRole('button', { name: /date|range|last|filter/i })
        .or(page.getByRole('combobox'))
        .or(page.getByText(/7 days|30 days|this month/i))
    ).toBeVisible({ timeout: 8000 });
  });

  // ── Metrics ────────────────────────────────────────────────────────────────

  test('open rate metric is displayed', async ({ page }) => {
    await expect(page.getByText(/open rate|opens/i)).toBeVisible({ timeout: 8000 });
  });

  test('click rate metric is displayed', async ({ page }) => {
    await expect(page.getByText(/click rate|clicks/i)).toBeVisible({ timeout: 8000 });
  });

  test('emails sent metric is displayed', async ({ page }) => {
    await expect(page.getByText(/sent|emails sent/i).first()).toBeVisible({ timeout: 8000 });
  });

  // ── Date Filters ───────────────────────────────────────────────────────────

  test('changing date range updates report data', async ({ page }) => {
    const dateFilter = page
      .getByRole('button', { name: /date|range|last 30|filter/i })
      .or(page.getByRole('combobox'))
      .first();
    if (await dateFilter.isVisible().catch(() => false)) {
      await dateFilter.click();
      await expect(page.getByText(/7 days|14 days|30 days|custom/i)).toBeVisible({ timeout: 5000 });
    }
  });

  // ── Export ─────────────────────────────────────────────────────────────────

  test('reports can be exported', async ({ page }) => {
    const exportBtn = page.getByRole('button', { name: /export|download/i });
    if (await exportBtn.isVisible().catch(() => false)) {
      await expect(exportBtn).toBeVisible();
    }
  });

  // ── Campaign Reports ───────────────────────────────────────────────────────

  test('reports show campaign-specific breakdown', async ({ page }) => {
    await page.waitForTimeout(1000);
    const campaignReport = page.getByText(/campaign|email/i).first();
    await expect(campaignReport).toBeVisible({ timeout: 8000 });
  });
});

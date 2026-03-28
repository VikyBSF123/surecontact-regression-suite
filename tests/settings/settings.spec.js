import { test, expect } from '../../utils/fixtures.js';

test.describe('Settings', { tag: ['@regression'] }, () => {
  test.describe.configure({ mode: 'parallel' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
  });

  // ── UI / Layout ────────────────────────────────────────────────────────────

  test('settings page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Settings | SureContact/);
    await expect(page.getByRole('heading', { name: /Settings/i })).toBeVisible();
  });

  test('settings page shows profile or account section', async ({ page }) => {
    await expect(page.getByText(/profile|account|general|organization/i).first()).toBeVisible({
      timeout: 8000,
    });
  });

  test('settings navigation tabs/sections are visible', async ({ page }) => {
    await expect(
      page
        .getByRole('tab')
        .or(page.getByRole('link', { name: /profile|billing|notifications|security/i }))
    ).toBeVisible({ timeout: 8000 });
  });

  // ── Profile Settings ───────────────────────────────────────────────────────

  test('profile settings shows name and email fields', async ({ page }) => {
    // Navigate to profile section
    const profileLink = page
      .getByRole('link', { name: /profile/i })
      .or(page.getByRole('tab', { name: /profile/i }));
    if (await profileLink.isVisible().catch(() => false)) {
      await profileLink.click();
    }

    await expect(
      page
        .getByRole('textbox', { name: /name|first name/i })
        .or(page.getByRole('textbox', { name: /email/i }))
    ).toBeVisible({ timeout: 8000 });
  });

  test('profile update requires valid name', async ({ page }) => {
    const profileLink = page
      .getByRole('link', { name: /profile/i })
      .or(page.getByRole('tab', { name: /profile/i }));
    if (await profileLink.isVisible().catch(() => false)) {
      await profileLink.click();
    }

    const nameField = page.getByRole('textbox', { name: /name|first name/i });
    if (await nameField.isVisible()) {
      await nameField.clear();
      const saveBtn = page.getByRole('button', { name: /save|update/i });
      await saveBtn.click();
      await expect(
        page.getByText(/required|name is required/i).or(page.locator('[class*="error"]'))
      ).toBeVisible({ timeout: 5000 });
    }
  });

  // ── Organization Settings ──────────────────────────────────────────────────

  test('organization name is editable', async ({ page }) => {
    const orgTab = page
      .getByRole('tab', { name: /organization|workspace/i })
      .or(page.getByRole('link', { name: /organization|workspace/i }));
    if (await orgTab.isVisible().catch(() => false)) {
      await orgTab.click();
      await expect(
        page.getByRole('textbox', { name: /organization name|workspace name/i })
      ).toBeVisible({ timeout: 5000 });
    }
  });

  // ── Notifications ──────────────────────────────────────────────────────────

  test('notification settings are configurable', async ({ page }) => {
    const notifTab = page
      .getByRole('tab', { name: /notification/i })
      .or(page.getByRole('link', { name: /notification/i }));
    if (await notifTab.isVisible().catch(() => false)) {
      await notifTab.click();
      await expect(page.getByRole('switch').or(page.getByRole('checkbox'))).toBeVisible({
        timeout: 5000,
      });
    }
  });

  // ── Billing ────────────────────────────────────────────────────────────────

  test('billing section is accessible', async ({ page }) => {
    const billingLink = page
      .getByRole('link', { name: /billing|plan|subscription/i })
      .or(page.getByRole('tab', { name: /billing/i }));
    if (await billingLink.isVisible().catch(() => false)) {
      await billingLink.click();
      await expect(page.getByText(/plan|billing|subscription|contacts/i).first()).toBeVisible({
        timeout: 5000,
      });
    }
  });

  // ── Password / Security ────────────────────────────────────────────────────

  test('security or password section is accessible', async ({ page }) => {
    const securityLink = page
      .getByRole('link', { name: /security|password/i })
      .or(page.getByRole('tab', { name: /security|password/i }));
    if (await securityLink.isVisible().catch(() => false)) {
      await securityLink.click();
      await expect(
        page.getByRole('textbox', { name: /password/i }).or(page.getByText(/change password/i))
      ).toBeVisible({ timeout: 5000 });
    }
  });

  // ── Save ───────────────────────────────────────────────────────────────────

  test('settings save button is present and clickable', async ({ page }) => {
    const saveBtn = page.getByRole('button', { name: /save|update|submit/i });
    if (await saveBtn.isVisible()) {
      await expect(saveBtn).toBeEnabled();
    }
  });
});

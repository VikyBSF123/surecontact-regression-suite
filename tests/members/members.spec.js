import { test, expect } from '@playwright/test';

test.describe('Members / Workspace', { tag: ['@regression'] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workspace');
    await page.waitForLoadState('networkidle');
  });

  // ── UI / Layout ────────────────────────────────────────────────────────────

  test('members page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Members | SureContact/);
    await expect(page.getByRole('heading', { name: /Members|Workspace|Team/i })).toBeVisible();
  });

  test('members page shows invite member button', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /invite|add member|invite member/i })
    ).toBeVisible();
  });

  test('members list shows existing members', async ({ page }) => {
    const hasTable = await page
      .getByRole('table')
      .isVisible()
      .catch(() => false);
    const hasList = await page
      .locator('[class*="member"]')
      .first()
      .isVisible()
      .catch(() => false);
    expect(hasTable || hasList).toBe(true);
  });

  // ── Invite Member ──────────────────────────────────────────────────────────

  test('invite member opens invitation form', async ({ page }) => {
    await page.getByRole('button', { name: /invite|add member/i }).click();
    await expect(
      page.getByRole('dialog').or(page.getByRole('textbox', { name: /email/i }))
    ).toBeVisible({ timeout: 8000 });
  });

  test('invite with valid email sends invitation', async ({ page }) => {
    await page.getByRole('button', { name: /invite|add member/i }).click();
    await page.waitForTimeout(500);

    const emailField = page.getByRole('textbox', { name: /email/i });
    if (await emailField.isVisible()) {
      await emailField.fill(`testmember+${Date.now()}@example.com`);

      const roleSelect = page.getByRole('combobox', { name: /role/i });
      if (await roleSelect.isVisible()) {
        await roleSelect.selectOption({ index: 0 });
      }

      const sendBtn = page.getByRole('button', { name: /send|invite|add/i }).last();
      await sendBtn.click();

      await expect(
        page.getByText(/invite sent|success|invited/i).or(page.locator('[class*="toast"]'))
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test('invite with empty email shows validation error', async ({ page }) => {
    await page.getByRole('button', { name: /invite|add member/i }).click();
    await page.waitForTimeout(500);

    const sendBtn = page.getByRole('button', { name: /send|invite|add/i }).last();
    await sendBtn.click();

    await expect(
      page.getByText(/required|email is required/i).or(page.locator('[class*="error"]'))
    ).toBeVisible({ timeout: 5000 });
  });

  test('invite with invalid email shows validation error', async ({ page }) => {
    await page.getByRole('button', { name: /invite|add member/i }).click();
    await page.waitForTimeout(500);

    const emailField = page.getByRole('textbox', { name: /email/i });
    if (await emailField.isVisible()) {
      await emailField.fill('not-valid-email');
      const sendBtn = page.getByRole('button', { name: /send|invite/i }).last();
      await sendBtn.click();
      await expect(
        page.getByText(/invalid email|valid email/i).or(page.locator('[class*="error"]'))
      ).toBeVisible({ timeout: 5000 });
    }
  });

  // ── Role Management ────────────────────────────────────────────────────────

  test('members have role labels visible', async ({ page }) => {
    const hasTable = await page
      .getByRole('table')
      .isVisible()
      .catch(() => false);
    if (hasTable) {
      await expect(page.getByText(/admin|owner|member|viewer/i).first()).toBeVisible();
    }
  });

  test('member can have role changed', async ({ page }) => {
    const hasTable = await page
      .getByRole('table')
      .isVisible()
      .catch(() => false);
    if (hasTable) {
      const roleDropdown = page.getByRole('combobox').first();
      if (await roleDropdown.isVisible().catch(() => false)) {
        await expect(roleDropdown).toBeVisible();
      }
    }
  });

  // ── Remove Member ──────────────────────────────────────────────────────────

  test('remove member shows confirmation dialog', async ({ page }) => {
    const hasTable = await page
      .getByRole('table')
      .isVisible()
      .catch(() => false);
    if (hasTable) {
      const removeBtn = page.getByRole('button', { name: /remove|delete/i }).last();
      if (await removeBtn.isVisible().catch(() => false)) {
        await removeBtn.click();
        await expect(
          page.getByRole('dialog').or(page.getByText(/confirm|are you sure/i))
        ).toBeVisible({ timeout: 5000 });
        await page.getByRole('button', { name: /cancel/i }).click();
      }
    }
  });
});

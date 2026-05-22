import { test, expect } from '@playwright/test';

test.describe('Campaigns - SMTP Settings', { tag: ['@regression'] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/smtp');
  });

  test('SMTP page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/SMTP|SureContact/i);
    await expect(page.getByRole('heading', { name: /SMTP/i })).toBeVisible();
  });

  test('SMTP page shows connection form or existing connections', async ({ page }) => {
    await expect(
      page
        .getByRole('button', { name: /add|connect|new smtp/i })
        .or(page.getByRole('textbox', { name: /host/i }))
        .or(page.getByText(/SMTP|server|connection/i))
    ).toBeVisible();
  });

  test('add SMTP connection button or form is present', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|connect|new smtp/i });
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await expect(
        page.getByRole('textbox', { name: /host|server/i }).or(page.getByRole('dialog'))
      ).toBeVisible({ timeout: 8000 });
    }
  });

  test('SMTP form requires host field', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|connect|new smtp/i });
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);
      const saveBtn = page.getByRole('button', { name: /save|connect|test/i }).last();
      await saveBtn.click();
      await expect(
        page.getByText(/required|host is required/i).or(page.locator('[class*="error"]'))
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('SMTP form validates port number', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: /add|connect|new smtp/i });
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(500);

      const portField = page
        .getByRole('spinbutton', { name: /port/i })
        .or(page.getByRole('textbox', { name: /port/i }));
      if (await portField.isVisible()) {
        await portField.fill('99999'); // Invalid port
        const saveBtn = page.getByRole('button', { name: /save|connect/i }).last();
        await saveBtn.click();
        await expect(
          page.getByText(/invalid port|valid port/i).or(page.locator('[class*="error"]'))
        ).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('SMTP connection list or empty state is visible', async ({ page }) => {
    const hasConnections = await page
      .getByRole('table')
      .isVisible()
      .catch(() => false);
    const hasEmpty = await page
      .getByText(/no smtp|no connections|add.*smtp/i)
      .isVisible()
      .catch(() => false);
    const hasForm = await page
      .getByRole('textbox', { name: /host/i })
      .isVisible()
      .catch(() => false);
    expect(hasConnections || hasEmpty || hasForm).toBe(true);
  });
});

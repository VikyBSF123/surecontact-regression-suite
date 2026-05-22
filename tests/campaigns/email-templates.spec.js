import { test, expect } from '@playwright/test';

test.describe('Campaigns - Email Templates', { tag: ['@regression'] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/email-templates');
  });

  test('email templates page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Email Templates|SureContact/i);
    await expect(page.getByRole('heading', { name: /Email Templates/i })).toBeVisible();
  });

  test('create template button is visible', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /create template|new template|add template/i })
    ).toBeVisible();
  });

  test('template list or empty state is visible', async ({ page }) => {
    const hasTemplates = await page
      .getByRole('list')
      .or(page.getByRole('table'))
      .isVisible()
      .catch(() => false);
    const hasEmpty = await page
      .getByText(/no templates/i)
      .isVisible()
      .catch(() => false);
    expect(hasTemplates || hasEmpty).toBe(true);
  });

  test('search input is visible', async ({ page }) => {
    const search = page.getByPlaceholder(/search/i);
    await expect(search).toBeVisible();
  });

  test('create template button opens template editor', async ({ page }) => {
    await page.getByRole('button', { name: /create template|new template|add template/i }).click();
    await expect(
      page
        .getByRole('dialog')
        .or(page.getByRole('textbox', { name: /name|template name/i }))
        .or(page.getByText(/template editor/i))
    ).toBeVisible({ timeout: 10000 });
  });

  test('template creation requires a name', async ({ page }) => {
    await page.getByRole('button', { name: /create template|new template|add template/i }).click();
    await page.waitForTimeout(500);
    const saveBtn = page.getByRole('button', { name: /save|create|next/i }).last();
    await saveBtn.click();
    await expect(
      page.getByText(/required|name is required/i).or(page.locator('[class*="error"]'))
    ).toBeVisible({ timeout: 5000 });
  });

  test('create template with valid name proceeds', async ({ page }) => {
    await page.getByRole('button', { name: /create template|new template|add template/i }).click();
    await page.waitForTimeout(500);

    const nameField = page.getByRole('textbox', { name: /name|template name/i });
    if (await nameField.isVisible()) {
      await nameField.fill(`Auto Template ${Date.now()}`);
      const saveBtn = page.getByRole('button', { name: /save|create|next/i }).last();
      await saveBtn.click();
      await expect(page).not.toHaveURL(/error/);
    }
  });

  test('search templates with no results shows empty state', async ({ page }) => {
    const search = page.getByPlaceholder(/search/i);
    await search.fill('zzznoresults999');
    await page.waitForTimeout(800);
    await expect(page.getByText(/no templates|no results/i)).toBeVisible();
  });
});

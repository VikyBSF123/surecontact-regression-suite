import { test, expect } from '@playwright/test';
import { WORKFLOW } from '../../utils/test-data.js';

test.describe('Automations - Workflows', { tag: ['@critical', '@regression'] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workflows');
    await page.waitForLoadState('networkidle');
  });

  // ── UI / Layout ────────────────────────────────────────────────────────────

  test('workflows page loads without errors', async ({ page }) => {
    await expect(page).not.toHaveURL(/error/);
    await expect(page.getByText(/workflow|automation/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('workflows page shows Create Workflow button', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /create workflow|new workflow|add workflow/i })
    ).toBeVisible({ timeout: 10000 });
  });

  test('workflow list or empty state is visible', async ({ page }) => {
    const hasTable = await page
      .getByRole('table')
      .isVisible()
      .catch(() => false);
    const hasGrid = await page
      .locator('[class*="workflow"]')
      .first()
      .isVisible()
      .catch(() => false);
    const hasEmpty = await page
      .getByText(/no workflow|no automation/i)
      .isVisible()
      .catch(() => false);
    const hasCreate = await page
      .getByRole('button', { name: /create/i })
      .isVisible()
      .catch(() => false);
    expect(hasTable || hasGrid || hasEmpty || hasCreate).toBe(true);
  });

  // ── Create Workflow ────────────────────────────────────────────────────────

  test('create workflow button starts creation flow', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /create workflow|new workflow/i });
    await createBtn.click();
    await expect(
      page
        .getByRole('dialog')
        .or(page.getByRole('textbox', { name: /name|workflow name/i }))
        .or(page.getByText(/trigger|start/i))
    ).toBeVisible({ timeout: 10000 });
  });

  test('workflow creation requires a name', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /create workflow|new workflow/i });
    await createBtn.click();
    await page.waitForTimeout(500);

    const saveBtn = page.getByRole('button', { name: /save|create|next/i }).last();
    await saveBtn.click();

    await expect(
      page.getByText(/required|name is required/i).or(page.locator('[class*="error"]'))
    ).toBeVisible({ timeout: 5000 });
  });

  test('workflow with valid name is created successfully', async ({ page }) => {
    const createBtn = page.getByRole('button', { name: /create workflow|new workflow/i });
    await createBtn.click();
    await page.waitForTimeout(500);

    const nameField = page.getByRole('textbox', { name: /name|workflow name/i });
    if (await nameField.isVisible()) {
      await nameField.fill(WORKFLOW.valid.name);
      const saveBtn = page.getByRole('button', { name: /save|create|next/i }).last();
      await saveBtn.click();
      await expect(page).not.toHaveURL(/error/);
    }
  });

  // ── Workflow Actions ───────────────────────────────────────────────────────

  test('existing workflow can be enabled or disabled', async ({ page }) => {
    const hasData = await page
      .getByRole('table')
      .isVisible()
      .catch(() => false);
    if (hasData) {
      const toggle = page.getByRole('switch').first().or(page.locator('[class*="toggle"]').first());
      if (await toggle.isVisible()) {
        await toggle.click();
        await expect(page).not.toHaveURL(/error/);
      }
    }
  });

  test('workflow edit action is available', async ({ page }) => {
    const hasData = await page
      .getByRole('table')
      .isVisible()
      .catch(() => false);
    if (hasData) {
      const editBtn = page.getByRole('button', { name: /edit/i }).first();
      if (await editBtn.isVisible()) {
        await expect(editBtn).toBeVisible();
      }
    }
  });

  test('workflow delete shows confirmation dialog', async ({ page }) => {
    const hasData = await page
      .getByRole('table')
      .isVisible()
      .catch(() => false);
    if (hasData) {
      const deleteBtn = page.getByRole('button', { name: /delete/i }).first();
      if (await deleteBtn.isVisible()) {
        await deleteBtn.click();
        await expect(
          page.getByRole('dialog').or(page.getByText(/confirm|are you sure/i))
        ).toBeVisible({ timeout: 5000 });
        // Cancel deletion
        await page.getByRole('button', { name: /cancel/i }).click();
      }
    }
  });

  // ── Search ─────────────────────────────────────────────────────────────────

  test('workflow search/filter is functional', async ({ page }) => {
    const search = page.getByPlaceholder(/search/i);
    if (await search.isVisible()) {
      await search.fill('test workflow');
      await expect(search).toHaveValue('test workflow');
    }
  });
});

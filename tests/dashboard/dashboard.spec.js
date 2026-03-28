/**
 * Dashboard Tests
 *
 * Uses expect.soft() for multi-element layout checks so ALL failures
 * are reported in one run rather than stopping at the first missing element.
 * Uses test.step() so Monocart report shows a readable timeline.
 */
import { test, expect } from '../../utils/fixtures.js';

test.describe('Dashboard', { tag: ['@smoke', '@regression'] }, () => {
  test.describe.configure({ mode: 'parallel' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  // ── UI / Layout (soft assertions — all failures reported together) ─────────

  test('dashboard page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Dashboard | SureContact/);
  });

  test('dashboard displays welcome message', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Welcome/ })).toBeVisible();
  });

  test('dashboard shows getting started guide — all links present', async ({ page }) => {
    await test.step('check guide heading', async () => {
      await expect.soft(page.getByRole('heading', { name: "Let's get started" })).toBeVisible();
    });

    await test.step('check quick-start links', async () => {
      await expect.soft(page.getByRole('link', { name: 'Import Contacts' })).toBeVisible();
      await expect.soft(page.getByRole('link', { name: 'Configure SMTP' })).toBeVisible();
      await expect.soft(page.getByRole('link', { name: 'Create Campaign' })).toBeVisible();
      await expect.soft(page.getByRole('link', { name: 'Create Automation' })).toBeVisible();
    });

    // Flush soft assertions — any failure above will be reported here
    expect(test.info().errors).toHaveLength(0);
  });

  test('dashboard shows all quick action cards', async ({ page }) => {
    await test.step('check all four quick-action card headings', async () => {
      await expect.soft(page.getByRole('heading', { name: 'Add your contacts' })).toBeVisible();
      await expect
        .soft(page.getByRole('heading', { name: 'Create your first Campaign' }))
        .toBeVisible();
      await expect
        .soft(page.getByRole('heading', { name: 'Download our WordPress plugin' }))
        .toBeVisible();
      await expect
        .soft(page.getByRole('heading', { name: 'Automate your messages' }))
        .toBeVisible();
    });

    expect(test.info().errors).toHaveLength(0);
  });

  test('dashboard header elements are present', async ({ page }) => {
    await test.step('check Import Contacts button', async () => {
      await expect.soft(page.getByRole('button', { name: 'Import Contacts' })).toBeVisible();
    });

    await test.step('check Download Plugin link', async () => {
      await expect.soft(page.getByRole('link', { name: 'Download Plugin' }).first()).toBeVisible();
    });

    expect(test.info().errors).toHaveLength(0);
  });

  test('sidebar shows all main navigation items', async ({ page }) => {
    await test.step('top-level navigation items', async () => {
      await expect.soft(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
      await expect.soft(page.getByRole('button', { name: 'CRM' })).toBeVisible();
      await expect.soft(page.getByRole('button', { name: 'Campaigns' })).toBeVisible();
      await expect.soft(page.getByRole('button', { name: 'Automations' })).toBeVisible();
      await expect.soft(page.getByRole('link', { name: 'Forms' })).toBeVisible();
      await expect.soft(page.getByRole('link', { name: 'Landing Pages' })).toBeVisible();
    });

    await test.step('bottom navigation items', async () => {
      await expect.soft(page.getByRole('link', { name: 'Connections' })).toBeVisible();
      await expect.soft(page.getByRole('link', { name: 'Members' })).toBeVisible();
      await expect.soft(page.getByRole('link', { name: 'Reports' })).toBeVisible();
      await expect.soft(page.getByRole('link', { name: 'Settings' })).toBeVisible();
    });

    expect(test.info().errors).toHaveLength(0);
  });

  test('sidebar shows Business Plan usage widget', async ({ page }) => {
    await test.step('check usage widget elements', async () => {
      await expect.soft(page.getByRole('heading', { name: 'Business Plan' })).toBeVisible();
      await expect.soft(page.getByText('Contacts')).toBeVisible();
      await expect.soft(page.getByRole('button', { name: 'See All Usage' })).toBeVisible();
    });

    expect(test.info().errors).toHaveLength(0);
  });

  test('topbar elements are present', async ({ page }) => {
    await test.step('language switcher', async () => {
      await expect.soft(page.getByRole('button', { name: /en/i })).toBeVisible();
    });

    await test.step('user avatar button', async () => {
      await expect.soft(page.getByRole('button', { name: 'AT' })).toBeVisible();
    });

    await test.step('collapse sidebar button', async () => {
      await expect.soft(page.getByRole('button', { name: 'Collapse sidebar' })).toBeVisible();
    });

    expect(test.info().errors).toHaveLength(0);
  });

  test('SureContact logo is visible and links to dashboard', async ({ page }) => {
    await test.step('locate logo', async () => {
      const logo = page.getByRole('link', { name: /SureContact Logo SureContact/ });
      await expect(logo).toBeVisible();
    });

    await test.step('click logo and assert URL', async () => {
      await page.getByRole('link', { name: /SureContact Logo SureContact/ }).click();
      await expect(page).toHaveURL(/dashboard/);
    });
  });

  // ── Navigation (test.step() shows each nav expansion in the report) ────────

  test('CRM menu expands to show all sub-items', async ({ page }) => {
    await test.step('click CRM menu button', async () => {
      await page.getByRole('button', { name: 'CRM' }).click();
    });

    await test.step('verify sub-items are visible', async () => {
      await expect.soft(page.getByRole('link', { name: 'Contacts' })).toBeVisible();
      await expect.soft(page.getByRole('link', { name: 'Lists' })).toBeVisible();
      await expect.soft(page.getByRole('link', { name: 'Tags' })).toBeVisible();
      await expect.soft(page.getByRole('link', { name: 'Custom Fields' })).toBeVisible();
      await expect.soft(page.getByRole('link', { name: 'Imports' })).toBeVisible();
      await expect.soft(page.getByRole('link', { name: 'Exports' })).toBeVisible();
    });

    expect(test.info().errors).toHaveLength(0);
  });

  test('Campaigns menu expands to show all sub-items', async ({ page }) => {
    await test.step('click Campaigns menu', async () => {
      await page.getByRole('button', { name: 'Campaigns' }).click();
    });

    await test.step('verify sub-items', async () => {
      await expect.soft(page.getByRole('link', { name: 'Email Campaigns' })).toBeVisible();
      await expect.soft(page.getByRole('link', { name: 'Email Templates' })).toBeVisible();
      await expect.soft(page.getByRole('link', { name: 'Templates Library' })).toBeVisible();
      await expect.soft(page.getByRole('link', { name: 'SMTP' })).toBeVisible();
    });

    expect(test.info().errors).toHaveLength(0);
  });

  test('Automations menu expands to show all sub-items', async ({ page }) => {
    await test.step('click Automations menu', async () => {
      await page.getByRole('button', { name: 'Automations' }).click();
    });

    await test.step('verify sub-items', async () => {
      await expect.soft(page.getByRole('link', { name: 'Workflows' })).toBeVisible();
      await expect.soft(page.getByRole('link', { name: 'History' })).toBeVisible();
      await expect.soft(page.getByRole('link', { name: 'Integrations' })).toBeVisible();
      await expect.soft(page.getByRole('link', { name: 'Sequences' })).toBeVisible();
    });

    expect(test.info().errors).toHaveLength(0);
  });

  test('Import Contacts quick action navigates to imports page', async ({ page }) => {
    await test.step('click Import Contact link', async () => {
      await page.getByRole('link', { name: 'Import Contact' }).click();
    });

    await test.step('assert URL contains /imports', async () => {
      await expect(page).toHaveURL(/imports/);
    });
  });

  test('Create First Campaign quick action navigates to campaigns page', async ({ page }) => {
    await test.step('click Create First Campaign', async () => {
      await page.getByRole('link', { name: 'Create First Campaign' }).click();
    });

    await test.step('assert URL', async () => {
      await expect(page).toHaveURL(/email-campaigns/);
    });
  });

  test('Create Automation quick action navigates to workflows page', async ({ page }) => {
    await test.step('click Create Automation', async () => {
      await page.getByRole('link', { name: 'Create Automation' }).click();
    });

    await test.step('assert URL', async () => {
      await expect(page).toHaveURL(/workflows/);
    });
  });

  // ── Sidebar collapse ───────────────────────────────────────────────────────

  test('sidebar can be collapsed and expanded', async ({ page }) => {
    const collapseBtn = page.getByRole('button', { name: 'Collapse sidebar' });

    await test.step('collapse the sidebar', async () => {
      await collapseBtn.click();
      await page.waitForTimeout(400);
      const nav = page.getByRole('navigation', { name: 'Main navigation' });
      await expect(nav).toBeVisible();
    });

    await test.step('expand the sidebar again', async () => {
      await page
        .getByRole('button', { name: /expand|open sidebar/i })
        .or(collapseBtn)
        .click();
      await page.waitForTimeout(400);
    });
  });
});

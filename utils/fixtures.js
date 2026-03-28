import { test as base } from '@playwright/test';
// Register custom domain-specific matchers (toShowSuccessToast, toBeOnPage, etc.)
import './matchers.js';
import { LoginPage } from './pages/LoginPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { ContactsPage } from './pages/ContactsPage.js';
import { EmailCampaignsPage } from './pages/EmailCampaignsPage.js';
import { WorkflowsPage } from './pages/WorkflowsPage.js';
import { FormsPage } from './pages/FormsPage.js';
import { ListsPage } from './pages/ListsPage.js';
import { TagsPage } from './pages/TagsPage.js';
import { SequencesPage } from './pages/SequencesPage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { ReportsPage } from './pages/ReportsPage.js';
import { Factory } from './factory.js';

/**
 * Custom Playwright fixtures that inject page objects into every test.
 *
 * Usage in a test file:
 *   import { test, expect } from '../../utils/fixtures.js';
 *
 *   test('my test', async ({ contactsPage }) => {
 *     await contactsPage.goto();
 *     await contactsPage.addContact('foo@bar.com');
 *   });
 */
export const test = base.extend({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  contactsPage: async ({ page }, use) => {
    await use(new ContactsPage(page));
  },

  emailCampaignsPage: async ({ page }, use) => {
    await use(new EmailCampaignsPage(page));
  },

  workflowsPage: async ({ page }, use) => {
    await use(new WorkflowsPage(page));
  },

  formsPage: async ({ page }, use) => {
    await use(new FormsPage(page));
  },

  listsPage: async ({ page }, use) => {
    await use(new ListsPage(page));
  },

  tagsPage: async ({ page }, use) => {
    await use(new TagsPage(page));
  },

  sequencesPage: async ({ page }, use) => {
    await use(new SequencesPage(page));
  },

  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  },

  reportsPage: async ({ page }, use) => {
    await use(new ReportsPage(page));
  },

  /** Injects Factory so tests can call fixture.factory.contact() etc. */
  // eslint-disable-next-line no-empty-pattern
  factory: async ({}, use) => {
    await use(Factory);
  },
});

export { expect } from '@playwright/test';
export { Factory };

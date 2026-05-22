/**
 * Workspace Fixture — sandboxed test workspace per spec file.
 *
 * Each spec file gets a fresh workspace tracker with a unique run-prefix.
 * All resources created via the tracker are automatically deleted after the
 * entire spec file completes (worker-scoped teardown).
 *
 * Usage in a spec file:
 *
 *   import { test, expect } from '../../utils/workspace-fixture.js';
 *
 *   test('my test', async ({ workspace }) => {
 *     const contact = await workspace.createContact({ first_name: 'Test' });
 *     const list    = await workspace.createList();
 *     // ... test logic ...
 *     // No manual cleanup needed — workspace fixture tears down after this file.
 *   });
 *
 * Mixing with other fixtures:
 *   Re-export test from this file OR merge with utils/fixtures.js if needed.
 */

import { test as base } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { ApiHelper } from './api-helper.js';

export const test = base.extend({
  /**
   * Worker-scoped sandbox — one instance shared by all tests in a spec file.
   * Teardown runs once after the last test in the file.
   */
  workspace: [
    async ({ request }, use) => {
      const api = await ApiHelper.create(request);

      // Unique 6-char prefix keeps test data identifiable and avoids collisions
      const runId = faker.string.alphanumeric(6).toLowerCase();
      const prefix = `e2e-${runId}`;

      const tracker = {
        api,
        prefix,
        runId,

        // Resource ID registries for teardown
        _contacts: [],
        _lists: [],
        _tags: [],
        _campaigns: [],
        _automations: [],
        _templates: [],

        // ── Contacts ────────────────────────────────────────────────────────

        async createContact(overrides = {}) {
          const email = overrides.email || `${prefix}-${faker.string.alphanumeric(4)}@qatest.io`;
          const contact = await api.createContact({
            first_name: faker.person.firstName(),
            last_name: faker.person.lastName(),
            ...overrides,
            email,
          });
          const id = contact?.uuid ?? contact?.id;
          if (id) this._contacts.push(id);
          return contact;
        },

        async createContacts(n = 3, overrides = {}) {
          return Promise.all(Array.from({ length: n }, () => this.createContact(overrides)));
        },

        // ── Lists ────────────────────────────────────────────────────────────

        async createList(overrides = {}) {
          const list = await api.createList({
            name: `${prefix}-list-${faker.string.alphanumeric(4)}`,
            ...overrides,
          });
          const id = list?.id ?? list?.uuid;
          if (id) this._lists.push(id);
          return list;
        },

        // ── Tags ─────────────────────────────────────────────────────────────

        async createTag(overrides = {}) {
          const tag = await api.createTag({
            name: `${prefix}-tag-${faker.string.alphanumeric(4)}`,
            ...overrides,
          });
          const id = tag?.id ?? tag?.uuid;
          if (id) this._tags.push(id);
          return tag;
        },

        // ── Campaigns ────────────────────────────────────────────────────────

        async createCampaign(overrides = {}) {
          const campaign = await api.createCampaign({
            name: `${prefix}-campaign-${faker.string.alphanumeric(4)}`,
            subject: faker.lorem.sentence({ min: 4, max: 8 }),
            from_name: faker.person.fullName(),
            ...overrides,
          });
          const id = campaign?.id ?? campaign?.uuid;
          if (id) this._campaigns.push(id);
          return campaign;
        },

        // ── Automations ──────────────────────────────────────────────────────

        async createAutomation(overrides = {}) {
          const automation = await api.createAutomation({
            name: `${prefix}-automation-${faker.string.alphanumeric(4)}`,
            ...overrides,
          });
          const id = automation?.id ?? automation?.uuid;
          if (id) this._automations.push(id);
          return automation;
        },

        // ── Manual registration (for resources created outside the tracker) ──

        track(type, id) {
          if (!id) return;
          const key = `_${type}`;
          if (Array.isArray(this[key])) this[key].push(id);
        },
      };

      // Hand the tracker to the test
      await use(tracker);

      // ── Teardown — runs once after the last test in this spec file ──────────
      const deleteAll = async (ids, deleteFn, label) => {
        let deleted = 0;
        for (const id of ids) {
          try {
            await deleteFn(id);
            deleted++;
          } catch {
            // swallow — best-effort cleanup
          }
        }
        if (ids.length > 0) {
          console.log(`  [workspace] ${label}: deleted ${deleted}/${ids.length}`);
        }
      };

      await deleteAll(tracker._contacts, (id) => api.deleteContact(id), `contacts [${prefix}]`);
      await deleteAll(tracker._lists, (id) => api.deleteList(id), `lists [${prefix}]`);
      await deleteAll(tracker._tags, (id) => api.deleteTag(id), `tags [${prefix}]`);
      await deleteAll(tracker._campaigns, (id) => api.deleteCampaign(id), `campaigns [${prefix}]`);
      await deleteAll(
        tracker._automations,
        (id) => api.deleteAutomation(id),
        `automations [${prefix}]`
      );
    },
    { scope: 'worker' },
  ],
});

export { expect } from '@playwright/test';

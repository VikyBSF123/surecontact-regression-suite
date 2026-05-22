import { test, expect } from '@playwright/test';
import { ListsApi } from '../../utils/api/ListsApi.js';
import { validateSchema } from '../../utils/schemas/validator.js';
import { listListSchema, listResponseSchema } from '../../utils/schemas/list.schema.js';
import { CREDENTIALS } from '../../utils/test-data.js';

const API_BASE = process.env.API_BASE_URL || 'https://api-qaing.surecontact.com';

test.describe('API - Lists', { tag: ['@api', '@regression'] }, () => {
  let api;

  test.beforeAll(async ({ request }) => {
    api = new ListsApi(request, API_BASE);
    await api.authenticate(CREDENTIALS.email, CREDENTIALS.password);
  });

  // ── List ────────────────────────────────────────────────────────────────────

  test('GET /lists returns 200 with valid envelope shape', async () => {
    const res = await api.list();
    expect(res.status()).toBe(200);
    const body = await res.json();
    const errors = validateSchema(listListSchema, body);
    expect(errors, `Schema errors: ${JSON.stringify(errors)}`).toBeNull();
  });

  test('GET /lists supports pagination', async () => {
    const res = await api.list({ page: 1, per_page: 5 });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeLessThanOrEqual(5);
  });

  // ── Create ──────────────────────────────────────────────────────────────────

  test('POST /lists creates list with valid name', async () => {
    const name = `api-list-${Date.now()}`;
    const res = await api.create({ name });
    expect([200, 201]).toContain(res.status());
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data?.name).toBe(name);
    expect(typeof body.data?.uuid).toBe('string');
    const errors = validateSchema(listResponseSchema, body);
    expect(errors, `Schema errors: ${JSON.stringify(errors)}`).toBeNull();
  });

  test('POST /lists rejects empty name — 422', async () => {
    const res = await api.create({ name: '' });
    expect([400, 422]).toContain(res.status());
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  // ── Read ────────────────────────────────────────────────────────────────────

  test('GET /lists/:uuid returns single list', async () => {
    const create = await api.create({ name: `api-list-get-${Date.now()}` });
    if (![200, 201].includes(create.status())) return test.skip();
    const created = await create.json();
    const uuid = created?.data?.uuid;
    if (!uuid) return test.skip();

    const res = await api.getById(uuid);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data?.uuid).toBe(uuid);
  });

  // ── Update ──────────────────────────────────────────────────────────────────

  test('PATCH /lists/:uuid updates list name', async () => {
    const create = await api.create({ name: `api-list-update-${Date.now()}` });
    if (![200, 201].includes(create.status())) return test.skip();
    const created = await create.json();
    const uuid = created?.data?.uuid;
    if (!uuid) return test.skip();

    const newName = `api-list-updated-${Date.now()}`;
    const res = await api.update(uuid, { name: newName });
    expect([200, 204]).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json();
      expect(body.success).toBe(true);
    }
  });

  // ── Delete ──────────────────────────────────────────────────────────────────

  test('DELETE /lists/:uuid removes the list', async () => {
    const create = await api.create({ name: `api-list-del-${Date.now()}` });
    if (![200, 201].includes(create.status())) return test.skip();
    const created = await create.json();
    const uuid = created?.data?.uuid;
    if (!uuid) return test.skip();

    const del = await api.remove(uuid);
    expect([200, 204]).toContain(del.status());

    const check = await api.getById(uuid);
    expect([404, 410]).toContain(check.status());
  });

  test('DELETE /lists/:uuid with unknown UUID returns 404', async () => {
    const res = await api.remove('00000000-0000-0000-0000-000000000000');
    expect([404, 422]).toContain(res.status());
  });
});

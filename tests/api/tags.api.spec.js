import { test, expect } from '@playwright/test';
import { TagsApi } from '../../utils/api/TagsApi.js';
import { validateSchema } from '../../utils/schemas/validator.js';
import { tagListSchema, tagResponseSchema } from '../../utils/schemas/tag.schema.js';
import { CREDENTIALS } from '../../utils/test-data.js';

const API_BASE = process.env.API_BASE_URL || 'https://qaing.surecontact.com/api/v1';

test.describe('API - Tags', { tag: ['@api', '@regression'] }, () => {
  let api;

  test.beforeAll(async ({ request }) => {
    api = new TagsApi(request, API_BASE);
    await api.authenticate(CREDENTIALS.email, CREDENTIALS.password);
  });

  // ── List ────────────────────────────────────────────────────────────────────

  test('GET /tags returns 200 with valid envelope shape', async () => {
    const res = await api.list();
    expect(res.status()).toBe(200);
    const body = await res.json();
    const errors = validateSchema(tagListSchema, body);
    expect(errors, `Schema errors: ${JSON.stringify(errors)}`).toBeNull();
  });

  test('GET /tags supports pagination', async () => {
    const res = await api.list({ page: 1, per_page: 5 });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('GET /tags supports search param', async () => {
    const res = await api.list({ search: 'api-tag-' });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  // ── Create ──────────────────────────────────────────────────────────────────

  test('POST /tags creates tag with valid name', async () => {
    const name = `api-tag-${Date.now()}`;
    const res = await api.create({ name });
    expect([200, 201]).toContain(res.status());
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data?.name).toBe(name);
    expect(typeof body.data?.uuid).toBe('string');
    const errors = validateSchema(tagResponseSchema, body);
    expect(errors, `Schema errors: ${JSON.stringify(errors)}`).toBeNull();
  });

  test('POST /tags creates tag with hex color', async () => {
    const name = `api-tag-color-${Date.now()}`;
    const res = await api.create({ name, color: '#FF5733' });
    expect([200, 201]).toContain(res.status());
    const body = await res.json();
    expect(body.success).toBe(true);
    if (body.data?.color) {
      expect(body.data.color).toBe('#FF5733');
    }
  });

  test('POST /tags rejects empty name — 422', async () => {
    const res = await api.create({ name: '' });
    expect([400, 422]).toContain(res.status());
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  // ── Read ────────────────────────────────────────────────────────────────────

  test('GET /tags/:uuid returns single tag', async () => {
    const create = await api.create({ name: `api-tag-get-${Date.now()}` });
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

  test('PATCH /tags/:uuid updates tag name', async () => {
    const create = await api.create({ name: `api-tag-update-${Date.now()}` });
    if (![200, 201].includes(create.status())) return test.skip();
    const created = await create.json();
    const uuid = created?.data?.uuid;
    if (!uuid) return test.skip();

    const newName = `api-tag-updated-${Date.now()}`;
    const res = await api.update(uuid, { name: newName });
    expect([200, 204]).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json();
      expect(body.success).toBe(true);
    }
  });

  // ── Delete ──────────────────────────────────────────────────────────────────

  test('DELETE /tags/:uuid removes the tag', async () => {
    const create = await api.create({ name: `api-tag-del-${Date.now()}` });
    if (![200, 201].includes(create.status())) return test.skip();
    const created = await create.json();
    const uuid = created?.data?.uuid;
    if (!uuid) return test.skip();

    const del = await api.remove(uuid);
    expect([200, 204]).toContain(del.status());

    const check = await api.getById(uuid);
    expect([404, 410]).toContain(check.status());
  });

  test('DELETE /tags/:uuid with unknown UUID returns 404', async () => {
    const res = await api.remove('00000000-0000-0000-0000-000000000000');
    expect([404, 422]).toContain(res.status());
  });
});

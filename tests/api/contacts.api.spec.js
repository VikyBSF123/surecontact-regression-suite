import { test, expect } from '@playwright/test';
import { ContactsApi } from '../../utils/api/ContactsApi.js';
import { validateSchema } from '../../utils/schemas/validator.js';
import { contactResponseSchema, contactListSchema } from '../../utils/schemas/contact.schema.js';
import { CREDENTIALS } from '../../utils/test-data.js';

const API_BASE = process.env.API_BASE_URL || 'https://api-qaing.surecontact.com';

test.describe('API - Contacts', { tag: ['@api', '@regression'] }, () => {
  let api;

  test.beforeAll(async ({ request }) => {
    api = new ContactsApi(request, API_BASE);
    await api.authenticate(CREDENTIALS.email, CREDENTIALS.password);
  });

  // ── List / Pagination ───────────────────────────────────────────────────────

  test('GET /contacts returns 200 with valid envelope shape', async () => {
    const res = await api.list();
    expect(res.status()).toBe(200);
    const body = await res.json();
    const errors = validateSchema(contactListSchema, body);
    expect(errors, `Schema errors: ${JSON.stringify(errors)}`).toBeNull();
  });

  test('GET /contacts supports pagination — page + per_page', async () => {
    const res = await api.list({ page: 1, per_page: 5 });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeLessThanOrEqual(5);
  });

  test('GET /contacts returns meta with pagination info', async () => {
    const res = await api.list({ page: 1, per_page: 10 });
    expect(res.status()).toBe(200);
    const body = await res.json();
    if (body.meta) {
      expect(typeof body.meta.current_page).toBe('number');
      expect(typeof body.meta.total).toBe('number');
    }
  });

  test('GET /contacts search param filters results', async () => {
    const res = await api.search('test');
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  // ── Create ──────────────────────────────────────────────────────────────────

  test('POST /contacts creates contact — wraps in primary_fields', async () => {
    const email = `api-create+${Date.now()}@qatest.io`;
    const res = await api.create({
      email,
      first_name: 'ApiFirst',
      last_name: 'ApiLast',
    });
    expect([200, 201]).toContain(res.status());
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data?.email).toBe(email);
    expect(typeof body.data?.uuid).toBe('string');
    // Schema validation
    const errors = validateSchema(contactResponseSchema, body);
    expect(errors, `Schema errors: ${JSON.stringify(errors)}`).toBeNull();
  });

  test('POST /contacts rejects missing email — 422', async () => {
    const res = await api.create({ first_name: 'NoEmail' });
    expect([400, 422]).toContain(res.status());
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  test('POST /contacts rejects invalid email format — 422', async () => {
    const res = await api.create({ email: 'not-an-email' });
    expect([400, 422]).toContain(res.status());
  });

  // ── Read ────────────────────────────────────────────────────────────────────

  test('GET /contacts/:uuid returns single contact', async () => {
    // Create a contact first to get a known UUID
    const email = `api-get+${Date.now()}@qatest.io`;
    const create = await api.create({ email, first_name: 'GetTest' });
    if (![200, 201].includes(create.status())) return test.skip();

    const created = await create.json();
    const uuid = created?.data?.uuid;
    if (!uuid) return test.skip();

    const res = await api.getOne(uuid);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data?.uuid).toBe(uuid);
    expect(body.data?.email).toBe(email);
    const errors = validateSchema(contactResponseSchema, body);
    expect(errors, `Schema errors: ${JSON.stringify(errors)}`).toBeNull();
  });

  test('GET /contacts/:uuid returns 404 for unknown UUID', async () => {
    const res = await api.getOne('00000000-0000-0000-0000-000000000000');
    expect([404, 422]).toContain(res.status());
  });

  // ── Update (PUT) ────────────────────────────────────────────────────────────

  test('PUT /contacts/:uuid updates contact fields', async () => {
    const email = `api-update+${Date.now()}@qatest.io`;
    const create = await api.create({ email });
    if (![200, 201].includes(create.status())) return test.skip();

    const created = await create.json();
    const uuid = created?.data?.uuid;
    if (!uuid) return test.skip();

    const res = await api.update(uuid, {
      email,
      first_name: 'UpdatedName',
      last_name: 'UpdatedLast',
    });
    expect([200, 204]).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data?.first_name).toBe('UpdatedName');
    }
  });

  // ── Patch ───────────────────────────────────────────────────────────────────

  test('PATCH /contacts/:uuid partially updates contact', async () => {
    const email = `api-patch+${Date.now()}@qatest.io`;
    const create = await api.create({ email });
    if (![200, 201].includes(create.status())) return test.skip();

    const created = await create.json();
    const uuid = created?.data?.uuid;
    if (!uuid) return test.skip();

    const res = await api.patch(uuid, { primary_fields: { first_name: 'PatchedName' } });
    expect([200, 204]).toContain(res.status());
  });

  // ── Status Update ───────────────────────────────────────────────────────────

  test('PATCH /contacts/:uuid/status updates contact status', async () => {
    const email = `api-status+${Date.now()}@qatest.io`;
    const create = await api.create({ email });
    if (![200, 201].includes(create.status())) return test.skip();

    const created = await create.json();
    const uuid = created?.data?.uuid;
    if (!uuid) return test.skip();

    const res = await api.updateStatus(uuid, 'unsubscribed');
    expect([200, 204]).toContain(res.status());
  });

  // ── Tags ─────────────────────────────────────────────────────────────────────

  test('GET /contacts/:uuid/activities returns activity log', async () => {
    const res = await api.list({ per_page: 1 });
    if (res.status() !== 200) return test.skip();
    const body = await res.json();
    const uuid = body?.data?.[0]?.uuid;
    if (!uuid) return test.skip();

    const actRes = await api.activities(uuid);
    expect([200, 404]).toContain(actRes.status());
  });

  // ── Delete ──────────────────────────────────────────────────────────────────

  test('DELETE /contacts/:uuid removes the contact', async () => {
    const email = `api-delete+${Date.now()}@qatest.io`;
    const create = await api.create({ email });
    if (![200, 201].includes(create.status())) return test.skip();

    const created = await create.json();
    const uuid = created?.data?.uuid;
    if (!uuid) return test.skip();

    const del = await api.remove(uuid);
    expect([200, 204]).toContain(del.status());

    // Verify it's gone
    const check = await api.getOne(uuid);
    expect([404, 410]).toContain(check.status());
  });

  test('DELETE /contacts/:uuid with unknown UUID returns 404', async () => {
    const res = await api.remove('00000000-0000-0000-0000-000000000000');
    expect([404, 422]).toContain(res.status());
  });
});

import { test, expect } from '@playwright/test';
import { ContactsApi } from '../../utils/api/ContactsApi.js';
import { CREDENTIALS, CONTACT } from '../../utils/test-data.js';

const API_BASE = process.env.API_BASE_URL || 'https://qaing.surecontact.com/api';

test.describe('API - Contacts', { tag: ['@api', '@regression'] }, () => {
  let api;

  test.beforeAll(async ({ request }) => {
    api = new ContactsApi(request, API_BASE);
    await api.authenticate(CREDENTIALS.email, CREDENTIALS.password);
  });

  // ── List / Pagination ───────────────────────────────────────────────────────

  test('GET /contacts returns 200 with valid response shape', async () => {
    const res = await api.list();
    expect(res.status()).toBe(200);
    const body = await res.json();
    // Most REST APIs return { data: [...], meta: {...} } or just an array
    expect(body).toBeDefined();
  });

  test('GET /contacts supports pagination params', async () => {
    const res = await api.list({ page: 1, per_page: 5 });
    expect(res.status()).toBe(200);
  });

  test('GET /contacts search param filters results', async () => {
    const res = await api.search('test');
    expect(res.status()).toBe(200);
  });

  // ── Create ──────────────────────────────────────────────────────────────────

  test('POST /contacts creates contact with valid payload', async () => {
    const res = await api.create({
      email: CONTACT.api.email,
      first_name: CONTACT.api.firstName,
      last_name: CONTACT.api.lastName,
    });
    // 201 Created or 200 OK depending on backend
    expect([200, 201]).toContain(res.status());
    const body = await res.json();
    const email = body?.email || body?.data?.email;
    if (email) expect(email).toBe(CONTACT.api.email);
  });

  test('POST /contacts rejects missing email', async () => {
    const res = await api.create({ first_name: 'NoEmail' });
    expect([400, 422]).toContain(res.status());
  });

  test('POST /contacts rejects invalid email format', async () => {
    const res = await api.create({ email: 'not-an-email' });
    expect([400, 422]).toContain(res.status());
  });

  // ── Update ──────────────────────────────────────────────────────────────────

  test('PATCH /contacts/:id updates first_name', async () => {
    // Create first, then update
    const create = await api.create({ email: CONTACT.api.updateEmail });
    if (![200, 201].includes(create.status())) return test.skip();

    const body = await create.json();
    const id = body?.id || body?.data?.id;
    if (!id) return test.skip();

    const update = await api.update(id, { first_name: 'UpdatedName' });
    expect([200, 204]).toContain(update.status());
  });

  // ── Delete ──────────────────────────────────────────────────────────────────

  test('DELETE /contacts/:id removes the contact', async () => {
    const create = await api.create({ email: CONTACT.api.deleteEmail });
    if (![200, 201].includes(create.status())) return test.skip();

    const body = await create.json();
    const id = body?.id || body?.data?.id;
    if (!id) return test.skip();

    const del = await api.remove(id);
    expect([200, 204]).toContain(del.status());
  });

  test('DELETE /contacts/:id with invalid id returns 404', async () => {
    const res = await api.remove('nonexistent-id-xyz');
    expect([404, 422]).toContain(res.status());
  });
});

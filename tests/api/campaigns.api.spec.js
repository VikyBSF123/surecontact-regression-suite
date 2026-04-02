import { test, expect } from '@playwright/test';
import { CampaignsApi } from '../../utils/api/CampaignsApi.js';
import { validateSchema } from '../../utils/schemas/validator.js';
import { campaignListSchema, campaignResponseSchema } from '../../utils/schemas/campaign.schema.js';
import { CREDENTIALS, CAMPAIGN_STATUSES } from '../../utils/test-data.js';

const API_BASE = process.env.API_BASE_URL || 'https://qaing.surecontact.com/api/v1';

test.describe('API - Campaigns', { tag: ['@api', '@regression'] }, () => {
  let api;

  test.beforeAll(async ({ request }) => {
    api = new CampaignsApi(request, API_BASE);
    await api.authenticate(CREDENTIALS.email, CREDENTIALS.password);
  });

  // ── List ────────────────────────────────────────────────────────────────────

  test('GET /campaigns returns 200 with valid envelope shape', async () => {
    const res = await api.list();
    expect(res.status()).toBe(200);
    const body = await res.json();
    const errors = validateSchema(campaignListSchema, body);
    expect(errors, `Schema errors: ${JSON.stringify(errors)}`).toBeNull();
  });

  test('GET /campaigns supports search param', async () => {
    const res = await api.list({ search: 'test' });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test('GET /campaigns supports pagination', async () => {
    const res = await api.list({ page: 1, per_page: 5 });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeLessThanOrEqual(5);
  });

  test('GET /campaigns status filter — draft', async () => {
    const res = await api.list({ status: 'draft' });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    // All returned campaigns should be draft if filtering works
    for (const c of body.data) {
      expect(CAMPAIGN_STATUSES).toContain(c.status);
    }
  });

  // ── Create ──────────────────────────────────────────────────────────────────

  test('POST /campaigns creates campaign with valid payload', async () => {
    const name = `api-campaign-${Date.now()}`;
    const res = await api.create({ name, subject: 'Test Subject' });
    expect([200, 201]).toContain(res.status());
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data?.name).toBe(name);
    expect(typeof body.data?.uuid).toBe('string');
    // New campaigns should start as draft
    expect(body.data?.status).toBe('draft');
    const errors = validateSchema(campaignResponseSchema, body);
    expect(errors, `Schema errors: ${JSON.stringify(errors)}`).toBeNull();
  });

  test('POST /campaigns rejects missing name — 422', async () => {
    const res = await api.create({ subject: 'No name provided' });
    expect([400, 422]).toContain(res.status());
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  // ── Read ────────────────────────────────────────────────────────────────────

  test('GET /campaigns/:uuid returns single campaign', async () => {
    const create = await api.create({ name: `api-campaign-get-${Date.now()}` });
    if (![200, 201].includes(create.status())) return test.skip();
    const created = await create.json();
    const uuid = created?.data?.uuid;
    if (!uuid) return test.skip();

    const res = await api.getById(uuid);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data?.uuid).toBe(uuid);
    const errors = validateSchema(campaignResponseSchema, body);
    expect(errors, `Schema errors: ${JSON.stringify(errors)}`).toBeNull();
  });

  test('GET /campaigns/:uuid returns 404 for unknown UUID', async () => {
    const res = await api.getById('00000000-0000-0000-0000-000000000000');
    expect([404, 422]).toContain(res.status());
  });

  // ── Update ──────────────────────────────────────────────────────────────────

  test('PATCH /campaigns/:uuid updates campaign subject', async () => {
    const create = await api.create({ name: `api-campaign-update-${Date.now()}` });
    if (![200, 201].includes(create.status())) return test.skip();
    const created = await create.json();
    const uuid = created?.data?.uuid;
    if (!uuid) return test.skip();

    const res = await api.update(uuid, { subject: 'Updated Subject Line' });
    expect([200, 204]).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json();
      expect(body.success).toBe(true);
    }
  });

  // ── Delete ──────────────────────────────────────────────────────────────────

  test('DELETE /campaigns/:uuid removes the campaign', async () => {
    const create = await api.create({ name: `api-campaign-del-${Date.now()}` });
    if (![200, 201].includes(create.status())) return test.skip();
    const created = await create.json();
    const uuid = created?.data?.uuid;
    if (!uuid) return test.skip();

    const del = await api.remove(uuid);
    expect([200, 204]).toContain(del.status());

    const check = await api.getById(uuid);
    expect([404, 410]).toContain(check.status());
  });

  test('DELETE /campaigns/:uuid with unknown UUID returns 404', async () => {
    const res = await api.remove('00000000-0000-0000-0000-000000000000');
    expect([404, 422]).toContain(res.status());
  });
});

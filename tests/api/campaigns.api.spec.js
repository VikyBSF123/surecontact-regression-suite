import { test, expect } from '@playwright/test';
import { CampaignsApi } from '../../utils/api/CampaignsApi.js';
import { CREDENTIALS, CAMPAIGN } from '../../utils/test-data.js';

const API_BASE = process.env.API_BASE_URL || 'https://qaing.surecontact.com/api';

test.describe('API - Campaigns', { tag: ['@api', '@regression'] }, () => {
  let api;

  test.beforeAll(async ({ request }) => {
    api = new CampaignsApi(request, API_BASE);
    await api.authenticate(CREDENTIALS.email, CREDENTIALS.password);
  });

  test('GET /campaigns returns 200', async () => {
    const res = await api.list();
    expect(res.status()).toBe(200);
  });

  test('GET /campaigns supports search param', async () => {
    const res = await api.list({ search: 'test' });
    expect(res.status()).toBe(200);
  });

  test('POST /campaigns creates campaign with valid payload', async () => {
    const res = await api.create({ name: CAMPAIGN.api.name });
    expect([200, 201]).toContain(res.status());
  });

  test('POST /campaigns rejects missing name', async () => {
    const res = await api.create({ subject: 'No name provided' });
    expect([400, 422]).toContain(res.status());
  });

  test('DELETE /campaigns/:id with invalid id returns 404', async () => {
    const res = await api.remove('nonexistent-campaign-id');
    expect([404, 422]).toContain(res.status());
  });
});

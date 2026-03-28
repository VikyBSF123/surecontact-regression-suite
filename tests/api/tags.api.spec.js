import { test, expect } from '@playwright/test';
import { TagsApi } from '../../utils/api/TagsApi.js';
import { CREDENTIALS, TAG } from '../../utils/test-data.js';

const API_BASE = process.env.API_BASE_URL || 'https://qaing.surecontact.com/api';

test.describe('API - Tags', { tag: ['@api', '@regression'] }, () => {
  let api;

  test.beforeAll(async ({ request }) => {
    api = new TagsApi(request, API_BASE);
    await api.authenticate(CREDENTIALS.email, CREDENTIALS.password);
  });

  test('GET /tags returns 200', async () => {
    const res = await api.list();
    expect(res.status()).toBe(200);
  });

  test('POST /tags creates tag with valid name', async () => {
    const res = await api.create({ name: TAG.api.name });
    expect([200, 201]).toContain(res.status());
  });

  test('POST /tags rejects empty name', async () => {
    const res = await api.create({ name: '' });
    expect([400, 422]).toContain(res.status());
  });

  test('DELETE /tags/:id with invalid id returns 404', async () => {
    const res = await api.remove('nonexistent-tag-id');
    expect([404, 422]).toContain(res.status());
  });
});

import { test, expect } from '@playwright/test';
import { ListsApi } from '../../utils/api/ListsApi.js';
import { CREDENTIALS, LIST } from '../../utils/test-data.js';

const API_BASE = process.env.API_BASE_URL || 'https://qaing.surecontact.com/api';

test.describe('API - Lists', { tag: ['@api', '@regression'] }, () => {
  let api;

  test.beforeAll(async ({ request }) => {
    api = new ListsApi(request, API_BASE);
    await api.authenticate(CREDENTIALS.email, CREDENTIALS.password);
  });

  test('GET /lists returns 200', async () => {
    const res = await api.list();
    expect(res.status()).toBe(200);
  });

  test('POST /lists creates list with valid name', async () => {
    const res = await api.create({ name: LIST.api.name });
    expect([200, 201]).toContain(res.status());
  });

  test('POST /lists rejects empty name', async () => {
    const res = await api.create({ name: '' });
    expect([400, 422]).toContain(res.status());
  });

  test('DELETE /lists/:id with invalid id returns 404', async () => {
    const res = await api.remove('nonexistent-list-id');
    expect([404, 422]).toContain(res.status());
  });
});

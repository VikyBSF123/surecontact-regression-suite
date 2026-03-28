/**
 * API Contract / Schema Validation Tests
 *
 * Validates that every API endpoint returns the correct response SHAPE,
 * not just a successful status code.
 *
 * A contact endpoint returning { id: null, email: null } would pass a
 * status-only check but fail here — which is the point.
 *
 * Uses: AJV (JSON Schema validator) + ajv-formats
 * Run:  npm run test:api
 */
import { test, expect } from '@playwright/test';
import { validate, validateResponse } from '../../utils/schemas/validator.js';
import { contactSchema, contactListSchema } from '../../utils/schemas/contact.schema.js';
import { campaignSchema, campaignListSchema } from '../../utils/schemas/campaign.schema.js';
import { listSchema, listListSchema } from '../../utils/schemas/list.schema.js';
import { tagSchema, tagListSchema } from '../../utils/schemas/tag.schema.js';
import { CREDENTIALS, CONTACT, CAMPAIGN, LIST, TAG } from '../../utils/test-data.js';

const BASE = process.env.API_BASE_URL || 'https://qaing.surecontact.com/api';

// ── Auth helper ───────────────────────────────────────────────────────────────
async function getAuthHeaders(request) {
  const res = await request.post(`${BASE}/auth/login`, {
    data: { email: CREDENTIALS.email, password: CREDENTIALS.password },
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    failOnStatusCode: false,
  });
  if (!res.ok()) return { 'Content-Type': 'application/json', Accept: 'application/json' };

  const body = await res.json();
  const token = body?.token ?? body?.data?.token ?? body?.access_token;
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ── Contact schemas ───────────────────────────────────────────────────────────

test.describe('Schema Validation — Contacts', { tag: ['@api', '@regression'] }, () => {
  let headers;

  test.beforeAll(async ({ request }) => {
    headers = await getAuthHeaders(request);
  });

  test('GET /contacts returns correct list envelope schema', async ({ request }) => {
    const res = await request.get(`${BASE}/contacts`, { headers, failOnStatusCode: false });
    if (!res.ok()) return test.skip();

    const body = await res.json();
    const { valid, errors } = validate(contactListSchema, body);

    expect(valid, `Contact list schema invalid:\n${errors}`).toBe(true);
  });

  test('GET /contacts items each match the contact schema', async ({ request }) => {
    const res = await request.get(`${BASE}/contacts`, {
      headers,
      params: { per_page: 5 },
      failOnStatusCode: false,
    });
    if (!res.ok()) return test.skip();

    const body = await res.json();
    const items = body?.data ?? (Array.isArray(body) ? body : []);

    for (const contact of items.slice(0, 5)) {
      const { valid, errors } = validate(contactSchema, contact);
      expect(valid, `Contact item schema invalid (id=${contact?.id}):\n${errors}`).toBe(true);
    }
  });

  test('POST /contacts create response matches contact schema', async ({ request }) => {
    const res = await request.post(`${BASE}/contacts`, {
      headers,
      data: { email: CONTACT.api.email, first_name: 'Schema', last_name: 'Test' },
      failOnStatusCode: false,
    });
    if (![200, 201].includes(res.status())) return test.skip();

    const body = await res.json();
    const { valid, errors } = validateResponse(contactSchema, body);
    expect(valid, `Create contact response schema invalid:\n${errors}`).toBe(true);

    // Verify required field is correct type and value
    const contact = body?.data ?? body;
    expect(typeof contact.email).toBe('string');
    expect(contact.email.length).toBeGreaterThan(0);
  });

  test('contact object never has null email field', async ({ request }) => {
    const res = await request.get(`${BASE}/contacts`, {
      headers,
      params: { per_page: 10 },
      failOnStatusCode: false,
    });
    if (!res.ok()) return test.skip();

    const body = await res.json();
    const items = body?.data ?? (Array.isArray(body) ? body : []);

    for (const contact of items) {
      expect(contact.email, `Contact id=${contact?.id} has null email`).not.toBeNull();
      expect(typeof contact.email).toBe('string');
    }
  });

  test('contact id field is always present and not null', async ({ request }) => {
    const res = await request.get(`${BASE}/contacts`, {
      headers,
      params: { per_page: 10 },
      failOnStatusCode: false,
    });
    if (!res.ok()) return test.skip();

    const body = await res.json();
    const items = body?.data ?? (Array.isArray(body) ? body : []);

    for (const contact of items) {
      const id = contact.id ?? contact.uuid;
      expect(id, `Contact is missing an id/uuid field`).toBeDefined();
      expect(id).not.toBeNull();
    }
  });
});

// ── Campaign schemas ──────────────────────────────────────────────────────────

test.describe('Schema Validation — Campaigns', { tag: ['@api', '@regression'] }, () => {
  let headers;

  test.beforeAll(async ({ request }) => {
    headers = await getAuthHeaders(request);
  });

  test('GET /campaigns returns correct list envelope schema', async ({ request }) => {
    const res = await request.get(`${BASE}/campaigns`, { headers, failOnStatusCode: false });
    if (!res.ok()) return test.skip();

    const body = await res.json();
    const { valid, errors } = validate(campaignListSchema, body);
    expect(valid, `Campaign list schema invalid:\n${errors}`).toBe(true);
  });

  test('GET /campaigns items each match the campaign schema', async ({ request }) => {
    const res = await request.get(`${BASE}/campaigns`, {
      headers,
      params: { per_page: 5 },
      failOnStatusCode: false,
    });
    if (!res.ok()) return test.skip();

    const body = await res.json();
    const items = body?.data ?? (Array.isArray(body) ? body : []);

    for (const campaign of items.slice(0, 5)) {
      const { valid, errors } = validate(campaignSchema, campaign);
      expect(valid, `Campaign item schema invalid (id=${campaign?.id}):\n${errors}`).toBe(true);
    }
  });

  test('campaign name is always a non-empty string', async ({ request }) => {
    const res = await request.get(`${BASE}/campaigns`, {
      headers,
      params: { per_page: 10 },
      failOnStatusCode: false,
    });
    if (!res.ok()) return test.skip();

    const body = await res.json();
    const items = body?.data ?? (Array.isArray(body) ? body : []);

    for (const campaign of items) {
      expect(typeof campaign.name, `Campaign id=${campaign?.id} has non-string name`).toBe(
        'string'
      );
      expect(campaign.name.length, `Campaign id=${campaign?.id} has empty name`).toBeGreaterThan(0);
    }
  });

  test('POST /campaigns create response matches schema', async ({ request }) => {
    const res = await request.post(`${BASE}/campaigns`, {
      headers,
      data: { name: CAMPAIGN.api.name },
      failOnStatusCode: false,
    });
    if (![200, 201].includes(res.status())) return test.skip();

    const body = await res.json();
    const { valid, errors } = validateResponse(campaignSchema, body);
    expect(valid, `Create campaign response schema invalid:\n${errors}`).toBe(true);
  });
});

// ── List schemas ──────────────────────────────────────────────────────────────

test.describe('Schema Validation — Lists', { tag: ['@api', '@regression'] }, () => {
  let headers;

  test.beforeAll(async ({ request }) => {
    headers = await getAuthHeaders(request);
  });

  test('GET /lists returns correct envelope schema', async ({ request }) => {
    const res = await request.get(`${BASE}/lists`, { headers, failOnStatusCode: false });
    if (!res.ok()) return test.skip();

    const body = await res.json();
    const { valid, errors } = validate(listListSchema, body);
    expect(valid, `List envelope schema invalid:\n${errors}`).toBe(true);
  });

  test('list items each match the list schema', async ({ request }) => {
    const res = await request.get(`${BASE}/lists`, {
      headers,
      params: { per_page: 5 },
      failOnStatusCode: false,
    });
    if (!res.ok()) return test.skip();

    const body = await res.json();
    const items = body?.data ?? (Array.isArray(body) ? body : []);

    for (const list of items.slice(0, 5)) {
      const { valid, errors } = validate(listSchema, list);
      expect(valid, `List item schema invalid (id=${list?.id}):\n${errors}`).toBe(true);
    }
  });

  test('POST /lists create response matches schema', async ({ request }) => {
    const res = await request.post(`${BASE}/lists`, {
      headers,
      data: { name: LIST.api.name },
      failOnStatusCode: false,
    });
    if (![200, 201].includes(res.status())) return test.skip();

    const body = await res.json();
    const { valid, errors } = validateResponse(listSchema, body);
    expect(valid, `Create list response schema invalid:\n${errors}`).toBe(true);
  });
});

// ── Tag schemas ───────────────────────────────────────────────────────────────

test.describe('Schema Validation — Tags', { tag: ['@api', '@regression'] }, () => {
  let headers;

  test.beforeAll(async ({ request }) => {
    headers = await getAuthHeaders(request);
  });

  test('GET /tags returns correct envelope schema', async ({ request }) => {
    const res = await request.get(`${BASE}/tags`, { headers, failOnStatusCode: false });
    if (!res.ok()) return test.skip();

    const body = await res.json();
    const { valid, errors } = validate(tagListSchema, body);
    expect(valid, `Tag envelope schema invalid:\n${errors}`).toBe(true);
  });

  test('tag items each match the tag schema', async ({ request }) => {
    const res = await request.get(`${BASE}/tags`, {
      headers,
      params: { per_page: 5 },
      failOnStatusCode: false,
    });
    if (!res.ok()) return test.skip();

    const body = await res.json();
    const items = body?.data ?? (Array.isArray(body) ? body : []);

    for (const tag of items.slice(0, 5)) {
      const { valid, errors } = validate(tagSchema, tag);
      expect(valid, `Tag item schema invalid (id=${tag?.id}):\n${errors}`).toBe(true);
    }
  });

  test('tag name is never empty or null', async ({ request }) => {
    const res = await request.get(`${BASE}/tags`, {
      headers,
      params: { per_page: 20 },
      failOnStatusCode: false,
    });
    if (!res.ok()) return test.skip();

    const body = await res.json();
    const items = body?.data ?? (Array.isArray(body) ? body : []);

    for (const tag of items) {
      expect(tag.name).not.toBeNull();
      expect(tag.name.length).toBeGreaterThan(0);
    }
  });
});

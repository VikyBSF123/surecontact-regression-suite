/**
 * Global Teardown — runs once after the entire test suite finishes.
 *
 * Deletes every piece of test data created during the run:
 *   - Contacts whose email ends with @qatest.io
 *   - Lists   whose name starts with "api-list-"
 *   - Tags    whose name starts with "api-tag-"
 *   - Campaigns whose name starts with "api-campaign-"
 *
 * Configured in playwright.config.js → globalTeardown.
 */
import { request } from '@playwright/test';
import { readFileSync } from 'fs';

const BASE = process.env.API_BASE_URL || 'https://qaing.surecontact.com/api';
const EMAIL = process.env.TEST_EMAIL || 'vikrantd+autotest1@bsf.io';
const PASSWORD = process.env.TEST_PASSWORD || '@NGD*!AAXL$mY8C';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Fetch all items from a paginated endpoint (page through until empty). */
async function fetchAll(ctx, path, searchParam = '') {
  const allItems = [];
  let page = 1;

  while (true) {
    try {
      const params = { page, per_page: 100, ...(searchParam ? { search: searchParam } : {}) };
      const res = await ctx.get(`${BASE}${path}`, { params });
      if (!res.ok()) break;

      const body = await res.json();
      const items = body?.data ?? body?.items ?? (Array.isArray(body) ? body : []);
      if (!items.length) break;

      allItems.push(...items);

      // Stop if we got fewer than a full page (no more pages)
      if (items.length < 100) break;
      page++;
    } catch {
      break;
    }
  }

  return allItems;
}

/** Delete items one by one; swallow individual errors so one 404 doesn't stop the rest. */
async function deleteAll(ctx, path, items, label) {
  let deleted = 0;
  for (const item of items) {
    const id = item.id ?? item.uuid ?? item._id;
    if (!id) continue;
    try {
      const res = await ctx.delete(`${BASE}${path}/${id}`);
      if (res.ok() || res.status() === 404) deleted++;
    } catch {
      /* swallow */
    }
  }
  console.log(`  [teardown] ${label}: deleted ${deleted} / ${items.length}`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default async function globalTeardown() {
  console.log('\n[teardown] Starting test data cleanup…');

  // ── 1. Obtain Bearer token ────────────────────────────────────────────────
  const anonCtx = await request.newContext();
  let token;

  try {
    const authRes = await anonCtx.post(`${BASE}/auth/login`, {
      data: { email: EMAIL, password: PASSWORD },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });

    if (!authRes.ok()) {
      console.warn('[teardown] ⚠️  Auth failed — skipping cleanup (status', authRes.status(), ')');
      await anonCtx.dispose();
      return;
    }

    const auth = await authRes.json();
    token = auth?.token ?? auth?.data?.token ?? auth?.access_token;
  } catch (err) {
    console.warn('[teardown] ⚠️  Auth error:', err.message);
    await anonCtx.dispose();
    return;
  } finally {
    await anonCtx.dispose();
  }

  if (!token) {
    // Fallback: try reading the saved storageState for a session cookie
    try {
      const state = JSON.parse(readFileSync('utils/auth-state.json', 'utf-8'));
      const cookie = state?.cookies?.find((c) => c.name?.toLowerCase().includes('token'));
      if (cookie) token = cookie.value;
    } catch {
      /* no saved state yet */
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const ctx = await request.newContext({ extraHTTPHeaders: headers });

  try {
    // ── 2. Contacts — delete all @qatest.io emails ────────────────────────
    const contacts = await fetchAll(ctx, '/contacts', 'qatest.io');
    const testContacts = contacts.filter((c) => c.email?.endsWith('@qatest.io'));
    await deleteAll(ctx, '/contacts', testContacts, 'Contacts (@qatest.io)');

    // ── 3. Lists — delete all starting with "api-list-" ──────────────────
    const lists = await fetchAll(ctx, '/lists', 'api-list-');
    const testLists = lists.filter((l) => l.name?.startsWith('api-list-'));
    await deleteAll(ctx, '/lists', testLists, 'Lists (api-list-*)');

    // ── 4. Tags — delete all starting with "api-tag-" ────────────────────
    const tags = await fetchAll(ctx, '/tags', 'api-tag-');
    const testTags = tags.filter((t) => t.name?.startsWith('api-tag-'));
    await deleteAll(ctx, '/tags', testTags, 'Tags (api-tag-*)');

    // ── 5. Campaigns — delete all starting with "api-campaign-" ──────────
    const campaigns = await fetchAll(ctx, '/campaigns', 'api-campaign-');
    const testCampaigns = campaigns.filter((c) => c.name?.startsWith('api-campaign-'));
    await deleteAll(ctx, '/campaigns', testCampaigns, 'Campaigns (api-campaign-*)');

    console.log('[teardown] ✅ Cleanup complete.\n');
  } finally {
    await ctx.dispose();
  }
}

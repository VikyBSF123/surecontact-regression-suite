/**
 * ApiHelper — lightweight authenticated API client for use inside
 * test.beforeAll / test.afterAll hooks where the `request` fixture
 * is available but has no session by default.
 *
 * Usage in a spec file:
 *
 *   import { ApiHelper } from '../../utils/api-helper.js';
 *
 *   let helper;
 *   let contactId;
 *
 *   test.beforeAll(async ({ request }) => {
 *     helper = await ApiHelper.create(request);
 *     const contact = await helper.createContact({ email: 'foo@qatest.io' });
 *     contactId = contact.id;
 *   });
 *
 *   test.afterAll(async () => {
 *     await helper.deleteContact(contactId);
 *   });
 */

const BASE = process.env.API_BASE_URL || 'https://qaing.surecontact.com/api';
const EMAIL = process.env.TEST_EMAIL || 'vikrantd+autotest1@bsf.io';
const PASSWORD = process.env.TEST_PASSWORD || '@NGD*!AAXL$mY8C';

export class ApiHelper {
  constructor(request, token) {
    this.request = request;
    this.token = token;
    this.base = BASE;
  }

  /** Factory method — authenticates and returns a ready-to-use ApiHelper. */
  static async create(request) {
    const res = await request.post(`${BASE}/auth/login`, {
      data: { email: EMAIL, password: PASSWORD },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });

    let token = null;
    if (res.ok()) {
      const body = await res.json();
      token = body?.token ?? body?.data?.token ?? body?.access_token;
    }

    return new ApiHelper(request, token);
  }

  _headers() {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    };
  }

  /** Raw HTTP methods */
  get(path, params = {}) {
    return this.request.get(`${this.base}${path}`, { headers: this._headers(), params });
  }
  post(path, data = {}) {
    return this.request.post(`${this.base}${path}`, { headers: this._headers(), data });
  }
  patch(path, data = {}) {
    return this.request.patch(`${this.base}${path}`, { headers: this._headers(), data });
  }
  delete(path) {
    return this.request.delete(`${this.base}${path}`, { headers: this._headers() });
  }

  // ── Contacts ──────────────────────────────────────────────────────────────

  async createContact(payload) {
    const res = await this.post('/contacts', payload);
    if (!res.ok()) return null;
    const body = await res.json();
    return body?.data ?? body;
  }

  async deleteContact(id) {
    if (!id) return;
    await this.delete(`/contacts/${id}`).catch(() => {});
  }

  async findContactByEmail(email) {
    const res = await this.get('/contacts', { search: email });
    if (!res.ok()) return null;
    const body = await res.json();
    const items = body?.data ?? (Array.isArray(body) ? body : []);
    return items.find((c) => c.email === email) ?? null;
  }

  // ── Lists ─────────────────────────────────────────────────────────────────

  async createList(payload) {
    const res = await this.post('/lists', payload);
    if (!res.ok()) return null;
    const body = await res.json();
    return body?.data ?? body;
  }

  async deleteList(id) {
    if (!id) return;
    await this.delete(`/lists/${id}`).catch(() => {});
  }

  // ── Tags ──────────────────────────────────────────────────────────────────

  async createTag(payload) {
    const res = await this.post('/tags', payload);
    if (!res.ok()) return null;
    const body = await res.json();
    return body?.data ?? body;
  }

  async deleteTag(id) {
    if (!id) return;
    await this.delete(`/tags/${id}`).catch(() => {});
  }

  // ── Campaigns ─────────────────────────────────────────────────────────────

  async createCampaign(payload) {
    const res = await this.post('/campaigns', payload);
    if (!res.ok()) return null;
    const body = await res.json();
    return body?.data ?? body;
  }

  async deleteCampaign(id) {
    if (!id) return;
    await this.delete(`/campaigns/${id}`).catch(() => {});
  }

  // ── Utility ───────────────────────────────────────────────────────────────

  /** Returns true if the last response indicates success. */
  static isOk(res) {
    return res && [200, 201, 204].includes(res.status());
  }
}

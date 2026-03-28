/**
 * ApiClient — base HTTP client for SureContact API tests.
 *
 * Uses Playwright's built-in `APIRequestContext` so every request is
 * automatically scoped to the test and its auth state.
 *
 * Usage:
 *   import { ApiClient } from '../utils/api/ApiClient.js';
 *   const api = new ApiClient(request, process.env.API_BASE_URL);
 *   const res = await api.get('/contacts');
 */
export class ApiClient {
  /**
   * @param {import('@playwright/test').APIRequestContext} request
   * @param {string} baseURL  — e.g. https://qaing.surecontact.com/api
   */
  constructor(request, baseURL) {
    this.request = request;
    this.baseURL = (baseURL || 'https://qaing.surecontact.com/api').replace(/\/$/, '');
    this.authToken = null;
  }

  /** Set a Bearer token for subsequent requests. */
  setAuthToken(token) {
    this.authToken = token;
  }

  _headers(extra = {}) {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
      ...extra,
    };
  }

  async get(path, params = {}) {
    const url = this.baseURL + path;
    return this.request.get(url, { headers: this._headers(), params });
  }

  async post(path, body = {}) {
    const url = this.baseURL + path;
    return this.request.post(url, { headers: this._headers(), data: body });
  }

  async patch(path, body = {}) {
    const url = this.baseURL + path;
    return this.request.patch(url, { headers: this._headers(), data: body });
  }

  async put(path, body = {}) {
    const url = this.baseURL + path;
    return this.request.put(url, { headers: this._headers(), data: body });
  }

  async delete(path) {
    const url = this.baseURL + path;
    return this.request.delete(url, { headers: this._headers() });
  }

  /**
   * Obtain a Bearer token via the /login endpoint and store it
   * for all subsequent calls on this client instance.
   */
  async authenticate(email, password) {
    const res = await this.post('/auth/login', { email, password });
    if (res.ok()) {
      const body = await res.json();
      const token = body?.token || body?.data?.token || body?.access_token;
      if (token) this.setAuthToken(token);
    }
    return res;
  }
}

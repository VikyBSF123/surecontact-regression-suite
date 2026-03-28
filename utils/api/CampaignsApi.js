import { ApiClient } from './ApiClient.js';

export class CampaignsApi extends ApiClient {
  list(params = {}) {
    return this.get('/campaigns', params);
  }

  getById(id) {
    return super.get(`/campaigns/${id}`);
  }

  create(payload) {
    return this.post('/campaigns', payload);
  }

  update(id, payload) {
    return this.patch(`/campaigns/${id}`, payload);
  }

  remove(id) {
    return this.delete(`/campaigns/${id}`);
  }

  send(id) {
    return this.post(`/campaigns/${id}/send`);
  }

  stats(id) {
    return super.get(`/campaigns/${id}/stats`);
  }
}

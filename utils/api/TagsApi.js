import { ApiClient } from './ApiClient.js';

export class TagsApi extends ApiClient {
  list(params = {}) {
    return this.get('/tags', params);
  }

  getById(id) {
    return super.get(`/tags/${id}`);
  }

  create(payload) {
    return this.post('/tags', payload);
  }

  update(id, payload) {
    return this.patch(`/tags/${id}`, payload);
  }

  remove(id) {
    return this.delete(`/tags/${id}`);
  }

  assignToContact(tagId, contactId) {
    return this.post(`/tags/${tagId}/contacts`, { contact_id: contactId });
  }
}

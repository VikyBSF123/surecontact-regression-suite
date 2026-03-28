import { ApiClient } from './ApiClient.js';

export class ListsApi extends ApiClient {
  list(params = {}) {
    return this.get('/lists', params);
  }

  getById(id) {
    return super.get(`/lists/${id}`);
  }

  create(payload) {
    return this.post('/lists', payload);
  }

  update(id, payload) {
    return this.patch(`/lists/${id}`, payload);
  }

  remove(id) {
    return this.delete(`/lists/${id}`);
  }

  addContact(listId, contactId) {
    return this.post(`/lists/${listId}/contacts`, { contact_id: contactId });
  }

  removeContact(listId, contactId) {
    return this.delete(`/lists/${listId}/contacts/${contactId}`);
  }
}

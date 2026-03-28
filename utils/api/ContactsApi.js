import { ApiClient } from './ApiClient.js';

export class ContactsApi extends ApiClient {
  /** List contacts with optional search / pagination. */
  list(params = {}) {
    return this.get('/contacts', params);
  }

  /** Get a single contact by ID. */
  get(id) {
    return super.get(`/contacts/${id}`);
  }

  /** Create a new contact. */
  create(payload) {
    return this.post('/contacts', payload);
  }

  /** Update an existing contact. */
  update(id, payload) {
    return this.patch(`/contacts/${id}`, payload);
  }

  /** Delete a contact. */
  remove(id) {
    return this.delete(`/contacts/${id}`);
  }

  /** Search contacts by email / name. */
  search(term) {
    return this.list({ search: term });
  }
}

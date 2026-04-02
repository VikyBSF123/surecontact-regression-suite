import { ApiClient } from './ApiClient.js';

export class ContactsApi extends ApiClient {
  /** List contacts with optional search / pagination / filters. */
  list(params = {}) {
    return super.get('/contacts', params);
  }

  /** Get a single contact by UUID. */
  getOne(uuid) {
    return super.get(`/contacts/${uuid}`);
  }

  /**
   * Create a contact. Accepts flat payload and wraps email under primary_fields
   * as required by the real SureContact API.
   */
  create(payload) {
    const {
      email,
      first_name,
      last_name,
      phone,
      company,
      job_title,
      status,
      tags,
      lists,
      ...rest
    } = payload;
    return this.post('/contacts', {
      primary_fields: { email, first_name, last_name, phone, company, job_title, status },
      ...(tags ? { tags } : {}),
      ...(lists ? { lists } : {}),
      ...rest,
    });
  }

  /** Full update (PUT) on a contact. */
  update(uuid, payload) {
    const { email, first_name, last_name, phone, company, job_title, status, ...rest } = payload;
    return this.put(`/contacts/${uuid}`, {
      primary_fields: { email, first_name, last_name, phone, company, job_title, status },
      ...rest,
    });
  }

  /** Partial update (PATCH) on a contact. */
  patch(uuid, payload) {
    return super.patch(`/contacts/${uuid}`, payload);
  }

  /** Update contact status. */
  updateStatus(uuid, status) {
    return super.patch(`/contacts/${uuid}/status`, { status });
  }

  /** Delete a contact. */
  remove(uuid) {
    return this.delete(`/contacts/${uuid}`);
  }

  /** Search contacts by email / name. */
  search(term) {
    return this.list({ search: term });
  }

  /** Attach tags to a contact. */
  attachTags(uuid, tagUuids) {
    return this.post(`/contacts/${uuid}/tags/attach`, { tag_uuids: tagUuids });
  }

  /** Detach tags from a contact. */
  detachTags(uuid, tagUuids) {
    return this.post(`/contacts/${uuid}/tags/detach`, { tag_uuids: tagUuids });
  }

  /** Attach lists to a contact. */
  attachLists(uuid, listUuids) {
    return this.post(`/contacts/${uuid}/lists/attach`, { list_uuids: listUuids });
  }

  /** Detach lists from a contact. */
  detachLists(uuid, listUuids) {
    return this.post(`/contacts/${uuid}/lists/detach`, { list_uuids: listUuids });
  }

  /** Get contact activity log. */
  activities(uuid, params = {}) {
    return super.get(`/contacts/${uuid}/activities`, params);
  }
}

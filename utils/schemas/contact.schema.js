/**
 * JSON Schema — Contact API response shapes.
 * Matches the real SureContact Laravel API responses.
 *
 * All API responses use: { success: bool, data: {...}, message?: string }
 * List responses add:   { meta: { current_page, total, per_page, last_page } }
 */

/** Shape of a single contact object inside data. */
export const contactSchema = {
  type: 'object',
  required: ['uuid', 'email'],
  additionalProperties: true,
  properties: {
    uuid: { type: 'string', minLength: 1 },
    email: { type: 'string', format: 'email' },
    first_name: { type: ['string', 'null'] },
    last_name: { type: ['string', 'null'] },
    phone: { type: ['string', 'null'] },
    company: { type: ['string', 'null'] },
    job_title: { type: ['string', 'null'] },
    prefix: { type: ['string', 'null'] },
    suffix: { type: ['string', 'null'] },
    status: {
      type: 'string',
      enum: ['pending', 'active', 'unsubscribed', 'bounced', 'invalid', 'complained'],
    },
    source: {
      type: ['string', 'null'],
      enum: ['manual', 'wordpress', 'api', 'import', 'form', 'webhook', null],
    },
    gender: {
      type: ['string', 'null'],
      enum: ['male', 'female', 'other', 'prefer_not_to_say', null],
    },
    timezone: { type: ['string', 'null'] },
    language: { type: ['string', 'null'] },
    created_at: { type: ['string', 'null'] },
    updated_at: { type: ['string', 'null'] },
    tags: { type: ['array', 'null'] },
    lists: { type: ['array', 'null'] },
  },
};

/** Pagination meta block returned in list responses. */
const paginationMeta = {
  type: 'object',
  properties: {
    current_page: { type: 'integer' },
    last_page: { type: 'integer' },
    per_page: { type: 'integer' },
    total: { type: 'integer' },
  },
};

/** Schema for GET /contacts (list response). */
export const contactListSchema = {
  type: 'object',
  required: ['success', 'data'],
  properties: {
    success: { type: 'boolean', const: true },
    data: {
      type: 'array',
      items: contactSchema,
    },
    meta: paginationMeta,
    message: { type: ['string', 'null'] },
  },
};

/** Schema for POST /contacts and GET /contacts/:uuid (single response). */
export const contactResponseSchema = {
  type: 'object',
  required: ['success', 'data'],
  properties: {
    success: { type: 'boolean', const: true },
    data: contactSchema,
    message: { type: ['string', 'null'] },
  },
};

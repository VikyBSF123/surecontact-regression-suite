/**
 * JSON Schema — List API response shapes.
 * Matches real SureContact Laravel API: { success, data, meta? }
 */

export const listSchema = {
  type: 'object',
  required: ['uuid', 'name'],
  additionalProperties: true,
  properties: {
    uuid: { type: 'string', minLength: 1 },
    name: { type: 'string', minLength: 1 },
    description: { type: ['string', 'null'] },
    type: {
      type: ['string', 'null'],
      enum: ['static', 'dynamic', null],
    },
    contact_count: { type: ['integer', 'null'] },
    is_system: { type: ['boolean', 'null'] },
    created_at: { type: ['string', 'null'] },
    updated_at: { type: ['string', 'null'] },
  },
};

const paginationMeta = {
  type: 'object',
  properties: {
    current_page: { type: 'integer' },
    last_page: { type: 'integer' },
    per_page: { type: 'integer' },
    total: { type: 'integer' },
  },
};

export const listListSchema = {
  type: 'object',
  required: ['success', 'data'],
  properties: {
    success: { type: 'boolean', const: true },
    data: { type: 'array', items: listSchema },
    meta: paginationMeta,
    message: { type: ['string', 'null'] },
  },
};

export const listResponseSchema = {
  type: 'object',
  required: ['success', 'data'],
  properties: {
    success: { type: 'boolean', const: true },
    data: listSchema,
    message: { type: ['string', 'null'] },
  },
};

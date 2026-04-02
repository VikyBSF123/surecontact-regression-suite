/**
 * JSON Schema — Tag API response shapes.
 * Matches real SureContact Laravel API: { success, data, meta? }
 */

export const tagSchema = {
  type: 'object',
  required: ['uuid', 'name'],
  additionalProperties: true,
  properties: {
    uuid: { type: 'string', minLength: 1 },
    name: { type: 'string', minLength: 1 },
    color: { type: ['string', 'null'] }, // hex color e.g. "#FF5733"
    description: { type: ['string', 'null'] },
    usage_count: { type: ['integer', 'null'] },
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

export const tagListSchema = {
  type: 'object',
  required: ['success', 'data'],
  properties: {
    success: { type: 'boolean', const: true },
    data: { type: 'array', items: tagSchema },
    meta: paginationMeta,
    message: { type: ['string', 'null'] },
  },
};

export const tagResponseSchema = {
  type: 'object',
  required: ['success', 'data'],
  properties: {
    success: { type: 'boolean', const: true },
    data: tagSchema,
    message: { type: ['string', 'null'] },
  },
};

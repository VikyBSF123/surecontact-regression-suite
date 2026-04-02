/**
 * JSON Schema — Campaign API response shapes.
 * Matches real SureContact Laravel API: { success, data, meta? }
 */

export const campaignSchema = {
  type: 'object',
  required: ['uuid', 'name'],
  additionalProperties: true,
  properties: {
    uuid: { type: 'string', minLength: 1 },
    name: { type: 'string', minLength: 1 },
    subject: { type: ['string', 'null'] },
    preview_text: { type: ['string', 'null'] },
    from_name: { type: ['string', 'null'] },
    from_email: { type: ['string', 'null'] },
    reply_to: { type: ['string', 'null'] },
    status: {
      type: 'string',
      enum: ['draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled'],
    },
    track_opens: { type: ['boolean', 'null'] },
    track_clicks: { type: ['boolean', 'null'] },
    send_at: { type: ['string', 'null'] },
    sent_at: { type: ['string', 'null'] },
    completed_at: { type: ['string', 'null'] },
    created_at: { type: ['string', 'null'] },
    updated_at: { type: ['string', 'null'] },
    stats: { type: ['object', 'null'] },
    filters: { type: ['object', 'null'] },
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

export const campaignListSchema = {
  type: 'object',
  required: ['success', 'data'],
  properties: {
    success: { type: 'boolean', const: true },
    data: { type: 'array', items: campaignSchema },
    meta: paginationMeta,
    message: { type: ['string', 'null'] },
  },
};

export const campaignResponseSchema = {
  type: 'object',
  required: ['success', 'data'],
  properties: {
    success: { type: 'boolean', const: true },
    data: campaignSchema,
    message: { type: ['string', 'null'] },
  },
};

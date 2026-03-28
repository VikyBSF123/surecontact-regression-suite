export const campaignSchema = {
  type: 'object',
  required: ['name'],
  additionalProperties: true,
  properties: {
    id: { type: ['integer', 'string'] },
    uuid: { type: 'string' },
    name: { type: 'string', minLength: 1 },
    subject: { type: ['string', 'null'] },
    status: { type: ['string', 'null'], enum: ['draft', 'scheduled', 'sent', 'sending', null] },
    created_at: { type: ['string', 'null'] },
    updated_at: { type: ['string', 'null'] },
    sent_at: { type: ['string', 'null'] },
    opens_count: { type: ['integer', 'null'] },
    clicks_count: { type: ['integer', 'null'] },
  },
};

export const campaignListSchema = {
  type: 'object',
  oneOf: [
    {
      required: ['data'],
      properties: {
        data: { type: 'array', items: campaignSchema },
        total: { type: 'integer' },
        per_page: { type: 'integer' },
        current_page: { type: 'integer' },
      },
    },
    { type: 'array', items: campaignSchema },
  ],
};

export const campaignResponseSchema = {
  type: 'object',
  oneOf: [{ required: ['data'], properties: { data: campaignSchema } }, campaignSchema],
};

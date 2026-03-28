export const tagSchema = {
  type: 'object',
  required: ['name'],
  additionalProperties: true,
  properties: {
    id: { type: ['integer', 'string'] },
    uuid: { type: 'string' },
    name: { type: 'string', minLength: 1 },
    contacts_count: { type: ['integer', 'null'] },
    created_at: { type: ['string', 'null'] },
    updated_at: { type: ['string', 'null'] },
  },
};

export const tagListSchema = {
  type: 'object',
  oneOf: [
    {
      required: ['data'],
      properties: {
        data: { type: 'array', items: tagSchema },
        total: { type: 'integer' },
        per_page: { type: 'integer' },
        current_page: { type: 'integer' },
      },
    },
    { type: 'array', items: tagSchema },
  ],
};

export const tagResponseSchema = {
  type: 'object',
  oneOf: [{ required: ['data'], properties: { data: tagSchema } }, tagSchema],
};

export const listSchema = {
  type: 'object',
  required: ['name'],
  additionalProperties: true,
  properties: {
    id: { type: ['integer', 'string'] },
    uuid: { type: 'string' },
    name: { type: 'string', minLength: 1 },
    description: { type: ['string', 'null'] },
    contacts_count: { type: ['integer', 'null'] },
    created_at: { type: ['string', 'null'] },
    updated_at: { type: ['string', 'null'] },
  },
};

export const listListSchema = {
  type: 'object',
  oneOf: [
    {
      required: ['data'],
      properties: {
        data: { type: 'array', items: listSchema },
        total: { type: 'integer' },
        per_page: { type: 'integer' },
        current_page: { type: 'integer' },
      },
    },
    { type: 'array', items: listSchema },
  ],
};

export const listResponseSchema = {
  type: 'object',
  oneOf: [{ required: ['data'], properties: { data: listSchema } }, listSchema],
};

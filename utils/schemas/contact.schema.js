/**
 * JSON Schema — Contact API response object.
 * Used by AJV to validate that the API returns the correct shape,
 * not just a successful status code.
 */
export const contactSchema = {
  type: 'object',
  required: ['email'],
  additionalProperties: true,
  properties: {
    id: { type: ['integer', 'string'] },
    uuid: { type: 'string' },
    email: { type: 'string', format: 'email' },
    first_name: { type: ['string', 'null'] },
    last_name: { type: ['string', 'null'] },
    phone: { type: ['string', 'null'] },
    company: { type: ['string', 'null'] },
    created_at: { type: ['string', 'null'] },
    updated_at: { type: ['string', 'null'] },
  },
};

/** Schema for the list-contacts response envelope. */
export const contactListSchema = {
  type: 'object',
  oneOf: [
    // Paginated envelope: { data: [...], total, per_page, current_page }
    {
      required: ['data'],
      properties: {
        data: {
          type: 'array',
          items: contactSchema,
        },
        total: { type: 'integer' },
        per_page: { type: 'integer' },
        current_page: { type: 'integer' },
      },
    },
    // Or plain array
    {
      type: 'array',
      items: contactSchema,
    },
  ],
};

/** Schema for the create/update contact response. */
export const contactResponseSchema = {
  type: 'object',
  oneOf: [
    // Wrapped: { data: { ...contact } }
    {
      required: ['data'],
      properties: {
        data: contactSchema,
      },
    },
    // Flat: { ...contact }
    contactSchema,
  ],
};

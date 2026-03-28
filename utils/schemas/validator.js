/**
 * AJV Schema Validator
 *
 * Usage in API tests:
 *   import { validate } from '../../utils/schemas/validator.js';
 *   import { contactSchema } from '../../utils/schemas/contact.schema.js';
 *
 *   const body = await res.json();
 *   const { valid, errors } = validate(contactSchema, body);
 *   expect(valid, `Schema validation failed:\n${errors}`).toBe(true);
 */
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({
  allErrors: true, // collect ALL errors, not just the first
  strict: false, // allow additionalProperties by default
  discriminator: false,
});
addFormats(ajv);

/**
 * Validates data against a JSON schema.
 * @param {object} schema — AJV-compatible JSON schema
 * @param {unknown} data  — the value to validate (usually a parsed JSON body)
 * @returns {{ valid: boolean, errors: string }}
 */
export function validate(schema, data) {
  const validateFn = ajv.compile(schema);
  const valid = validateFn(data);

  if (valid) return { valid: true, errors: '' };

  const errors = (validateFn.errors ?? [])
    .map((e) => `  • ${e.instancePath || '(root)'} ${e.message}`)
    .join('\n');

  return { valid: false, errors };
}

/**
 * Unwraps a possible { data: ... } envelope before validating.
 * Handles APIs that return both wrapped and unwrapped shapes.
 */
export function validateResponse(schema, body) {
  const data = body?.data !== undefined ? body.data : body;
  return validate(schema, data);
}

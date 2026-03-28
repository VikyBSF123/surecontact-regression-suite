export const BASE_URL = process.env.BASE_URL || 'https://qaing.surecontact.com';
export const API_BASE_URL = process.env.API_BASE_URL || 'https://qaing.surecontact.com/api';

export const CREDENTIALS = {
  // Shorthand for API clients that just need email + password
  email: process.env.TEST_EMAIL || 'vikrantd+autotest1@bsf.io',
  password: process.env.TEST_PASSWORD || '@NGD*!AAXL$mY8C',
  valid: {
    email: process.env.TEST_EMAIL || 'vikrantd+autotest1@bsf.io',
    password: process.env.TEST_PASSWORD || '@NGD*!AAXL$mY8C',
  },
  invalid: {
    email: 'invalid@example.com',
    password: 'WrongPassword123',
  },
  wrongPassword: {
    email: process.env.TEST_EMAIL || 'vikrantd+autotest1@bsf.io',
    password: 'WrongPassword999',
  },
};

export const CONTACT = {
  valid: {
    firstName: 'Test',
    lastName: 'Contact',
    email: `testcontact+${Date.now()}@example.com`,
    phone: '+14155552671',
  },
  duplicate: {
    email: 'vikrantd+autotest1@bsf.io',
  },
  invalidEmail: {
    firstName: 'Bad',
    lastName: 'Email',
    email: 'not-an-email',
  },
  missingEmail: {
    firstName: 'No',
    lastName: 'Email',
    email: '',
  },
  edgeCases: {
    longName: 'A'.repeat(256),
    specialChars: 'Test <script>alert(1)</script>',
    unicodeName: 'Ñoño García',
    email: `edge+${Date.now()}@example.com`,
  },
  // Used by API tests only — stable addresses for create / update / delete
  api: {
    email: `api-create+${Date.now()}@example.com`,
    firstName: 'ApiFirst',
    lastName: 'ApiLast',
    updateEmail: `api-update+${Date.now()}@example.com`,
    deleteEmail: `api-delete+${Date.now()}@example.com`,
  },
};

export const LIST = {
  valid: { name: `Test List ${Date.now()}`, description: 'Automated test list' },
  empty: { name: '', description: '' },
  duplicate: { name: 'Duplicate List' },
  longName: { name: 'A'.repeat(256) },
  api: { name: `api-list-${Date.now()}` },
};

export const TAG = {
  valid: { name: `test-tag-${Date.now()}` },
  empty: { name: '' },
  specialChars: { name: 'tag with spaces & symbols!' },
  api: { name: `api-tag-${Date.now()}` },
};

export const CAMPAIGN = {
  valid: {
    name: `Test Campaign ${Date.now()}`,
    subject: 'Automated Test Email Subject',
    previewText: 'Preview text for testing',
  },
  empty: { name: '', subject: '' },
  longSubject: { subject: 'A'.repeat(500) },
  api: { name: `api-campaign-${Date.now()}` },
};

export const WORKFLOW = {
  valid: { name: `Test Workflow ${Date.now()}` },
  empty: { name: '' },
};

export const FORM = {
  valid: { name: `Test Form ${Date.now()}` },
  empty: { name: '' },
};

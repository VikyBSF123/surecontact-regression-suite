export const BASE_URL = process.env.BASE_URL || 'https://qaing.surecontact.com';
export const API_BASE_URL = process.env.API_BASE_URL || 'https://api-qaing.surecontact.com';

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

// Real contact status values from SureContact Laravel API
export const CONTACT_STATUSES = [
  'pending',
  'active',
  'unsubscribed',
  'bounced',
  'invalid',
  'complained',
];

// Real campaign status values from SureContact Laravel API
export const CAMPAIGN_STATUSES = ['draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled'];

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
  // API test data — uses @qatest.io domain so global teardown auto-cleans them
  api: {
    email: `api-create+${Date.now()}@qatest.io`,
    firstName: 'ApiFirst',
    lastName: 'ApiLast',
    updateEmail: `api-update+${Date.now()}@qatest.io`,
    deleteEmail: `api-delete+${Date.now()}@qatest.io`,
    patchEmail: `api-patch+${Date.now()}@qatest.io`,
    statusEmail: `api-status+${Date.now()}@qatest.io`,
    tagEmail: `api-tag+${Date.now()}@qatest.io`,
    listEmail: `api-list+${Date.now()}@qatest.io`,
  },
};

export const LIST = {
  valid: { name: `Test List ${Date.now()}`, description: 'Automated test list' },
  empty: { name: '', description: '' },
  duplicate: { name: 'Duplicate List' },
  longName: { name: 'A'.repeat(256) },
  // Uses "api-list-" prefix so global teardown auto-cleans them
  api: { name: `api-list-${Date.now()}` },
};

export const TAG = {
  valid: { name: `test-tag-${Date.now()}` },
  empty: { name: '' },
  specialChars: { name: 'tag with spaces & symbols!' },
  withColor: { name: `api-tag-color-${Date.now()}`, color: '#FF5733' },
  // Uses "api-tag-" prefix so global teardown auto-cleans them
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
  // Uses "api-campaign-" prefix so global teardown auto-cleans them
  api: {
    name: `api-campaign-${Date.now()}`,
    subject: 'API Test Campaign Subject',
    from_name: 'Test Sender',
  },
};

export const WORKFLOW = {
  valid: { name: `Test Workflow ${Date.now()}` },
  empty: { name: '' },
};

export const FORM = {
  valid: { name: `Test Form ${Date.now()}` },
  empty: { name: '' },
};

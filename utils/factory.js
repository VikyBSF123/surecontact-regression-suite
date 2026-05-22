/**
 * Data Factory — generates realistic, randomised test data using @faker-js/faker.
 *
 * Usage:
 *   import { Factory } from '../utils/factory.js';
 *
 *   const contact  = Factory.contact();
 *   const campaign = Factory.campaign();
 *   const list     = Factory.list();
 */
import { faker } from '@faker-js/faker';

export const Factory = {
  // ── Contact ────────────────────────────────────────────────────────────────
  contact(overrides = {}) {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email({ provider: 'qatest.io' }).toLowerCase(),
      phone: faker.phone.number('+1##########'),
      company: faker.company.name(),
      jobTitle: faker.person.jobTitle(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      country: faker.location.country(),
      zip: faker.location.zipCode(),
      notes: faker.lorem.sentence(),
      ...overrides,
    };
  },

  /** A batch of N unique contacts. */
  contacts(n = 5, overrides = {}) {
    return Array.from({ length: n }, () => this.contact(overrides));
  },

  // ── Campaign ───────────────────────────────────────────────────────────────
  campaign(overrides = {}) {
    return {
      name: `${faker.commerce.productAdjective()} Campaign ${faker.string.alphanumeric(4).toUpperCase()}`,
      subject: faker.lorem.sentence({ min: 4, max: 10 }),
      previewText: faker.lorem.words({ min: 5, max: 12 }),
      fromName: faker.person.fullName(),
      fromEmail: faker.internet.email({ provider: 'qatest.io' }).toLowerCase(),
      ...overrides,
    };
  },

  // ── List ───────────────────────────────────────────────────────────────────
  list(overrides = {}) {
    return {
      name: `${faker.word.adjective()} ${faker.word.noun()} List`,
      description: faker.lorem.sentence(),
      ...overrides,
    };
  },

  // ── Tag ────────────────────────────────────────────────────────────────────
  tag(overrides = {}) {
    return {
      name: `${faker.word.adjective()}-${faker.word.noun()}-${faker.string.alphanumeric(3)}`.toLowerCase(),
      ...overrides,
    };
  },

  // ── Workflow ───────────────────────────────────────────────────────────────
  workflow(overrides = {}) {
    return {
      name: `${faker.word.verb()} ${faker.word.noun()} Workflow`,
      description: faker.lorem.sentence(),
      ...overrides,
    };
  },

  // ── Sequence ───────────────────────────────────────────────────────────────
  sequence(overrides = {}) {
    return {
      name: `${faker.word.adjective()} Sequence ${faker.string.alphanumeric(4).toUpperCase()}`,
      description: faker.lorem.sentence(),
      ...overrides,
    };
  },

  // ── Form ───────────────────────────────────────────────────────────────────
  form(overrides = {}) {
    return {
      name: `${faker.word.adjective()} ${faker.word.noun()} Form`,
      ...overrides,
    };
  },

  // ── User / Profile ─────────────────────────────────────────────────────────
  user(overrides = {}) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    return {
      firstName,
      lastName,
      email: faker.internet.email({ firstName, lastName, provider: 'qatest.io' }).toLowerCase(),
      password: `Qa${faker.string.alphanumeric(10)}!`,
      ...overrides,
    };
  },

  // ── Workspace ──────────────────────────────────────────────────────────────
  workspace(overrides = {}) {
    return {
      name: `${faker.company.name()} Workspace`,
      slug: `ws-${faker.string.alphanumeric(8).toLowerCase()}`,
      timezone: 'UTC',
      ...overrides,
    };
  },

  // ── Template ───────────────────────────────────────────────────────────────
  template(overrides = {}) {
    return {
      name: `${faker.word.adjective()} ${faker.word.noun()} Template`,
      subject: faker.lorem.sentence({ min: 4, max: 10 }),
      previewText: faker.lorem.words({ min: 5, max: 12 }),
      html: `<html><body><h1>${faker.lorem.words(3)}</h1><p>${faker.lorem.paragraph()}</p></body></html>`,
      ...overrides,
    };
  },

  // ── Landing Page ───────────────────────────────────────────────────────────
  page(overrides = {}) {
    return {
      name: `${faker.word.adjective()} ${faker.word.noun()} Page`,
      slug: `lp-${faker.string.alphanumeric(8).toLowerCase()}`,
      title: faker.lorem.words({ min: 3, max: 7 }),
      description: faker.lorem.sentence(),
      ...overrides,
    };
  },

  // ── Helpers ────────────────────────────────────────────────────────────────

  /** A valid-looking email that is unlikely to exist in the system. */
  uniqueEmail() {
    return `qa-${faker.string.uuid().slice(0, 8)}@qatest.io`;
  },

  /** Lorem ipsum of given word count. */
  lorem(words = 10) {
    return faker.lorem.words(words);
  },

  /** Random past date formatted YYYY-MM-DD. */
  pastDate() {
    return faker.date.past().toISOString().split('T')[0];
  },
};

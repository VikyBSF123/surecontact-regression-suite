# Contributing to the Test Suite

This guide covers everything you need to write high-quality Playwright tests that fit the suite's patterns. Read this before writing your first test or reviewing a PR.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Naming Conventions](#naming-conventions)
- [Which Import to Use](#which-import-to-use)
- [Selector Strategy](#selector-strategy)
- [beforeAll vs beforeEach](#beforeall-vs-beforeeach)
- [Soft Assertions](#soft-assertions)
- [test.step() Usage](#teststep-usage)
- [Test Data — Factory vs Constants](#test-data--factory-vs-constants)
- [What Makes a Good Test](#what-makes-a-good-test)
- [What Makes a Bad Test](#what-makes-a-bad-test)
- [Tagging Rules](#tagging-rules)
- [PR Checklist](#pr-checklist)
- [Code Style](#code-style)

---

## Quick Start

```bash
# 1. Run linter before writing anything
npm run lint

# 2. Write your test (see pattern below)

# 3. Run your test in headed mode to watch it
npx playwright test tests/your-module/your-test.spec.js --headed

# 4. Run the full module to ensure no regressions
npm run test:crm  # or whichever module you touched

# 5. Lint and format before committing
npm run lint && npm run format
```

---

## Naming Conventions

### Files
```
tests/
  <module>/
    <feature>.spec.js           # standard UI tests
    <feature>-isolated.spec.js  # API-seeded deterministic tests
    <feature>-factory.spec.js   # Faker-powered data tests
  api/
    <feature>.api.spec.js       # direct API tests
  components/
    <component-name>.ct.js      # component tests
```

### `test.describe` names
```
'Module - Feature'             ✅  'CRM - Contacts'
'Module - Feature (context)'   ✅  'Contacts — Search (API-seeded)'
'test contacts'                ❌  too vague
'ContactsPage'                 ❌  implementation detail
```

### `test()` names — complete sentences, describe what SHOULD happen
```
'search by email returns matching contact'       ✅
'Add Contact button opens modal'                 ✅
'empty email shows validation error'             ✅
'test add contact'                               ❌  no "test" prefix
'should open modal'                              ❌  no "should"
'modal'                                          ❌  not a sentence
```

---

## Which Import to Use

**Always import from `utils/fixtures.js`** — never directly from `@playwright/test`.

```js
// ✅ Correct — gets custom matchers, page objects, and Factory fixture
import { test, expect } from '../../utils/fixtures.js';

// ❌ Wrong — misses custom matchers and fixtures
import { test, expect } from '@playwright/test';
```

The `fixtures.js` re-exports everything from `@playwright/test` plus:
- All page object fixtures (`contactsPage`, `dashboardPage`, etc.)
- Custom matchers (`toShowSuccessToast`, `toBeOnPage`, etc.)
- The `factory` fixture (Faker data generator)

---

## Selector Strategy

Priority order — use the highest one that works:

| Priority | Strategy | Example |
|---|---|---|
| 1 | ARIA role + name | `page.getByRole('button', { name: 'Add Contact' })` |
| 2 | ARIA label | `page.getByLabel('Email address')` |
| 3 | Placeholder text | `page.getByPlaceholder(/search contacts/i)` |
| 4 | Visible text | `page.getByText('No contacts yet')` |
| 5 | `data-testid` | `page.getByTestId('contact-row')` |
| 6 | CSS class | `page.locator('.contact-list-item')` ← **avoid** |
| ❌ | XPath | `page.locator('//div[3]/button')` ← **never** |

**Why ARIA first?** It mirrors how screen readers and users find elements. Tests that pass with ARIA selectors also implicitly test accessibility. CSS classes change during refactors; ARIA roles don't.

```js
// ✅ Resilient — works even after CSS refactors
page.getByRole('button', { name: 'Create Campaign' })

// ❌ Fragile — breaks when class names change
page.locator('.btn-primary.campaign-create-btn')

// ❌ Fragile — breaks when DOM structure changes
page.locator('div > section:nth-child(2) > button')
```

Use **case-insensitive regex** for text that may vary slightly:
```js
page.getByRole('button', { name: /create|new campaign/i })
page.getByPlaceholder(/search/i)
```

---

## beforeAll vs beforeEach

| Hook | Use when | Example |
|---|---|---|
| `beforeEach` | Every test needs a clean page state | `await page.goto('/contacts')` |
| `beforeAll` | Expensive setup shared across tests | Create a contact via API once, use in all tests |
| `afterAll` | Clean up data created in `beforeAll` | Delete the contact created above |
| `afterEach` | Rarely needed — prefer independent tests | Close a modal left open by a failed test |

### `beforeAll` + `afterAll` pattern (for isolated tests)

```js
import { ApiHelper } from '../../utils/api-helper.js';
import { Factory }   from '../../utils/factory.js';

test.describe('Contacts — Search', () => {
  let helper;
  let seededContact;

  test.beforeAll(async ({ request }) => {
    helper = await ApiHelper.create(request);
    seededContact = await helper.createContact(
      Factory.contact({ email: `seed+${Date.now()}@qatest.io` })
    );
  });

  test.afterAll(async () => {
    await helper?.deleteContact(seededContact?.id);
  });

  test('search by email finds the seeded contact', async ({ page }) => {
    // test against known seededContact.email
  });
});
```

**Rules:**
- `beforeAll` data must use `@qatest.io` emails — the global teardown cleans these
- Always pair `beforeAll` creation with `afterAll` deletion — don't rely on teardown alone
- Never share page objects between tests in `beforeAll` — `page` is per-test only

---

## Soft Assertions

Use `expect.soft()` when checking **multiple independent elements on the same page**.
All soft failures are collected and reported together after the test ends.

```js
// ✅ All 5 elements checked, all failures reported at once
test('contacts page loads all elements', async ({ page }) => {
  await test.step('verify page elements', async () => {
    await expect.soft(page.getByRole('heading', { name: 'Contacts' })).toBeVisible();
    await expect.soft(page.getByRole('button', { name: 'Add Contact' })).toBeVisible();
    await expect.soft(page.getByPlaceholder(/search/i)).toBeVisible();
    await expect.soft(page.getByRole('button', { name: 'Import' })).toBeVisible();
    await expect.soft(page.getByRole('button', { name: 'Export' })).toBeVisible();
  });
  expect(test.info().errors).toHaveLength(0);
});

// ❌ Stops at first failure — misses the other 4 problems
test('contacts page loads all elements', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Contacts' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add Contact' })).toBeVisible();
  // ... if first fails, we never know about the others
});
```

**Don't** use `expect.soft()` for flow tests (form submission, navigation) — there, a failure at step 2 makes step 3 meaningless.

---

## test.step() Usage

Wrap every logical group of actions in a named step. This makes the Monocart report timeline readable.

```js
test('add contact with valid data', async ({ page }) => {
  await test.step('open Add Contact modal', async () => {
    await page.getByRole('button', { name: 'Add Contact' }).click();
    await page.waitForTimeout(400);
  });

  await test.step('fill required fields', async () => {
    await page.getByRole('textbox', { name: /email/i }).fill('test@qatest.io');
  });

  await test.step('submit and verify success', async () => {
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page).toShowSuccessToast();
  });
});
```

**Rule of thumb:** if a test has more than 3 actions, use `test.step()`.

---

## Test Data — Factory vs Constants

| Data type | Use |
|---|---|
| Unique per-run (emails, names) | `Factory.contact()`, `factory.uniqueEmail()` |
| Stable across runs (known state) | Constants in `utils/test-data.js` |
| API-seeded before a test | `ApiHelper.createContact(Factory.contact())` |

```js
// ✅ Factory — unique every run, never pollutes other runs
const contact = factory.contact();
await page.getByRole('textbox', { name: /email/i }).fill(contact.email);

// ❌ Hardcoded — collides if test runs twice, hard to read
await page.getByRole('textbox', { name: /email/i }).fill('testuser@example.com');
```

**Email domain rule:** All test-generated emails MUST end in `@qatest.io` so the global teardown can find and delete them.

---

## What Makes a Good Test

✅ **Independent** — can run alone, in any order, any number of times
✅ **Deterministic** — same result every run (uses API seeding, not live data assumptions)
✅ **Readable** — test name explains the behaviour; `test.step()` labels explain the flow
✅ **Fast** — no `waitForTimeout()` where a `waitFor()` could be used
✅ **Scoped** — tests one thing; a failing test points to exactly one problem
✅ **Clean** — deletes data it creates (`afterAll` or `ApiHelper`)

---

## What Makes a Bad Test

❌ **Conditional logic** — `if (hasData) { ... } else { ... }` means the test passes either way
❌ **Hardcoded waits** — `waitForTimeout(3000)` hides timing problems; use `waitForSelector` instead
❌ **Test dependency** — "this test only works if the previous test created a contact"
❌ **Testing implementation** — testing CSS classes or DOM structure that changes during refactors
❌ **Missing assertions** — clicking through a flow with no `expect()` at the end
❌ **Too many assertions** — one 40-step test that covers 8 features; split into 8 tests

---

## Tagging Rules

Every `test.describe` must have at least one tag.

```js
test.describe('My Feature', { tag: ['@regression'] }, () => { ... });
```

| Tag | Add when |
|---|---|
| `@smoke` | Test covers a core sanity check (page loads, login works) |
| `@critical` | Test covers a business-critical flow (create contact, send campaign) |
| `@regression` | All other UI tests (add to every describe) |
| `@api` | Direct HTTP tests (no browser) |
| `@visual` | Screenshot comparison tests |
| `@a11y` | Accessibility tests |
| `@mocked` | Network-intercepted tests |
| `@performance` | Web Vitals / load time tests |
| `@security` | Security header / XSS / auth tests |
| `@flaky` | Temporarily quarantined — see `docs/FLAKY_TESTS.md` |

---

## PR Checklist

Before opening a PR with new or changed tests:

- [ ] Test names are complete sentences describing expected behaviour
- [ ] All imports come from `../../utils/fixtures.js` (not `@playwright/test`)
- [ ] All test emails end in `@qatest.io`
- [ ] Multi-element layout checks use `expect.soft()`
- [ ] Multi-step flows use `test.step()`
- [ ] `beforeAll` data creation is paired with `afterAll` cleanup
- [ ] At least one tag is applied to every `test.describe`
- [ ] No `test.only()` left in the file
- [ ] `npm run lint` passes with no errors
- [ ] `npm run format` applied (no diff from prettier)
- [ ] Test runs locally: `npx playwright test <your-file> --project=chromium`
- [ ] No `waitForTimeout()` used where `waitFor()` would work

---

## Code Style

This project uses **ESLint** + **Prettier**. Configuration is in `eslint.config.js` and `.prettierrc`.

```bash
npm run lint      # check for issues
npm run lint:fix  # auto-fix where possible
npm run format    # apply prettier formatting
```

Pre-commit hooks (Husky) run these automatically on staged files. If your commit is rejected, run the commands above and commit again.

# SureContact Platform — Regression Test Suite

Full end-to-end regression suite for the [SureContact](https://surecontact.com) marketing automation platform, built with **Playwright Test** and **Monocart Reporter**.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Tagging System](#tagging-system)
- [Reports](#reports)
- [Adding a New Test](#adding-a-new-test)
- [Fixture Conventions](#fixture-conventions)
- [Sandboxed Workspace Strategy](#sandboxed-workspace-strategy)
- [Mail Assertion Helper](#mail-assertion-helper)
- [Realtime Stubbing](#realtime-stubbing)
- [CI / GitHub Actions](#ci--github-actions)
- [Anti-Flake Checklist](#anti-flake-checklist)
- [Visual Regression Baselines](#visual-regression-baselines)
- [Flaky Test Quarantine](#flaky-test-quarantine)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | ≥ 18.x | [nodejs.org](https://nodejs.org) |
| npm | ≥ 9.x | bundled with Node |
| Playwright browsers | auto-installed | `npm run install:browsers` |

> **Java is NOT required.** This suite uses Monocart Reporter (Node-based), not Allure.

---

## Installation

```bash
# 1. Clone / open the suite folder
cd "SureContact Platform Regression Test Suite"

# 2. Install dependencies
npm install

# 3. Install Playwright browsers
npx playwright install --with-deps
```

---

## Configuration

### 1. Create your `.env` file

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
ENV=qa
BASE_URL=https://qaing.surecontact.com
TEST_EMAIL=vikrantd+autotest1@bsf.io
TEST_PASSWORD=@NGD*!AAXL$mY8C
API_BASE_URL=https://api-qaing.surecontact.com
```

> `.env` is git-ignored — never commit credentials.

### 2. VS Code (optional but recommended)

Install the **Playwright Test for VS Code** extension (`ms-playwright.playwright`).
You'll get green ▶ buttons next to every test to run/debug from the editor.

---

## Running Tests

### Full Suite

```bash
npm test                         # all tests, all browsers
npm run test:headed              # watch tests run in browser window
npm run test:ui                  # interactive Playwright UI mode
```

### By Browser

```bash
npm run test:chromium            # Desktop Chrome only
npm run test:firefox             # Desktop Firefox
npm run test:webkit              # Desktop Safari
npm run test:mobile              # Pixel 5 + iPhone 13
```

### By Tag

```bash
npm run test:smoke               # @smoke — quick sanity (~5 min)
npm run test:critical            # @critical — business-critical flows
npm run test:regression          # @regression — full suite
npm run test:a11y                # @a11y — WCAG 2.1 AA accessibility
npm run test:security            # @security — headers, XSS, auth enforcement
npm run test:perf                # @performance — Core Web Vitals
```

### By Module

```bash
npm run test:crm                 # All CRM tests (contacts, lists, tags…)
npm run test:campaigns           # Email campaigns + templates
npm run test:automations         # Workflows, sequences, history
npm run test:forms               # Forms module
npm run test:dashboard           # Dashboard
npm run test:auth                # Login / logout
npm run test:reports             # Reports
npm run test:settings            # Settings
npm run test:connections         # Connections / integrations
npm run test:members             # Members / workspace
```

### Specialised

```bash
npm run test:api                 # API layer tests (direct HTTP)
npm run test:mocked              # Network-mocked error state tests
npm run test:visual              # Screenshot comparison
npm run test:visual:update       # Regenerate visual baselines
npm run test:isolated            # API-seeded deterministic contact tests
```

---

## Test Structure

```
SureContact Platform Regression Test Suite/
├── playwright.config.js          # Main Playwright config
├── .env                          # Credentials (git-ignored)
├── .env.example                  # Template for new team members
│
├── utils/
│   ├── fixtures.js               # Custom Playwright fixtures (inject page objects)
│   ├── factory.js                # Faker data factory (realistic generated data)
│   ├── matchers.js               # Custom expect() matchers (toShowSuccessToast etc.)
│   ├── test-data.js              # Static test data constants
│   ├── auth.setup.js             # One-time login → saves session to auth-state.json
│   ├── global-teardown.js        # Post-suite cleanup of @qatest.io test data
│   ├── api-helper.js             # Authenticated API client for beforeAll/afterAll hooks
│   │
│   ├── pages/                    # Page Object Model (POM)
│   │   ├── BasePage.js
│   │   ├── LoginPage.js
│   │   ├── DashboardPage.js
│   │   ├── ContactsPage.js
│   │   ├── EmailCampaignsPage.js
│   │   ├── WorkflowsPage.js
│   │   ├── FormsPage.js
│   │   ├── ListsPage.js
│   │   ├── TagsPage.js
│   │   ├── SequencesPage.js
│   │   ├── SettingsPage.js
│   │   └── ReportsPage.js
│   │
│   └── api/                      # API layer (raw HTTP clients)
│       ├── ApiClient.js
│       ├── ContactsApi.js
│       ├── CampaignsApi.js
│       ├── ListsApi.js
│       └── TagsApi.js
│
├── tests/
│   ├── auth/                     # Login, logout, session
│   ├── dashboard/                # Dashboard layout + navigation
│   ├── crm/                      # Contacts, lists, tags, custom fields, imports, exports
│   ├── campaigns/                # Email campaigns, templates, SMTP
│   ├── automations/              # Workflows, sequences, history, integrations
│   ├── forms/                    # Forms module
│   ├── landing-pages/
│   ├── members/
│   ├── reports/
│   ├── settings/
│   ├── connections/
│   ├── api/                      # Direct API tests (no browser)
│   ├── visual/                   # Screenshot regression
│   ├── accessibility/            # axe-core WCAG 2.1 AA
│   ├── performance/              # Core Web Vitals (LCP, FCP, CLS)
│   ├── security/                 # Security headers, XSS, auth enforcement
│   └── mocked/                   # Network-intercepted error state tests
│
└── docs/
    └── FLAKY_TESTS.md            # Flaky test quarantine log and instructions
```

---

## Tagging System

Tests are tagged at the `test.describe` level. Run any subset with `--grep`.

| Tag | Colour | Meaning |
|---|---|---|
| `@smoke` | Purple | Fast sanity — login, dashboard, key pages load |
| `@critical` | Red | Core business flows — add contact, create campaign |
| `@regression` | Blue | Full regression — all UI tests |
| `@api` | Green | Direct API tests |
| `@visual` | Amber | Screenshot comparison |
| `@a11y` | Violet | Accessibility (WCAG 2.1 AA) |
| `@mocked` | Orange | Network-intercepted error state tests |
| `@performance` | Cyan | Core Web Vitals and load time |
| `@security` | Red | Security headers, XSS, auth enforcement |
| `@flaky` | — | Quarantined — see `docs/FLAKY_TESTS.md` |

Custom grep:
```bash
npx playwright test --grep "@smoke|@critical"
npx playwright test --grep-invert @flaky
```

---

## Reports

After any test run, two reports are generated:

### Monocart Report (primary — beautiful & interactive)
```bash
npm run report:open              # open monocart-report/index.html
```
Features: test timeline, inline screenshots/traces, tag filtering, trend charts.

### Playwright HTML Report (backup)
```bash
npm run report:playwright        # opens in browser automatically
```

### Clean all report artifacts
```bash
npm run clean
```

---

## Adding a New Test

### 1. Create the spec file

```js
// tests/mymodule/myfeature.spec.js
import { test, expect } from '../../utils/fixtures.js';   // ← always use fixtures, not @playwright/test
import { Factory }      from '../../utils/factory.js';

test.describe('My Module — Feature Name', { tag: ['@regression'] }, () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/my-module');
  });

  test('page loads correctly', async ({ page }) => {
    // Soft assertions for layout checks — all failures reported at once
    await test.step('check key elements', async () => {
      await expect.soft(page.getByRole('heading', { name: 'My Module' })).toBeVisible();
      await expect.soft(page.getByRole('button', { name: 'Create' })).toBeVisible();
    });
    expect(test.info().errors).toHaveLength(0);
  });

  test('create item with factory data', async ({ page, factory }) => {
    const item = factory.contact();   // use Factory for dynamic data

    await test.step('open create modal', async () => {
      await page.getByRole('button', { name: 'Create' }).click();
    });

    await test.step('fill form', async () => {
      await page.getByRole('textbox', { name: /email/i }).fill(item.email);
    });

    await test.step('submit and assert success', async () => {
      await page.getByRole('button', { name: /save/i }).click();
      await expect(page).toShowSuccessToast();   // custom matcher
    });
  });
});
```

### 2. Add to `package.json` scripts (optional)
```json
"test:mymodule": "npx playwright test tests/mymodule/"
```

### 3. Rules

- Import `test` and `expect` from `../../utils/fixtures.js` — **not** from `@playwright/test` — to get custom matchers and page object fixtures
- Use `Factory` for all test data — never hardcode emails
- Use `expect.soft()` for multi-element layout checks
- Use `test.step()` for all multi-action flows
- Tag every `test.describe` with at least `['@regression']`
- For tests needing a guaranteed data state, use `beforeAll` + `ApiHelper` + `afterAll` (see `tests/crm/contacts-isolated.spec.js`)

---

## Custom Matchers

Available after importing from `utils/fixtures.js`:

```js
await expect(page).toShowSuccessToast()           // success notification visible
await expect(page).toShowErrorToast()             // error notification visible
await expect(page).toBeOnPage('/contacts')        // URL contains path
await expect(page).toHaveTableRowCount(5)         // table has exactly N data rows
await expect(page).toHaveTableRowCountAtLeast(3)  // table has at least N rows
await expect(page).toShowEmptyState('No contacts yet')
await expect(page).toHavePageTitle(/Contacts/)
await expect(page).toHaveNoConsoleErrors(errors)  // pass array from page.on('console')
await expect(response).toHaveSecurityHeaders()    // X-Frame-Options, HSTS, X-Content-Type
```

---

## Fixture Conventions

Every test **must** import `test` and `expect` from `utils/fixtures.js` (not directly from `@playwright/test`) to get custom matchers and page-object fixtures.

### Available fixture imports

| Import source | What you get |
|---|---|
| `../../utils/fixtures.js` | All page objects + `Factory` + custom matchers |
| `../../utils/workspace-fixture.js` | `workspace` fixture (sandboxed data + auto-teardown) |
| `../../utils/mail-helper.js` | `MailHelper` class for email assertions |
| `../../utils/realtime-stub.js` | `RealtimeStub` class for Pusher/Reverb mocking |
| `../../utils/api-helper.js` | `ApiHelper` class for direct API calls in hooks |
| `../../utils/factory.js` | `Factory` — generates realistic randomised test data |

### Data factory types

```js
import { Factory } from '../../utils/factory.js';

Factory.contact()      // { firstName, lastName, email: '@qatest.io', phone, … }
Factory.contacts(5)    // array of 5 unique contacts
Factory.campaign()     // { name, subject, previewText, fromName, … }
Factory.list()         // { name, description }
Factory.tag()          // { name }
Factory.sequence()     // { name, description }
Factory.form()         // { name }
Factory.template()     // { name, subject, html, … }
Factory.page()         // { name, slug, title, … }
Factory.workspace()    // { name, slug, timezone }
Factory.user()         // { firstName, lastName, email, password }
Factory.uniqueEmail()  // single unique @qatest.io email string
```

All generated emails use the `@qatest.io` domain so the global teardown auto-cleans them.

---

## Sandboxed Workspace Strategy

Every spec file that creates data should use the `workspace` fixture from `utils/workspace-fixture.js`. It:

- Generates a unique `e2e-<runId>` prefix scoped to this spec file.
- Provides convenience methods (`createContact`, `createList`, `createTag`, …).
- **Automatically deletes** all created resources when the spec file finishes (`worker` scope teardown).

```js
// tests/crm/my-feature.spec.js
import { test, expect } from '../../utils/workspace-fixture.js';

test.describe('My Feature', { tag: ['@regression'] }, () => {

  test('contacts list shows newly-created contact', async ({ page, workspace }) => {
    const contact = await workspace.createContact({ first_name: 'Sandbox' });

    await page.goto('/contacts');
    await expect(page.getByText(contact.email)).toBeVisible();
    // No afterAll needed — workspace fixture cleans up automatically.
  });
});
```

For tests that use both page objects and the workspace fixture, merge them:

```js
import { test as workspaceTest, expect } from '../../utils/workspace-fixture.js';
import { test as base } from '../../utils/fixtures.js';

const test = workspaceTest.extend(base._fixtures); // merge if needed
```

### Naming convention

All auto-created test resources use the `e2e-<runId>-*` prefix. Never name test data without this prefix — the global teardown identifies and removes orphaned resources by the `@qatest.io` email domain and `e2e-` name prefix.

---

## Mail Assertion Helper

When a test triggers an email (welcome, confirmation, password reset, etc.) use `MailHelper` to assert the outbound mail via Mailpit/MailHog.

**Prerequisite:** The E2E environment must have `MAIL_MAILER=smtp` pointed at a local Mailpit instance, and `MAILPIT_URL` must be set in `.env`.

```bash
# Start Mailpit locally
docker run -d -p 8025:8025 -p 1025:1025 axllent/mailpit
```

```js
import { MailHelper } from '../../utils/mail-helper.js';

test('sends welcome email after signup', async ({ request }) => {
  const mail = new MailHelper(request);
  await mail.clear();                        // start with empty inbox

  // ... trigger signup ...

  const msg = await mail.waitForEmail({
    to: 'newuser@example.com',
    subject: /Welcome to SureContact/,
    timeout: 20000,
  });

  expect(msg).toBeTruthy();
  const body = await mail.getBody(msg.ID);
  expect(body).toContain('Confirm your email');
});
```

If `MAILPIT_URL` is not set (e.g. running against the hosted QA env), `waitForEmail` will throw. Skip mail tests conditionally:

```js
test.skip(!process.env.MAILPIT_URL, 'Mail catcher not configured');
```

---

## Realtime Stubbing

Tests that verify real-time UI updates (contact added live, campaign status change, etc.) use `RealtimeStub` to inject fake Pusher/Reverb events without needing a real WebSocket connection.

```js
import { RealtimeStub } from '../../utils/realtime-stub.js';

test('live contact list updates when contact is created', async ({ page }) => {
  const rt = new RealtimeStub(page);
  await rt.setup();                          // must call BEFORE page.goto()

  await page.goto('/contacts');

  // Simulate the backend broadcasting a new-contact event
  await rt.emit('private-workspace.1', 'contact.created', {
    id: 999,
    email: 'live@example.com',
    first_name: 'Live',
    last_name: 'Test',
  });

  await expect(page.getByText('live@example.com')).toBeVisible();
});
```

`RealtimeStub` also blocks real Pusher/Reverb auth and event endpoints so tests remain deterministic and never hit production infrastructure.

---

## CI / GitHub Actions

The suite runs on every PR and push to `main` via [`.github/workflows/e2e.yml`](.github/workflows/e2e.yml).

### Sharding

4 parallel shards keep wall-clock time under 15 minutes:

```
Shard 1/4 ──┐
Shard 2/4 ──┼──► merge-reports ──► e2e-report artifact
Shard 3/4 ──┤
Shard 4/4 ──┘
```

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `E2E_BASE_URL` | Frontend URL (defaults to `https://qaing.surecontact.com`) |
| `E2E_API_BASE_URL` | API base URL |
| `E2E_TEST_EMAIL` | Dedicated E2E test account email |
| `E2E_TEST_PASSWORD` | E2E test account password |
| `E2E_MAILPIT_URL` | Mail catcher URL (optional) |

### Running a shard locally

```bash
# Run shard 2 of 4
SHARD_INDEX=2 SHARD_TOTAL=4 npm run e2e:shard
```

---

## Anti-Flake Checklist

Before opening a PR with new E2E tests, verify each item:

- [ ] **No `page.waitForTimeout()`** — use `waitForSelector`, `waitForURL`, `waitForLoadState`, or `expect(...).toBeVisible()` instead.
- [ ] **No hardcoded IDs or slugs** — always create data via `workspace.createX()` or `Factory`.
- [ ] **Assertions wait for the element** — `expect(locator).toBeVisible({ timeout: 8000 })`, not `isVisible()`.
- [ ] **No shared state between tests** — each test must be self-contained; never rely on data left by a previous test.
- [ ] **afterAll cleans up** — if not using `workspace` fixture, add an `afterAll` that deletes created resources.
- [ ] **Retry-safe** — the test must pass when run twice in a row (idempotent).
- [ ] **No flaky selectors** — prefer `getByRole`, `getByLabel`, `getByPlaceholder` over CSS class selectors that change on deploy.
- [ ] **Retries pass at 0** — run the test 5× locally with `--repeat-each=5` to confirm it never flakes:
  ```bash
  npx playwright test path/to/my.spec.js --repeat-each=5 --project=chromium
  ```

Flake policy: **0 retries locally, max 1 on CI** (configured in `playwright.config.js`).

---

## Visual Regression Baselines

Screenshots are stored in `tests/visual/__snapshots__/` and committed to Git.

```bash
# 1. First run — creates baselines automatically
npm run test:visual

# 2. After an intentional UI change — update baselines
npm run test:visual:update

# 3. Review diffs before committing
git diff tests/visual/__snapshots__/
```

> Diff and actual images are git-ignored. Only baseline PNGs are committed.

---

## Flaky Test Quarantine

See [`docs/FLAKY_TESTS.md`](docs/FLAKY_TESTS.md) for:
- How to mark a test as flaky (`test.fixme`, `test.skip`, `@flaky` tag)
- Current quarantine list
- Investigation checklist
- How to graduate a fixed test back to the suite

Quick command to run a test N times to check for flakiness:
```bash
npx playwright test tests/crm/contacts.spec.js --repeat-each=10
```

---

## Troubleshooting

**`auth-state.json not found`**
```bash
npx playwright test --project=setup   # run auth setup manually
```

**`No tests found`**
- Check the `testDir` in `playwright.config.js` points to `./tests`
- Verify the file name ends in `.spec.js`

**`Visual baseline mismatch after OS / font update`**
```bash
npm run test:visual:update   # regenerate all baselines
```

**`API tests returning 401`**
- Verify `TEST_EMAIL` and `TEST_PASSWORD` in `.env` are correct
- Run `npm run test:auth` to confirm login works

**`Monocart report not opening`**
```bash
npm run report:open          # opens monocart-report/index.html directly
```

**`Tests passing locally but failing in CI`**
- See `docs/FLAKY_TESTS.md` — likely a timing issue
- Increase `timeout` in `playwright.config.js` for slow CI runners

---

## Team Contacts

| Role | Name | Contact |
|---|---|---|
| QA Lead | Vikrant Desai | vikrantd@bsf.io |

---

*Built with [Playwright](https://playwright.dev) · Reports by [Monocart](https://github.com/cenfun/monocart-reporter) · Data by [Faker](https://fakerjs.dev) · Accessibility by [axe-core](https://github.com/dequelabs/axe-core)*

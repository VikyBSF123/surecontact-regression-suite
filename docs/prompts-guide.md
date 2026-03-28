# Prompt Guide — How to Build This Suite from Scratch

These are the exact prompts used to build this entire Playwright regression suite
using Claude Code + Playwright MCP. Zero code was written manually.
Follow them in order for any new web application project.

**Time taken: 3 hours (9 AM – 12 PM)**
**Tools: Claude Code + Playwright MCP**
**Prerequisites: VS Code, Node.js 18+, Claude Code installed**

---

## Phase 1 — Environment Setup

### Prompt 1 — Check if everything is installed
```
First could you please check in my VS Code if required things are installed or not
like Playwright and Playwright MCP
```

### Prompt 2 — Configure Playwright MCP
```
Please configure Playwright MCP by yourself in Claude
```

### Prompt 3 — Verify Playwright MCP is working
```
Check again if Playwright MCP is correctly configured or not
```

---

## Phase 2 — Give Claude Your App Details

### Prompt 4 — Provide app access (fill in your own details)
```
QA environment URL - https://your-app-qa-url.com
Login credentials - Email - your-test-email@company.com  Password - YourTestPassword

This is a [describe your app — e.g. "marketing automation platform"] with modules like
[list your main modules e.g. "CRM, Campaigns, Automations, Forms, Reports, Settings"]

Please explore the app first using Playwright MCP, navigate through all the pages,
understand the UI, and then start building the test suite.
```

> ⚠️ Use a dedicated QA test account — never use production credentials or your personal login.

---

## Phase 3 — Initial Suite Creation

### Prompt 5 — Build the initial test suite
```
Now build a complete Playwright regression test suite for this application.
Create test files for every module you explored. Include:
- Auth tests (login, logout, invalid credentials)
- One spec file per module covering page load, CRUD operations, validation
- Monocart HTML reporter configured
- Auth state saved once and reused across all tests
- All tests tagged with @smoke, @critical, or @regression
- Cross browser setup for Chrome, Firefox, Safari, mobile Chrome, mobile Safari
```

### Prompt 6 — Add to VS Code workspace
```
Could you please add this suite to my VS Code workspace by yourself
```

---

## Phase 4 — Core Infrastructure

### Prompt 7 — Add Page Object Model, env config, cross-browser, API layer
```
Now do the following things:
1. Page Object Model — one class per page with reusable methods, BasePage with common actions
2. .env config — move all credentials and URLs to environment variables using dotenv
3. Cross-browser — add projects for Chrome, Firefox, Safari, Pixel 5, iPhone 13
4. Test tagging — make sure every test.describe has @smoke, @critical, or @regression tags
5. API layer — ApiClient base class, one API class per module, direct HTTP test specs
```

---

## Phase 5 — Test Data and Advanced Patterns

### Prompt 8 — Add visual regression, accessibility, and Faker
```
Now do the following:
1. Visual regression testing — screenshot baselines for all main pages
2. Accessibility testing — axe-core WCAG 2.1 AA audits for all pages
3. Faker data factory — replace all hardcoded test data with @faker-js/faker generated data,
   all emails must use @qatest.io domain so global teardown can clean them up
```

---

## Phase 6 — Ask Claude What's Missing

### Prompt 9 — Gap analysis
```
Now let me know what things are remaining to make this a fully complete
professional test suite
```

> Claude will give you a list. Then use the next prompt:

---

## Phase 7 — Complete the Suite

### Prompt 10 — Build everything remaining
```
Now do all of the following remaining things:

1. Global Setup — pre-flight health check before any test runs (verify env vars,
   check app URL is reachable, check API is up, verify auth credentials work)

2. Global Teardown — after all tests run, automatically delete all test data
   (contacts with @qatest.io emails, lists/tags/campaigns with api- prefix)

3. Custom Matchers — toShowSuccessToast(), toBeOnPage(), toHaveTableRowCount(),
   toShowEmptyState(), toHaveSecurityHeaders()

4. API-seeded isolated tests — for contacts module, use beforeAll to create data via API,
   test against known state, delete in afterAll — no live data dependency

5. Mocked error state tests — use page.route() to mock 500 errors, 401, 429 rate limit,
   network timeout, empty list responses, malformed JSON

6. Performance tests — measure LCP, FCP, CLS, TTFB using PerformanceObserver injected
   via page.addInitScript(), assert against thresholds (LCP ≤ 2500ms, CLS ≤ 0.1)

7. Security tests — security headers (X-Frame-Options, HSTS, nosniff), XSS prevention,
   SQL injection in search, unauthenticated redirect, password not in DOM

8. Soft assertions — use expect.soft() in all layout/page-load tests so all failures
   are reported at once instead of stopping at first failure

9. test.step() — wrap all multi-action tests in named steps for readable report timeline

10. ESLint + Prettier — eslint-plugin-playwright rules (no test.only, missing await,
    no page.pause), Prettier formatting, both enforced via Husky pre-commit hooks

11. Husky + lint-staged — pre-commit hook that runs eslint --fix and prettier --write
    on every staged .js file before commit is allowed

12. Parallel mode — add test.describe.configure({ mode: 'parallel' }) to all read-only
    spec files (dashboard, reports, settings, forms, automations)

13. Component tests — Playwright CT React setup, template component test for EmptyState component

14. Metrics dashboard — Node.js script that reads Monocart trends.json and generates
    a standalone Chart.js HTML dashboard (pass rate trend, failures per run, suite duration)

15. API contract/schema validation — AJV JSON schema tests for contacts, campaigns,
    lists, tags API responses — validates shape not just status code

16. Full documentation:
    - README.md with all run commands, folder structure, selector strategy, adding new tests
    - docs/CONTRIBUTING.md with naming conventions, import rules, selector priority, PR checklist
    - docs/COVERAGE.md mapping every feature to its test file with Full/Partial/None status
    - docs/FLAKY_TESTS.md with quarantine strategy using test.fixme() and @flaky tag
```

---

## Phase 8 — Final Audit

### Prompt 11 — Check what's left
```
Now check what things are remaining to make this a complete suite
```

> Claude will audit everything and give you a prioritised list of remaining gaps.

---

## Bonus Prompts — Use These Anytime

### Add tests for a specific new feature
```
The app has a new [feature name] feature at [url path].
Please explore it using Playwright MCP and write a complete spec file covering:
- Page load and UI elements
- Happy path (valid input)
- Validation errors (empty/invalid input)
- Edge cases
Follow the existing patterns in the suite (import from fixtures.js, use Factory for data,
tag with appropriate tags, use test.step() for multi-step flows)
```

### Fix a failing test
```
The test "[test name]" in [file path] is failing. The error is:
[paste the error message]

Please investigate and fix it without changing what the test is actually verifying.
```

### Add a new page to the Page Object Model
```
Please add a Page Object class for the [module name] page at [url path].
Explore it using Playwright MCP first, then create the class in utils/pages/
following the same pattern as the existing page classes.
Also add it as a fixture in utils/fixtures.js.
```

### Increase coverage for a module
```
Looking at docs/COVERAGE.md, the [module name] module has these gaps:
[list the ❌ None items]

Please write tests for these missing features following the existing patterns.
Use API seeding in beforeAll for tests that need known data state.
```

### Add a new browser or viewport
```
Please add a new browser project to playwright.config.js for [device name].
Use the Playwright devices list. Make sure it depends on the setup project
so auth state is reused.
```

### Set up GitHub Actions CI
```
Please create a .github/workflows/playwright.yml file that:
- Triggers on push to main and on every pull request
- Installs Node.js 18 and dependencies
- Installs Playwright browsers
- Runs the full test suite with 2 workers
- Uploads the Monocart HTML report as an artifact on failure
- Sets all required environment variables from GitHub secrets
```

---

## Key Rules Claude Follows in This Suite

These were established during the build — Claude enforces them automatically:

| Rule | Why |
|---|---|
| Import from `../../utils/fixtures.js`, never `@playwright/test` | Ensures custom matchers and page objects are available |
| All test emails end in `@qatest.io` | Global teardown targets this domain for cleanup |
| `beforeAll` data creation always paired with `afterAll` deletion | No test data left behind |
| `expect.soft()` for layout checks, hard assertions for flow tests | Layout tests report all failures at once |
| `test.step()` on any test with more than 3 actions | Readable Monocart report timeline |
| ARIA selectors first, CSS classes never | Resilient to refactors, implicitly tests accessibility |
| Factory data, never hardcoded strings | Unique per run, never collides between runs |
| Every `test.describe` has at least one tag | Enables targeted test runs |

---

## Run Commands Reference

```bash
npm test                          # full suite, all browsers
npm run test:smoke                # @smoke tests only (fastest)
npm run test:critical             # @critical tests only
npm run test:chromium             # Chrome only
npm run test:crm                  # CRM module only
npm run test:api                  # API tests only
npm run test:visual               # visual regression
npm run test:visual:update        # update screenshot baselines
npm run test:a11y                 # accessibility audits
npm run test:perf                 # performance tests
npm run test:security             # security tests
npm run test:mocked               # error state tests
npm run test:isolated             # API-seeded isolated tests
npm run test:components           # component tests
npm run metrics                   # generate metrics dashboard HTML
npm run lint                      # check ESLint
npm run format                    # apply Prettier
```

---

*Built for SureContact Platform · March 2026*
*3 hours start to finish · Claude Code + Playwright MCP*

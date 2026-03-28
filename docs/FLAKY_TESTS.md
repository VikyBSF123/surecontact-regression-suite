# Flaky Test Management

A **flaky test** is one that passes and fails non-deterministically without any code change.
This document explains how to identify, quarantine, investigate, and graduate flaky tests.

---

## How to Mark a Test as Flaky

### Method 1 — `test.fixme()` (blocks CI, visible in report)

Use when the test is **known to be broken** and must be fixed before the next release.

```js
test.fixme('search shows results after debounce', async ({ page }) => {
  // TODO: timing issue on slow CI runners — debounce is 600ms but CI is slower
  // Tracked: https://github.com/org/repo/issues/123
  // Owner: @vikrantdesai
  // Added: 2026-03-28
});
```

### Method 2 — `test.skip()` with condition (skips in certain environments)

Use when a test only fails in specific conditions (CI, Firefox, mobile).

```js
test('create campaign flow', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit', 'Known flake on WebKit — file upload dialog inconsistent');
  // ... rest of test
});
```

### Method 3 — `@flaky` tag (runs but not counted in CI gate)

Use when you want to keep running the test to collect data without blocking CI.

```js
test('workflow toggle updates status', { tag: ['@flaky'] }, async ({ page }) => {
  // ...
});
```

Then in CI, exclude flaky tests from the failure gate:
```bash
npx playwright test --grep-invert @flaky
```

---

## Currently Quarantined Tests

| Test | File | Reason | Owner | Added | Issue |
|---|---|---|---|---|---|
| _(none yet)_ | — | — | — | — | — |

---

## Investigation Checklist

When a test starts failing intermittently:

1. **Check retry count** in Monocart report — if it passes on retry, it's likely timing-dependent
2. **Look at the trace** (`test-results/*/trace.zip`) — which step is non-deterministic?
3. **Common causes and fixes:**

| Symptom | Likely Cause | Fix |
|---|---|---|
| Fails on first run, passes on retry | Slow animation or async load | Add `waitForLoadState('networkidle')` or specific `waitFor()` |
| Fails on CI only | Slower CPU/network on CI | Increase `timeout` or add `waitForTimeout` |
| Fails on Firefox/WebKit | Browser-specific behavior | Use `test.skip(browserName === 'firefox', ...)` |
| Fails when run with other tests | Shared state / test pollution | Check `beforeAll` cleanup; use isolated spec file |
| Fails after data-creating tests | QA account data accumulation | Add `afterAll` cleanup or use isolated data |
| Element not found intermittently | Race condition | Use `page.waitForSelector()` or retry-aware `expect()` |

---

## Graduating a Flaky Test (back to normal)

Once fixed:
1. Remove `test.fixme()` / `test.skip()` / `@flaky` tag
2. Add a comment explaining what was fixed
3. Update the table above (set Status → Fixed, add PR link)
4. Run the test 5× locally to verify it's stable: `npx playwright test <file> --repeat-each=5`

---

## Retry Configuration

Currently configured in `playwright.config.js`:
```js
retries: process.env.CI ? 2 : 1,
```

- **Local**: 1 retry — catches random one-off failures
- **CI**: 2 retries — accounts for slower runners
- Tests that need > 2 retries to pass are **genuinely flaky** and must be quarantined

---

## Useful Commands

```bash
# Run a single test 10 times to check for flakiness
npx playwright test tests/crm/contacts.spec.js --repeat-each=10

# Run only tests NOT tagged @flaky
npx playwright test --grep-invert @flaky

# Run quarantined tests in isolation to investigate
npx playwright test --grep @flaky --headed --project=chromium

# Generate a trace for a specific test to debug timing
npx playwright test tests/crm/contacts.spec.js --trace=on
```

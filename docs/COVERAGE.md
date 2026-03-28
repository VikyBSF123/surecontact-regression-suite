# Test Coverage Map

Maps every application feature to its test file(s) and coverage level.

**Legend:**
- ✅ **Full** — positive, negative, edge cases, and error states covered
- ⚠️ **Partial** — happy path covered; some negative/edge cases missing
- ❌ **None** — no automated tests exist
- 🔵 **API** — covered at API layer only (no UI test)
- 👁️ **Visual** — covered by screenshot comparison
- ♿ **A11y** — covered by accessibility scan

---

## Authentication

| Feature | Coverage | Test File(s) | Notes |
|---|---|---|---|
| Login with valid credentials | ✅ | `tests/auth/login.spec.js` | |
| Login with invalid email | ✅ | `tests/auth/login.spec.js` | |
| Login with wrong password | ✅ | `tests/auth/login.spec.js` | |
| Login with empty fields | ✅ | `tests/auth/login.spec.js` | |
| Logout | ✅ | `tests/auth/login.spec.js` | |
| Forgot password flow | ❌ | — | Not yet tested |
| Google SSO login | ❌ | — | Requires Google OAuth mock |
| Passkey login | ❌ | — | Requires WebAuthn mock |
| Session expiry / auto-logout | ⚠️ | `tests/auth/login.spec.js` | Redirect tested, not expiry timer |
| Unauthenticated redirect | ✅ | `tests/security/security.spec.js` | |
| Login page visual | 👁️ | `tests/visual/visual.spec.js` | |
| Login page accessibility | ♿ | `tests/accessibility/accessibility.spec.js` | |
| Login page performance (LCP/FCP) | ✅ | `tests/performance/perf.spec.js` | |

---

## Dashboard

| Feature | Coverage | Test File(s) | Notes |
|---|---|---|---|
| Page load & title | ✅ | `tests/dashboard/dashboard.spec.js` | |
| Welcome heading | ✅ | `tests/dashboard/dashboard.spec.js` | |
| Getting started guide links | ✅ | `tests/dashboard/dashboard.spec.js` | |
| Quick action cards | ✅ | `tests/dashboard/dashboard.spec.js` | |
| Sidebar navigation items | ✅ | `tests/dashboard/dashboard.spec.js` | |
| CRM submenu expansion | ✅ | `tests/dashboard/dashboard.spec.js` | |
| Campaigns submenu expansion | ✅ | `tests/dashboard/dashboard.spec.js` | |
| Automations submenu expansion | ✅ | `tests/dashboard/dashboard.spec.js` | |
| Sidebar collapse/expand | ✅ | `tests/dashboard/dashboard.spec.js` | |
| Usage widget | ✅ | `tests/dashboard/dashboard.spec.js` | |
| Language switcher | ✅ | `tests/dashboard/dashboard.spec.js` | |
| Topbar user avatar | ✅ | `tests/dashboard/dashboard.spec.js` | |
| Dashboard visual | 👁️ | `tests/visual/visual.spec.js` | |
| Dashboard accessibility | ♿ | `tests/accessibility/accessibility.spec.js` | |
| Dashboard performance | ✅ | `tests/performance/perf.spec.js` | LCP, FCP, CLS, TTFB |

---

## CRM — Contacts

| Feature | Coverage | Test File(s) | Notes |
|---|---|---|---|
| Page load / UI elements | ✅ | `tests/crm/contacts.spec.js` | |
| Add contact — valid email | ✅ | `tests/crm/contacts.spec.js` | |
| Add contact — empty email | ✅ | `tests/crm/contacts.spec.js` | |
| Add contact — invalid format | ✅ | `tests/crm/contacts.spec.js` | |
| Add contact modal close | ✅ | `tests/crm/contacts.spec.js` | |
| Add contact with Faker data | ✅ | `tests/crm/contacts-factory.spec.js` | |
| Add contact — unicode name | ✅ | `tests/crm/contacts-factory.spec.js` | |
| Search by email | ✅ | `tests/crm/contacts-isolated.spec.js` | API-seeded |
| Search by first name | ✅ | `tests/crm/contacts-isolated.spec.js` | API-seeded |
| Search clear | ✅ | `tests/crm/contacts.spec.js` | |
| Search — no results | ✅ | `tests/crm/contacts.spec.js` | |
| Search — special characters (XSS) | ✅ | `tests/crm/contacts.spec.js`, `tests/security/security.spec.js` | |
| Search — very long input | ✅ | `tests/crm/contacts.spec.js` | |
| Delete contact via UI | ✅ | `tests/crm/contacts-isolated.spec.js` | API-seeded |
| Contact detail view | ⚠️ | `tests/crm/contacts-isolated.spec.js` | Basic email check only |
| Edit contact | ❌ | — | Not yet covered |
| Bulk actions (select all, delete) | ❌ | — | Not yet covered |
| Import contacts (CSV) | ⚠️ | `tests/crm/imports.spec.js` | UI flow only; no file upload |
| Export contacts | ⚠️ | `tests/crm/exports.spec.js` | Button trigger only |
| Contact tags management | ❌ | — | API tested only |
| Contact list assignment | ❌ | — | API tested only |
| Table pagination | ❌ | — | Mocked test pending |
| Contacts API — list | 🔵 | `tests/api/contacts.api.spec.js` | |
| Contacts API — create | 🔵 | `tests/api/contacts.api.spec.js` | |
| Contacts API — update | 🔵 | `tests/api/contacts.api.spec.js` | |
| Contacts API — delete | 🔵 | `tests/api/contacts.api.spec.js` | |
| Contacts API — schema | 🔵 | `tests/api/schema-validation.spec.js` | |
| Contacts page visual | 👁️ | `tests/visual/visual.spec.js` | |
| Contacts page accessibility | ♿ | `tests/accessibility/accessibility.spec.js` | |
| Contacts page performance | ✅ | `tests/performance/perf.spec.js` | |

---

## CRM — Lists

| Feature | Coverage | Test File(s) | Notes |
|---|---|---|---|
| Page load / UI elements | ✅ | `tests/crm/lists.spec.js` | |
| Create list | ✅ | `tests/crm/lists.spec.js` | |
| Create list — empty name | ✅ | `tests/crm/lists.spec.js` | |
| Delete list | ⚠️ | `tests/crm/lists.spec.js` | |
| Add contact to list (UI) | ❌ | — | Not yet covered |
| Lists API — CRUD | 🔵 | `tests/api/lists.api.spec.js` | |
| Lists API — schema | 🔵 | `tests/api/schema-validation.spec.js` | |

---

## CRM — Tags

| Feature | Coverage | Test File(s) | Notes |
|---|---|---|---|
| Page load / UI elements | ✅ | `tests/crm/tags.spec.js` | |
| Create tag | ✅ | `tests/crm/tags.spec.js` | |
| Create tag — empty name | ✅ | `tests/crm/tags.spec.js` | |
| Delete tag | ⚠️ | `tests/crm/tags.spec.js` | |
| Tags API — CRUD | 🔵 | `tests/api/tags.api.spec.js` | |
| Tags API — schema | 🔵 | `tests/api/schema-validation.spec.js` | |

---

## CRM — Custom Fields

| Feature | Coverage | Test File(s) | Notes |
|---|---|---|---|
| Page load | ✅ | `tests/crm/custom-fields.spec.js` | |
| Create custom field | ⚠️ | `tests/crm/custom-fields.spec.js` | |
| Field types (text, number, date, etc.) | ❌ | — | Not yet covered |
| Delete custom field | ⚠️ | `tests/crm/custom-fields.spec.js` | |

---

## Campaigns — Email Campaigns

| Feature | Coverage | Test File(s) | Notes |
|---|---|---|---|
| Page load / UI elements | ✅ | `tests/campaigns/email-campaigns.spec.js` | |
| Create campaign button | ✅ | `tests/campaigns/email-campaigns.spec.js` | |
| Create campaign — valid name | ✅ | `tests/campaigns/email-campaigns.spec.js` | |
| Create campaign — empty name | ✅ | `tests/campaigns/email-campaigns.spec.js` | |
| Empty state | ✅ | `tests/campaigns/email-campaigns.spec.js` | |
| Search campaigns | ✅ | `tests/campaigns/email-campaigns.spec.js` | |
| Export CSV button | ✅ | `tests/campaigns/email-campaigns.spec.js` | |
| Campaign detail / edit | ❌ | — | Not yet covered |
| Schedule campaign | ❌ | — | Not yet covered |
| Send campaign | ❌ | — | Requires SMTP configuration |
| Duplicate campaign | ❌ | — | Not yet covered |
| Campaign stats (opens, clicks) | ❌ | — | Not yet covered |
| Campaigns API — CRUD | 🔵 | `tests/api/campaigns.api.spec.js` | |
| Campaigns API — schema | 🔵 | `tests/api/schema-validation.spec.js` | |
| Campaigns page visual | 👁️ | `tests/visual/visual.spec.js` | |
| Campaigns page accessibility | ♿ | `tests/accessibility/accessibility.spec.js` | |

---

## Automations — Workflows

| Feature | Coverage | Test File(s) | Notes |
|---|---|---|---|
| Page load / UI elements | ✅ | `tests/automations/workflows.spec.js` | |
| Create workflow | ✅ | `tests/automations/workflows.spec.js` | |
| Create workflow — empty name | ✅ | `tests/automations/workflows.spec.js` | |
| Toggle workflow active/inactive | ✅ | `tests/automations/workflows.spec.js` | |
| Delete workflow | ⚠️ | `tests/automations/workflows.spec.js` | |
| Workflow builder (canvas) | ❌ | — | Complex drag-and-drop; not yet covered |
| Add trigger to workflow | ❌ | — | Not yet covered |
| Add action to workflow | ❌ | — | Not yet covered |
| Workflow page visual | 👁️ | `tests/visual/visual.spec.js` | |

---

## Automations — Sequences

| Feature | Coverage | Test File(s) | Notes |
|---|---|---|---|
| Page load / UI elements | ✅ | `tests/automations/sequences.spec.js` | |
| Create sequence | ✅ | `tests/automations/sequences.spec.js` | |
| Toggle sequence | ✅ | `tests/automations/sequences.spec.js` | |
| Add email step | ❌ | — | Not yet covered |
| Enrol contact in sequence | ❌ | — | Not yet covered |

---

## Forms

| Feature | Coverage | Test File(s) | Notes |
|---|---|---|---|
| Page load / UI elements | ✅ | `tests/forms/forms.spec.js` | |
| Create form | ✅ | `tests/forms/forms.spec.js` | |
| Create form — empty name | ✅ | `tests/forms/forms.spec.js` | |
| Form builder | ❌ | — | Complex drag-and-drop; not yet covered |
| Publish form | ❌ | — | Not yet covered |
| Form embed code | ❌ | — | Not yet covered |
| Form submissions list | ❌ | — | Not yet covered |
| Forms page visual | 👁️ | `tests/visual/visual.spec.js` | |
| Forms page accessibility | ♿ | `tests/accessibility/accessibility.spec.js` | |

---

## Reports

| Feature | Coverage | Test File(s) | Notes |
|---|---|---|---|
| Page load | ✅ | `tests/reports/reports.spec.js` | |
| Date range filter | ⚠️ | `tests/reports/reports.spec.js` | |
| Export CSV | ⚠️ | `tests/reports/reports.spec.js` | |
| Email report metrics | ❌ | — | Not yet covered |
| Contact growth chart | ❌ | — | Not yet covered |

---

## Settings

| Feature | Coverage | Test File(s) | Notes |
|---|---|---|---|
| Page load | ✅ | `tests/settings/settings.spec.js` | |
| Profile update | ⚠️ | `tests/settings/settings.spec.js` | |
| Password change | ❌ | — | Not yet covered |
| SMTP configuration | ⚠️ | `tests/campaigns/smtp.spec.js` | |
| Billing page | ⚠️ | `tests/settings/settings.spec.js` | |
| API keys page | ❌ | — | Not yet covered |

---

## Security & Non-Functional

| Feature | Coverage | Test File(s) |
|---|---|---|
| X-Frame-Options header | ✅ | `tests/security/security.spec.js` |
| X-Content-Type-Options | ✅ | `tests/security/security.spec.js` |
| HSTS header | ✅ | `tests/security/security.spec.js` |
| XSS — script not executed | ✅ | `tests/security/security.spec.js` |
| XSS — img tag injection | ✅ | `tests/security/security.spec.js` |
| SQL injection in search | ✅ | `tests/security/security.spec.js` |
| Unauthenticated redirect | ✅ | `tests/security/security.spec.js` |
| API 401 without token | ✅ | `tests/security/security.spec.js` |
| Password not in DOM | ✅ | `tests/security/security.spec.js` |
| Login LCP ≤ 2500ms | ✅ | `tests/performance/perf.spec.js` |
| Dashboard LCP ≤ 2500ms | ✅ | `tests/performance/perf.spec.js` |
| CLS ≤ 0.1 (no layout shift) | ✅ | `tests/performance/perf.spec.js` |
| TTFB ≤ 800ms | ✅ | `tests/performance/perf.spec.js` |
| API 500 error state | ✅ | `tests/mocked/contacts-errors.spec.js` |
| API empty list state | ✅ | `tests/mocked/contacts-errors.spec.js` |
| Network timeout handling | ✅ | `tests/mocked/contacts-errors.spec.js` |

---

## Coverage Summary

| Module | Full ✅ | Partial ⚠️ | None ❌ | Total |
|---|---|---|---|---|
| Authentication | 7 | 2 | 3 | 12 |
| Dashboard | 13 | 0 | 0 | 13 |
| Contacts | 16 | 5 | 6 | 27 |
| Lists | 3 | 2 | 1 | 6 |
| Tags | 3 | 2 | 0 | 5 |
| Custom Fields | 1 | 2 | 1 | 4 |
| Email Campaigns | 8 | 2 | 6 | 16 |
| Workflows | 5 | 1 | 3 | 9 |
| Sequences | 3 | 0 | 2 | 5 |
| Forms | 3 | 0 | 4 | 7 |
| Reports | 1 | 2 | 2 | 5 |
| Settings | 1 | 3 | 2 | 6 |
| Security/NFR | 15 | 0 | 0 | 15 |
| **Total** | **79** | **21** | **30** | **130** |

**Overall coverage: ~77% (79 full + 21 partial out of 130 features)**

---

## Priority Coverage Gaps

Features that are ❌ None and are high business risk:

| Priority | Feature | Risk | Suggested Test |
|---|---|---|---|
| 🔴 High | Campaign send | Revenue-critical | Mock SMTP, assert send confirmation |
| 🔴 High | Contact bulk delete | Data loss risk | Seeded contacts + bulk action test |
| 🔴 High | CSV import with file | Main data-entry path | `page.setInputFiles()` with test CSV |
| 🟠 Medium | Workflow builder | Complex UX | Drag-and-drop trigger/action tests |
| 🟠 Medium | Form builder | Core product feature | Add field tests |
| 🟠 Medium | Password change | Auth security | Form submission + re-login |
| 🟡 Low | Forgot password | Edge usage | Link click + email assertion |
| 🟡 Low | Contact edit | Common operation | Click edit, change field, save |

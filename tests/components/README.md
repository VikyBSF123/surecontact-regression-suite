# Component Tests

These tests use **Playwright Component Testing** to mount individual React components
in isolation — no full page load, no login, no network.

## Status

⚠️ **Template only** — component tests require the `surecontact-nextjs` repo cloned locally.

Once the Next.js repo is cloned:
1. Copy the component files referenced in each `.ct.js` test into this folder (or use path aliases)
2. Run `npm run test:components`

## Pattern

Each `.ct.js` file follows this structure:

```js
import { test, expect } from '@playwright/experimental-ct-react';
import { MyComponent }  from '../../../surecontact-nextjs/src/components/MyComponent';

test('renders correctly', async ({ mount }) => {
  const component = await mount(<MyComponent label="Hello" />);
  await expect(component).toContainText('Hello');
  await expect(component).toBeVisible();
});
```

## What to Test Here vs E2E

| Test Here (CT) | Test in E2E |
|---|---|
| Button renders correct label | Full campaign creation flow |
| Empty state shows correct icon + text | Search returns results from API |
| Modal closes on Escape key | Login redirects to dashboard |
| Disabled state styling | Contact import processes a CSV |
| Prop variations render correctly | Visual regression of full pages |

## Running

```bash
# Component tests only
npm run test:components

# Headed (watch the component mount)
npm run test:components:headed
```

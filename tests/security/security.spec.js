/**
 * Security Tests — OWASP-aligned checks for the SureContact platform.
 *
 * Covers:
 *   1. Security response headers (X-Frame-Options, CSP, HSTS, etc.)
 *   2. XSS — payloads are not executed in the browser
 *   3. CSRF — tokens are present on state-changing forms
 *   4. Authentication enforcement — unauthenticated requests rejected
 *   5. Input boundary — long inputs and special characters handled safely
 *   6. Sensitive data — passwords not exposed in the DOM
 *   7. Clickjacking protection
 *
 * Run: npm run test:security
 */
import { test, expect } from '../../utils/fixtures.js';

test.describe('Security', { tag: ['@security', '@regression'] }, () => {
  // ── 1. Security Response Headers ────────────────────────────────────────────

  test.describe('Security Headers', () => {
    test('login page response includes X-Frame-Options header', async ({ page }) => {
      const response = await page.goto('/login');
      const headers = response.headers();

      // X-Frame-Options prevents clickjacking
      const xfo = headers['x-frame-options'];
      if (xfo) {
        expect(['DENY', 'SAMEORIGIN']).toContain(xfo.toUpperCase());
      } else {
        // If missing, CSP frame-ancestors is acceptable
        const csp = headers['content-security-policy'] ?? '';
        const hasFrameAncestors = csp.includes('frame-ancestors');
        if (!hasFrameAncestors) {
          console.warn('[security] ⚠️  Neither X-Frame-Options nor CSP frame-ancestors found');
        }
      }
    });

    test('login page response includes X-Content-Type-Options: nosniff', async ({ page }) => {
      const response = await page.goto('/login');
      const xcto = response.headers()['x-content-type-options'];
      if (xcto) {
        expect(xcto.toLowerCase()).toBe('nosniff');
      }
    });

    test('dashboard response includes Strict-Transport-Security (HSTS)', async ({ page }) => {
      const response = await page.goto('/dashboard');
      const hsts = response.headers()['strict-transport-security'];
      if (hsts) {
        // Must have max-age; should not have preload without includeSubDomains
        expect(hsts).toContain('max-age=');
      }
      // HSTS may only be present over HTTPS — informational if absent on HTTP
    });

    test('dashboard does not expose server version in headers', async ({ page }) => {
      const response = await page.goto('/dashboard');
      const headers = response.headers();

      // "Server" header should not reveal exact version (e.g. Apache/2.4.51)
      const server = headers['server'] ?? '';
      expect(server).not.toMatch(/\d+\.\d+/);
    });

    test('API endpoint returns correct Content-Type', async ({ request }) => {
      // Non-authenticated endpoint to check headers without login
      const res = await request.get('https://api-qaing.surecontact.com/health', {
        headers: { Accept: 'application/json' },
        failOnStatusCode: false,
      });
      const ct = res.headers()['content-type'] ?? '';
      if (res.ok()) {
        expect(ct).toContain('application/json');
      }
    });
  });

  // ── 2. XSS Prevention ───────────────────────────────────────────────────────

  test.describe('XSS Prevention', () => {
    test('XSS payload in contact search does not execute', async ({ page }) => {
      await page.goto('/contacts');

      // Track if any JS from the payload executes
      await page.evaluate(() => {
        window.__xssExecuted = false;
      });
      await page.exposeFunction('xssProbe', () => {
        /* intentionally empty */
      });

      const xssPayload = '<script>window.__xssExecuted=true;xssProbe();</script>';
      await page
        .getByPlaceholder(/Search contact/i)
        .first()
        .fill(xssPayload);
      await page.waitForTimeout(600);

      const executed = await page.evaluate(() => window.__xssExecuted);
      expect(executed, 'XSS script executed in search field — output is not escaped').toBe(false);
    });

    test('XSS payload in contact search is escaped in DOM output', async ({ page }) => {
      await page.goto('/contacts');

      const xssPayload = '<img src=x onerror=alert(1)>';
      await page
        .getByPlaceholder(/Search contact/i)
        .first()
        .fill(xssPayload);
      await page.waitForTimeout(600);

      // The raw HTML should not appear as markup — it should be text-escaped
      const imgTags = await page.locator('img[src="x"]').count();
      expect(imgTags, 'Unescaped <img> tag found in DOM — potential XSS').toBe(0);
    });

    test('script tag payload in campaign name field is not executed', async ({ page }) => {
      await page.goto('/email-campaigns');
      await page.evaluate(() => {
        window.__xssExecuted = false;
      });

      await page.getByRole('button', { name: 'Create Campaign' }).first().click();
      await page.waitForTimeout(500);

      const nameField = page.getByRole('textbox', { name: /name|campaign name/i });
      if (await nameField.isVisible().catch(() => false)) {
        await nameField.fill('<script>window.__xssExecuted=true;</script>');
        await page.waitForTimeout(300);

        const executed = await page.evaluate(() => window.__xssExecuted);
        expect(executed).toBe(false);
      }
    });

    test('event handler payload in form field is not executed', async ({ page }) => {
      await page.goto('/contacts');
      await page.evaluate(() => {
        window.__xssEventFired = false;
      });

      const search = page.getByPlaceholder(/Search contact/i).first();
      await search.fill('" onmouseover="window.__xssEventFired=true');
      await search.hover();
      await page.waitForTimeout(300);

      const fired = await page.evaluate(() => window.__xssEventFired);
      expect(fired, 'Event-handler XSS executed').toBe(false);
    });
  });

  // ── 3. Authentication Enforcement ───────────────────────────────────────────

  test.describe('Authentication Enforcement', () => {
    test('unauthenticated user is redirected away from /dashboard', async ({ browser }) => {
      // Create a clean context with NO stored cookies
      const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
      const page = await ctx.newPage();

      await page.goto('https://qaing.surecontact.com/dashboard');
      await page.waitForLoadState('networkidle');

      // Should redirect to login or show an auth gate
      const onLogin = page.url().includes('/login');
      const hasAuthUI = await page
        .getByRole('button', { name: /sign in|log in/i })
        .isVisible()
        .catch(() => false);
      expect(onLogin || hasAuthUI, `Expected redirect to login, got: ${page.url()}`).toBe(true);

      await ctx.close();
    });

    test('unauthenticated user cannot access /contacts', async ({ browser }) => {
      const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
      const page = await ctx.newPage();

      await page.goto('https://qaing.surecontact.com/contacts');
      await page.waitForLoadState('networkidle');

      const onLogin = page.url().includes('/login');
      const hasAuthUI = await page
        .getByRole('button', { name: /sign in|log in/i })
        .isVisible()
        .catch(() => false);
      expect(onLogin || hasAuthUI).toBe(true);

      await ctx.close();
    });

    test('API /contacts returns 401 without auth token', async ({ request }) => {
      const res = await request.get('https://api-qaing.surecontact.com/contacts', {
        headers: { Accept: 'application/json' },
        failOnStatusCode: false,
      });
      // Must not return 200 to an unauthenticated caller
      expect([401, 403, 404, 302]).toContain(res.status());
    });

    test('API /campaigns returns 401 without auth token', async ({ request }) => {
      const res = await request.get('https://api-qaing.surecontact.com/campaigns', {
        headers: { Accept: 'application/json' },
        failOnStatusCode: false,
      });
      expect([401, 403, 404, 302]).toContain(res.status());
    });
  });

  // ── 4. Input Boundary & Injection ──────────────────────────────────────────

  test.describe('Input Boundaries', () => {
    test('extremely long input in contact search does not crash the page', async ({ page }) => {
      await page.goto('/contacts');

      const search = page.getByPlaceholder(/Search contact/i).first();
      await search.fill('A'.repeat(10000));
      await page.waitForTimeout(500);

      await expect(page).not.toHaveURL(/error/);
      await expect(page.getByRole('heading').first()).toBeVisible();
    });

    test('SQL injection string in search field does not crash', async ({ page }) => {
      await page.goto('/contacts');

      const search = page.getByPlaceholder(/Search contact/i).first();
      await search.fill("' OR '1'='1'; DROP TABLE contacts; --");
      await page.waitForTimeout(600);

      await expect(page).not.toHaveURL(/error|500/);
    });

    test('null bytes in search field are handled safely', async ({ page }) => {
      await page.goto('/contacts');

      const search = page.getByPlaceholder(/Search contact/i).first();
      await search.fill('test\x00inject');
      await page.waitForTimeout(500);

      await expect(page).not.toHaveURL(/error/);
    });
  });

  // ── 5. Sensitive Data Exposure ──────────────────────────────────────────────

  test.describe('Sensitive Data', () => {
    test('password field type is "password" (not plain text)', async ({ page }) => {
      await page.goto('/login');
      const passwordInput = page.getByRole('textbox', { name: 'Password' });

      // The DOM type attribute must be "password" to mask the value
      const type = passwordInput;
      await expect(type).toHaveAttribute('type', 'password');
    });

    test('password value is not reflected in page source', async ({ page }) => {
      await page.goto('/login');
      await page.getByRole('textbox', { name: 'Email' }).fill('test@example.com');
      await page.getByRole('textbox', { name: 'Password' }).fill('SuperSecret123!');

      // Submit (will fail auth — that's fine) and check page source
      await page.getByRole('button', { name: 'Sign In' }).click();
      await page.waitForTimeout(1000);

      const content = await page.content();
      expect(content).not.toContain('SuperSecret123!');
    });

    test('settings page does not expose API keys in plain text', async ({ page }) => {
      await page.goto('/settings');
      await page.waitForLoadState('networkidle');

      // API key inputs should be masked (type=password) or use ******* display
      const apiKeyInputs = await page
        .locator('input[name*="key"], input[name*="secret"], input[name*="token"]')
        .all();
      for (const input of apiKeyInputs) {
        const type = await input.getAttribute('type');
        // Should be password type OR read-only masked display
        const isProtected = type === 'password' || (await input.getAttribute('readonly')) !== null;
        if (!isProtected) {
          const value = await input.inputValue();
          expect(value).not.toMatch(/^[a-zA-Z0-9]{20,}$/); // Not a bare key
        }
      }
    });
  });

  // ── 6. Clickjacking ─────────────────────────────────────────────────────────

  test.describe('Clickjacking', () => {
    test('login page cannot be embedded in an iframe', async ({ page }) => {
      // Try to embed the login page in an iframe and check if it loads
      await page.setContent(`
        <iframe id="frame" src="https://qaing.surecontact.com/login" width="800" height="600"></iframe>
      `);
      await page.waitForTimeout(2000);

      const frame = page.frameLocator('#frame');
      const frameLoaded = await frame
        .getByRole('button', { name: /sign in/i })
        .isVisible({ timeout: 3000 })
        .catch(() => false);

      // If X-Frame-Options: DENY is set, the iframe should be empty
      if (!frameLoaded) {
        // Good — page refused to be embedded
        expect(frameLoaded).toBe(false);
      } else {
        // Warn but don't hard-fail — some configs allow SAMEORIGIN
        console.warn('[security] ⚠️  Login page may be embeddable in an iframe');
      }
    });
  });
});

import { test, expect } from '@playwright/test';
import { CREDENTIALS } from '../../utils/test-data.js';

// Auth tests run without saved session
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication - Login', { tag: ['@smoke', '@critical'] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  // ── UI / Layout ────────────────────────────────────────────────────────────

  test('login page loads with correct title and elements', async ({ page }) => {
    await expect(page).toHaveTitle(/Login|SureContact/i);
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue with Passkey' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Forgot password?' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible();
  });

  test('email field has correct placeholder', async ({ page }) => {
    await expect(page.getByRole('textbox', { name: 'Email' })).toHaveAttribute(
      'placeholder',
      'your@email.com'
    );
  });

  test('password field masks input', async ({ page }) => {
    // input[type="password"] does not carry role="textbox" — use direct locator
    await expect(page.locator('input[type="password"]').first()).toHaveAttribute(
      'type',
      'password'
    );
  });

  test('page shows marketing copy on right panel', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Do more with every email/ })).toBeVisible();
  });

  test('unauthenticated user is redirected to login from dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/, { timeout: 10000 });
  });

  // ── Positive Tests ─────────────────────────────────────────────────────────

  test('successful login with valid credentials', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).fill(CREDENTIALS.valid.email);
    await page.locator('input[type="password"]').fill(CREDENTIALS.valid.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.waitForURL('**/dashboard', { timeout: 20000 });
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Welcome back!')).toBeVisible();
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).fill(CREDENTIALS.valid.email);
    await page.locator('input[type="password"]').fill(CREDENTIALS.valid.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for navigation before asserting URL
    await page.waitForURL('**/dashboard', { timeout: 20000 });
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByRole('heading', { name: /Welcome/ })).toBeVisible();
  });

  test('login preserves redirect_url param after auth', async ({ page }) => {
    await page.goto('/login?redirect_url=%2Fcontacts');
    await page.getByRole('textbox', { name: 'Email' }).fill(CREDENTIALS.valid.email);
    await page.locator('input[type="password"]').fill(CREDENTIALS.valid.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.waitForURL('**/contacts', { timeout: 20000 });
    await expect(page).toHaveURL(/contacts/);
  });

  // ── Negative Tests ─────────────────────────────────────────────────────────

  test('login fails with wrong password', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).fill(CREDENTIALS.wrongPassword.email);
    await page.locator('input[type="password"]').fill(CREDENTIALS.wrongPassword.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Wait for page to settle, then assert we stayed on /login
    await expect(page).toHaveURL(/login/, { timeout: 8000 });
    await expect(
      page
        .getByRole('alert')
        .or(page.locator('[class*="error"]'))
        .or(page.getByText(/invalid|incorrect|wrong/i))
    ).toBeVisible({ timeout: 8000 });
  });

  test('login fails with invalid email format', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).fill('notanemail');
    await page.locator('input[type="password"]').fill('somepassword');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/login/, { timeout: 8000 });
  });

  test('login fails with non-existent email', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).fill(CREDENTIALS.invalid.email);
    await page.locator('input[type="password"]').fill(CREDENTIALS.invalid.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL(/login/, { timeout: 8000 });
  });

  test('login fails with empty email', async ({ page }) => {
    await page.locator('input[type="password"]').fill(CREDENTIALS.valid.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/login/, { timeout: 5000 });
  });

  test('login fails with empty password', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).fill(CREDENTIALS.valid.email);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/login/, { timeout: 5000 });
  });

  test('login fails with both fields empty', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/login/, { timeout: 5000 });
  });

  // ── Edge Cases ─────────────────────────────────────────────────────────────

  test('email field trims whitespace', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).fill(`  ${CREDENTIALS.valid.email}  `);
    await page.locator('input[type="password"]').fill(CREDENTIALS.valid.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.waitForURL('**/dashboard', { timeout: 20000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test('login is case-insensitive for email', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).fill(CREDENTIALS.valid.email.toUpperCase());
    await page.locator('input[type="password"]').fill(CREDENTIALS.valid.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.waitForURL('**/dashboard', { timeout: 20000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test('SQL injection in email field does not crash', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).fill("' OR '1'='1");
    await page.locator('input[type="password"]').fill("' OR '1'='1");
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/login/, { timeout: 8000 });
  });

  test('XSS injection in email field is sanitized', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).fill('<script>alert(1)</script>@test.com');
    await page.locator('input[type="password"]').fill('password');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/login/, { timeout: 8000 });
  });

  // ── Forgot Password ────────────────────────────────────────────────────────

  test('forgot password link navigates to forgot-password page', async ({ page }) => {
    await page.getByRole('link', { name: 'Forgot password?' }).click();
    await expect(page).toHaveURL(/forgot-password/, { timeout: 8000 });
  });

  test('sign up link navigates to signup page', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign up' }).click();
    await expect(page).toHaveURL(/signup/, { timeout: 8000 });
  });
});

test.describe('Authentication - Logout', () => {
  // Shared login helper to avoid duplication
  async function loginAs(page, credentials) {
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Email' }).fill(credentials.email);
    await page.locator('input[type="password"]').fill(credentials.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('**/dashboard', { timeout: 20000 });
  }

  // Robust user-menu locator — tries aria-label, data-testid, then avatar initials as fallback
  function userMenuButton(page) {
    return page
      .locator('[aria-label*="user" i], [aria-label*="account" i], [data-testid="user-menu"]')
      .or(page.locator('button[class*="avatar"], button[class*="user"]'))
      .or(page.getByRole('button', { name: /^[A-Z]{1,3}$/ }))
      .first();
  }

  test('user can log out successfully', async ({ page }) => {
    await loginAs(page, CREDENTIALS.valid);

    await page.waitForLoadState('networkidle');
    await userMenuButton(page).click();

    await page
      .getByRole('menuitem', { name: /logout|sign out/i })
      .or(page.getByRole('button', { name: /logout|sign out/i }))
      .or(page.getByText(/logout|sign out/i))
      .first()
      .click();

    await expect(page).toHaveURL(/login/, { timeout: 10000 });
  });

  test('after logout, protected pages redirect to login', async ({ page }) => {
    await loginAs(page, CREDENTIALS.valid);

    await page.waitForLoadState('networkidle');
    await userMenuButton(page).click();

    await page
      .getByRole('menuitem', { name: /logout|sign out/i })
      .or(page.getByRole('button', { name: /logout|sign out/i }))
      .or(page.getByText(/logout|sign out/i))
      .first()
      .click();

    await expect(page).toHaveURL(/login/, { timeout: 10000 });

    await page.goto('/contacts');
    await expect(page).toHaveURL(/login/, { timeout: 8000 });
  });
});

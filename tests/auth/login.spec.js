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
    await expect(page).toHaveTitle(/Login | SureContact/);
    await expect(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
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
    const passwordField = page.getByRole('textbox', { name: 'Password' });
    await expect(passwordField).toHaveAttribute('type', 'password');
  });

  test('page shows marketing copy on right panel', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Do more with every email/ })).toBeVisible();
  });

  test('unauthenticated user is redirected to login from dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
  });

  // ── Positive Tests ─────────────────────────────────────────────────────────

  test('successful login with valid credentials', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).fill(CREDENTIALS.valid.email);
    await page.getByRole('textbox', { name: 'Password' }).fill(CREDENTIALS.valid.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText('Welcome back!')).toBeVisible();
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).fill(CREDENTIALS.valid.email);
    await page.getByRole('textbox', { name: 'Password' }).fill(CREDENTIALS.valid.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByRole('heading', { name: /Welcome/ })).toBeVisible();
  });

  test('login preserves redirect_url param after auth', async ({ page }) => {
    await page.goto('/login?redirect_url=%2Fcontacts');
    await page.getByRole('textbox', { name: 'Email' }).fill(CREDENTIALS.valid.email);
    await page.getByRole('textbox', { name: 'Password' }).fill(CREDENTIALS.valid.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.waitForURL('**/contacts', { timeout: 15000 });
    await expect(page).toHaveURL(/contacts/);
  });

  // ── Negative Tests ─────────────────────────────────────────────────────────

  test('login fails with wrong password', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).fill(CREDENTIALS.wrongPassword.email);
    await page.getByRole('textbox', { name: 'Password' }).fill(CREDENTIALS.wrongPassword.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).not.toHaveURL(/dashboard/);
    await expect(
      page
        .getByRole('alert')
        .or(page.locator('[class*="error"]').or(page.getByText(/invalid|incorrect|wrong/i)))
    ).toBeVisible({ timeout: 8000 });
  });

  test('login fails with invalid email format', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).fill('notanemail');
    await page.getByRole('textbox', { name: 'Password' }).fill('somepassword');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).not.toHaveURL(/dashboard/);
  });

  test('login fails with non-existent email', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).fill(CREDENTIALS.invalid.email);
    await page.getByRole('textbox', { name: 'Password' }).fill(CREDENTIALS.invalid.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).not.toHaveURL(/dashboard/);
  });

  test('login fails with empty email', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Password' }).fill(CREDENTIALS.valid.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).not.toHaveURL(/dashboard/);
  });

  test('login fails with empty password', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).fill(CREDENTIALS.valid.email);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).not.toHaveURL(/dashboard/);
  });

  test('login fails with both fields empty', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).not.toHaveURL(/dashboard/);
  });

  // ── Edge Cases ─────────────────────────────────────────────────────────────

  test('email field trims whitespace', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).fill(`  ${CREDENTIALS.valid.email}  `);
    await page.getByRole('textbox', { name: 'Password' }).fill(CREDENTIALS.valid.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test('login is case-insensitive for email', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).fill(CREDENTIALS.valid.email.toUpperCase());
    await page.getByRole('textbox', { name: 'Password' }).fill(CREDENTIALS.valid.password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await expect(page).toHaveURL(/dashboard/);
  });

  test('SQL injection in email field does not crash', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).fill("' OR '1'='1");
    await page.getByRole('textbox', { name: 'Password' }).fill("' OR '1'='1");
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).not.toHaveURL(/dashboard/);
    await expect(page).toHaveURL(/login/);
  });

  test('XSS injection in email field is sanitized', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Email' }).fill('<script>alert(1)</script>@test.com');
    await page.getByRole('textbox', { name: 'Password' }).fill('password');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).not.toHaveURL(/dashboard/);
  });

  // ── Forgot Password ────────────────────────────────────────────────────────

  test('forgot password link navigates to forgot-password page', async ({ page }) => {
    await page.getByRole('link', { name: 'Forgot password?' }).click();
    await expect(page).toHaveURL(/forgot-password/);
  });

  test('sign up link navigates to signup page', async ({ page }) => {
    await page.getByRole('link', { name: 'Sign up' }).click();
    await expect(page).toHaveURL(/signup/);
  });
});

test.describe('Authentication - Logout', () => {
  test('user can log out successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Email' }).fill(CREDENTIALS.valid.email);
    await page.getByRole('textbox', { name: 'Password' }).fill(CREDENTIALS.valid.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // Logout via user avatar menu
    await page.getByRole('button', { name: 'AT' }).click();
    const logoutOption = page
      .getByRole('menuitem', { name: /logout|sign out/i })
      .or(page.getByText(/logout|sign out/i));
    await logoutOption.click();

    await expect(page).toHaveURL(/login/);
  });

  test('after logout, protected pages redirect to login', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('textbox', { name: 'Email' }).fill(CREDENTIALS.valid.email);
    await page.getByRole('textbox', { name: 'Password' }).fill(CREDENTIALS.valid.password);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    await page.getByRole('button', { name: 'AT' }).click();
    const logoutOption = page
      .getByRole('menuitem', { name: /logout|sign out/i })
      .or(page.getByText(/logout|sign out/i));
    await logoutOption.click();
    await expect(page).toHaveURL(/login/);

    await page.goto('/contacts');
    await expect(page).toHaveURL(/login/);
  });
});

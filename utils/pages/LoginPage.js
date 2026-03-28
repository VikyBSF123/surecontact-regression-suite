import { BasePage } from './BasePage.js';

export class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.signInButton = page.getByRole('button', { name: 'Sign In' });
    this.forgotLink = page.getByRole('link', { name: 'Forgot password?' });
    this.signUpLink = page.getByRole('link', { name: 'Sign up' });
    this.googleBtn = page.getByRole('button', { name: 'Continue with Google' });
    this.passkeyBtn = page.getByRole('button', { name: 'Continue with Passkey' });
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async loginAndWait(email, password) {
    await this.login(email, password);
    await this.page.waitForURL('**/dashboard', { timeout: 15000 });
  }

  async getErrorMessage() {
    return this.page
      .getByRole('alert')
      .or(this.page.locator('[class*="error"]'))
      .or(this.page.getByText(/invalid|incorrect|wrong/i));
  }

  async isOnLoginPage() {
    return this.page.url().includes('/login');
  }
}

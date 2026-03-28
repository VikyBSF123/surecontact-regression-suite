export class BasePage {
  constructor(page) {
    this.page = page;
  }

  async navigate(path) {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  async getTitle() {
    return this.page.title();
  }

  async waitForToast(text) {
    return this.page.getByText(text).waitFor({ timeout: 10000 });
  }

  async dismissBanner() {
    const banner = this.page.getByRole('button', { name: 'Dismiss banner' });
    if (await banner.isVisible().catch(() => false)) {
      await banner.click();
    }
  }

  async getHeading() {
    return this.page.getByRole('heading').first();
  }

  async searchFor(placeholder, term) {
    const input = this.page.getByPlaceholder(placeholder);
    await input.fill(term);
    await this.page.waitForTimeout(600);
    return input;
  }

  async closeModalWithEscape() {
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);
  }

  async closeModal() {
    const cancelBtn = this.page.getByRole('button', { name: /cancel|close/i });
    if (await cancelBtn.isVisible().catch(() => false)) {
      await cancelBtn.click();
    } else {
      await this.closeModalWithEscape();
    }
  }

  async confirmDelete() {
    await this.page.getByRole('button', { name: /confirm|yes|delete/i }).click();
  }

  async cancelDelete() {
    await this.page.getByRole('button', { name: /cancel/i }).click();
  }

  async isEmptyState(text) {
    return this.page
      .getByText(text)
      .isVisible()
      .catch(() => false);
  }
}

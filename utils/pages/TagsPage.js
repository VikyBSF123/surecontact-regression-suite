import { BasePage } from './BasePage.js';

export class TagsPage extends BasePage {
  constructor(page) {
    super(page);
    this.heading = page.getByRole('heading', { name: /tags/i });
    this.createBtn = page.getByRole('button', { name: /create tag|new tag|add tag/i });
    this.searchInput = page.getByPlaceholder(/search/i);
    this.table = page.getByRole('table');
    this.emptyState = page.getByText(/no tags/i);
  }

  async goto() {
    await this.navigate('/tags');
  }

  async openCreateTag() {
    await this.createBtn.click();
    await this.page.waitForTimeout(400);
  }

  async fillTagName(name) {
    await this.page.getByRole('textbox', { name: /name|tag name/i }).fill(name);
  }

  async saveTag() {
    await this.page
      .getByRole('button', { name: /save|create|add/i })
      .last()
      .click();
  }

  async createTag(name) {
    await this.openCreateTag();
    await this.fillTagName(name);
    await this.saveTag();
  }

  async search(term) {
    await this.searchInput.fill(term);
    await this.page.waitForTimeout(600);
  }

  async hasData() {
    return this.table.isVisible().catch(() => false);
  }

  async isEmpty() {
    return this.emptyState.isVisible().catch(() => false);
  }

  async deleteFirstTag() {
    await this.page
      .getByRole('button', { name: /delete/i })
      .first()
      .click();
  }
}

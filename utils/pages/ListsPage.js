import { BasePage } from './BasePage.js';

export class ListsPage extends BasePage {
  constructor(page) {
    super(page);
    this.heading = page.getByRole('heading', { name: /lists/i });
    this.createBtn = page.getByRole('button', { name: /create list|new list|add list/i });
    this.searchInput = page.getByPlaceholder(/search/i);
    this.table = page.getByRole('table');
    this.emptyState = page.getByText(/no lists/i);
  }

  async goto() {
    await this.navigate('/lists');
  }

  async openCreateList() {
    await this.createBtn.click();
    await this.page.waitForTimeout(400);
  }

  async fillListName(name) {
    await this.page.getByRole('textbox', { name: /name|list name/i }).fill(name);
  }

  async saveList() {
    await this.page
      .getByRole('button', { name: /save|create|add/i })
      .last()
      .click();
  }

  async createList(name) {
    await this.openCreateList();
    await this.fillListName(name);
    await this.saveList();
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

  async getRowCount() {
    return this.page.getByRole('row').count();
  }

  async deleteFirstList() {
    await this.page
      .getByRole('button', { name: /delete/i })
      .first()
      .click();
  }
}

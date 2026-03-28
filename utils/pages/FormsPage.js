import { BasePage } from './BasePage.js';

export class FormsPage extends BasePage {
  constructor(page) {
    super(page);
    this.heading = page.getByRole('heading', { name: /Forms/i });
    this.createBtn = page.getByRole('button', { name: /create form|new form/i });
    this.searchInput = page.getByPlaceholder(/search/i);
    this.table = page.getByRole('table');
    this.emptyState = page.getByText(/no forms/i);
  }

  async goto() {
    await this.navigate('/forms');
  }

  async openCreateForm() {
    await this.createBtn.click();
    await this.page.waitForTimeout(400);
  }

  async fillFormName(name) {
    await this.page.getByRole('textbox', { name: /name|form name/i }).fill(name);
  }

  async saveForm() {
    await this.page
      .getByRole('button', { name: /save|create|next/i })
      .last()
      .click();
  }

  async createForm(name) {
    await this.openCreateForm();
    await this.fillFormName(name);
    await this.saveForm();
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
}

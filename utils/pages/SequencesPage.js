import { BasePage } from './BasePage.js';

export class SequencesPage extends BasePage {
  constructor(page) {
    super(page);
    this.heading = page.getByRole('heading', { name: /sequences/i });
    this.createBtn = page.getByRole('button', { name: /create sequence|new sequence/i });
    this.searchInput = page.getByPlaceholder(/search/i);
    this.table = page.getByRole('table');
    this.emptyState = page.getByText(/no sequences/i);
  }

  async goto() {
    await this.navigate('/sequences');
  }

  async openCreateSequence() {
    await this.createBtn.click();
    await this.page.waitForTimeout(400);
  }

  async fillSequenceName(name) {
    await this.page.getByRole('textbox', { name: /name|sequence name/i }).fill(name);
  }

  async saveSequence() {
    await this.page
      .getByRole('button', { name: /save|create|next/i })
      .last()
      .click();
  }

  async createSequence(name) {
    await this.openCreateSequence();
    await this.fillSequenceName(name);
    await this.saveSequence();
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

  async toggleFirstSequence() {
    const toggle = this.page.getByRole('switch').first();
    if (await toggle.isVisible().catch(() => false)) {
      await toggle.click();
    }
  }
}

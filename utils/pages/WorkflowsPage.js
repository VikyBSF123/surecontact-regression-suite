import { BasePage } from './BasePage.js';

export class WorkflowsPage extends BasePage {
  constructor(page) {
    super(page);
    this.createBtn = page.getByRole('button', { name: /create workflow|new workflow/i });
    this.searchInput = page.getByPlaceholder(/search/i);
    this.table = page.getByRole('table');
  }

  async goto() {
    await this.navigate('/workflows');
  }

  async openCreateWorkflow() {
    await this.createBtn.click();
    await this.page.waitForTimeout(400);
  }

  async fillWorkflowName(name) {
    await this.page.getByRole('textbox', { name: /name|workflow name/i }).fill(name);
  }

  async saveWorkflow() {
    await this.page
      .getByRole('button', { name: /save|create|next/i })
      .last()
      .click();
  }

  async createWorkflow(name) {
    await this.openCreateWorkflow();
    await this.fillWorkflowName(name);
    await this.saveWorkflow();
  }

  async search(term) {
    await this.searchInput.fill(term);
    await this.page.waitForTimeout(600);
  }

  async hasData() {
    return this.table.isVisible().catch(() => false);
  }

  async toggleFirstWorkflow() {
    const toggle = this.page.getByRole('switch').first();
    if (await toggle.isVisible().catch(() => false)) {
      await toggle.click();
    }
  }

  async deleteFirstWorkflow() {
    await this.page
      .getByRole('button', { name: /delete/i })
      .first()
      .click();
  }
}

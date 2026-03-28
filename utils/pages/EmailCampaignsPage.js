import { BasePage } from './BasePage.js';

export class EmailCampaignsPage extends BasePage {
  constructor(page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Email Campaigns' });
    this.createBtn = page.getByRole('button', { name: 'Create Campaign' });
    this.exportCsvBtn = page.getByRole('button', { name: 'Export CSV' });
    this.searchInput = page.getByPlaceholder(/search campaigns/i);
    this.table = page.getByRole('table');
    this.emptyState = page.getByText('No campaigns yet');
  }

  async goto() {
    await this.navigate('/email-campaigns');
  }

  async openCreateCampaign() {
    await this.createBtn.click();
    await this.page.waitForTimeout(400);
  }

  async fillCampaignName(name) {
    await this.page.getByRole('textbox', { name: /campaign name|name/i }).fill(name);
  }

  async submitCampaignForm() {
    await this.page
      .getByRole('button', { name: /next|create|save/i })
      .last()
      .click();
  }

  async createCampaign(name) {
    await this.openCreateCampaign();
    await this.fillCampaignName(name);
    await this.submitCampaignForm();
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

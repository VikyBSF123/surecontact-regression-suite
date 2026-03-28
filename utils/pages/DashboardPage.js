import { BasePage } from './BasePage.js';

export class DashboardPage extends BasePage {
  constructor(page) {
    super(page);
    this.welcomeHeading = page.getByRole('heading', { name: /Welcome/ });
    this.importContactsBtn = page.getByRole('button', { name: 'Import Contacts' });
    this.crmMenu = page.getByRole('button', { name: 'CRM' });
    this.campaignsMenu = page.getByRole('button', { name: 'Campaigns' });
    this.automationsMenu = page.getByRole('button', { name: 'Automations' });
    this.seeAllUsageBtn = page.getByRole('button', { name: 'See All Usage' });
    this.collapseBtn = page.getByRole('button', { name: 'Collapse sidebar' });
    this.userAvatarBtn = page.getByRole('button', { name: 'AT' });
  }

  async goto() {
    await this.navigate('/dashboard');
  }

  async expandCRM() {
    await this.crmMenu.click();
  }

  async expandCampaigns() {
    await this.campaignsMenu.click();
  }

  async expandAutomations() {
    await this.automationsMenu.click();
  }

  async navigateTo(label) {
    await this.page.getByRole('link', { name: label }).click();
  }

  async logout() {
    await this.userAvatarBtn.click();
    await this.page.getByText(/logout|sign out/i).click();
  }

  async collapseSidebar() {
    await this.collapseBtn.click();
  }
}

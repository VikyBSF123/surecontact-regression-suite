import { BasePage } from './BasePage.js';

export class SettingsPage extends BasePage {
  constructor(page) {
    super(page);
    this.heading = page.getByRole('heading', { name: /settings/i });
    this.profileTab = page
      .getByRole('tab', { name: /profile/i })
      .or(page.getByRole('link', { name: /profile/i }));
    this.billingTab = page
      .getByRole('tab', { name: /billing/i })
      .or(page.getByRole('link', { name: /billing/i }));
    this.integrationsTab = page
      .getByRole('tab', { name: /integrations/i })
      .or(page.getByRole('link', { name: /integrations/i }));
    this.saveBtn = page.getByRole('button', { name: /save|update/i });
  }

  async goto() {
    await this.navigate('/settings');
  }

  async gotoProfile() {
    await this.navigate('/settings/profile');
  }

  async gotoBilling() {
    await this.navigate('/settings/billing');
  }

  async gotoIntegrations() {
    await this.navigate('/settings/integrations');
  }

  async updateFirstName(name) {
    const field = this.page.getByRole('textbox', { name: /first name/i });
    await field.clear();
    await field.fill(name);
  }

  async save() {
    await this.saveBtn.click();
  }
}

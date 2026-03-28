import { BasePage } from './BasePage.js';

export class ReportsPage extends BasePage {
  constructor(page) {
    super(page);
    this.heading = page.getByRole('heading', { name: /reports/i });
    this.exportCsvBtn = page.getByRole('button', { name: /export csv|export/i });
    this.dateRangePicker = page.getByRole('button', { name: /date range|last 30|this month/i });
  }

  async goto() {
    await this.navigate('/reports');
  }

  async gotoEmailReports() {
    await this.navigate('/reports/email');
  }

  async gotoContactReports() {
    await this.navigate('/reports/contacts');
  }

  async exportCsv() {
    await this.exportCsvBtn.click();
  }
}

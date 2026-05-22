import { BasePage } from './BasePage.js';

export class ContactsPage extends BasePage {
  constructor(page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Contacts' });
    this.addContactBtn = page.getByRole('button', { name: 'Add Contact' }).first();
    this.importBtn = page.getByRole('button', { name: 'Import' });
    this.exportBtn = page.getByRole('button', { name: 'Export' });
    this.searchInput = page.getByPlaceholder(/Search contact/i).first();
    this.table = page.getByRole('table');
    this.emptyState = page.getByText('No contacts yet');
  }

  async goto() {
    await this.navigate('/contacts');
  }

  async openAddContact() {
    await this.addContactBtn.click();
    await this.page.waitForTimeout(400);
  }

  async fillContactEmail(email) {
    await this.page.getByRole('textbox', { name: /email/i }).last().fill(email);
  }

  async fillContactFirstName(name) {
    await this.page.getByRole('textbox', { name: /first name/i }).fill(name);
  }

  async fillContactLastName(name) {
    await this.page.getByRole('textbox', { name: /last name/i }).fill(name);
  }

  async saveContact() {
    await this.page
      .getByRole('button', { name: /save|add|create|submit/i })
      .last()
      .click();
  }

  async addContact(email, firstName = '', lastName = '') {
    await this.openAddContact();
    if (firstName) await this.fillContactFirstName(firstName);
    if (lastName) await this.fillContactLastName(lastName);
    await this.fillContactEmail(email);
    await this.saveContact();
  }

  async search(term) {
    await this.searchInput.fill(term);
    await this.page.waitForTimeout(600);
  }

  async clearSearch() {
    await this.searchInput.clear();
  }

  async hasData() {
    return this.table.isVisible().catch(() => false);
  }

  async isEmpty() {
    return this.emptyState.isVisible().catch(() => false);
  }

  async getRowCount() {
    const rows = this.page.getByRole('row');
    return rows.count();
  }

  async clickFirstRow() {
    await this.page.getByRole('row').nth(1).click();
  }

  async deleteFirstContact() {
    await this.page.getByRole('row').nth(1).hover();
    await this.page
      .getByRole('button', { name: /delete/i })
      .first()
      .click();
  }
}

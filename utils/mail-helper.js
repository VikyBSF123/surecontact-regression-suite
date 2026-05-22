/**
 * MailHelper — polls Mailpit / MailHog for outbound emails in E2E tests.
 *
 * Requires a local mail catcher running on MAILPIT_URL (default http://localhost:8025).
 * In the E2E environment, configure the Laravel backend with MAIL_MAILER=smtp pointing
 * at Mailpit/MailHog so all outbound emails are intercepted.
 *
 * Usage:
 *   import { MailHelper } from '../../utils/mail-helper.js';
 *
 *   test('sends welcome email', async ({ request }) => {
 *     const mail = new MailHelper(request);
 *     await mail.clear();                          // wipe previous messages
 *     // ... trigger action that sends email ...
 *     const msg = await mail.waitForEmail({
 *       to: 'user@example.com',
 *       subject: /Welcome to SureContact/,
 *     });
 *     expect(msg).toBeTruthy();
 *     const body = await mail.getBody(msg.ID);
 *     expect(body).toContain('Confirm your email');
 *   });
 */

const MAILPIT_URL = process.env.MAILPIT_URL || process.env.MAILHOG_URL || 'http://localhost:8025';
const POLL_INTERVAL_MS = 500;
const DEFAULT_TIMEOUT_MS = 15000;

export class MailHelper {
  constructor(request, baseUrl = MAILPIT_URL) {
    this.request = request;
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  // ── Core ──────────────────────────────────────────────────────────────────

  /**
   * Poll until an email matching the given criteria arrives, or throw on timeout.
   *
   * @param {Object} options
   * @param {string}          [options.to]       - recipient address to match (partial or exact)
   * @param {string|RegExp}   [options.subject]  - subject to match
   * @param {number}          [options.timeout]  - max wait in ms (default 15 000)
   * @returns {Promise<Object>} the matching Mailpit/MailHog message object
   */
  async waitForEmail({ to, subject, timeout = DEFAULT_TIMEOUT_MS } = {}) {
    const deadline = Date.now() + timeout;

    while (Date.now() < deadline) {
      const messages = await this._fetchMessages();

      const match = messages.find((msg) => {
        const recipients = msg.To ?? msg.to ?? [];
        const toMatch =
          !to ||
          recipients.some((r) => {
            const addr = r.Address ?? r.address ?? r;
            return typeof addr === 'string' && addr.includes(to);
          });

        const msgSubject = msg.Subject ?? msg.subject ?? '';
        const subjectMatch =
          !subject ||
          (subject instanceof RegExp ? subject.test(msgSubject) : msgSubject.includes(subject));

        return toMatch && subjectMatch;
      });

      if (match) return match;

      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }

    throw new Error(
      `MailHelper: No email found matching { to: "${to}", subject: "${subject}" } within ${timeout}ms.\n` +
        `Is the mail catcher running at ${this.baseUrl}?`
    );
  }

  /**
   * Get the plain-text or HTML body of a message by ID.
   * @param {string} messageId
   * @returns {Promise<string>}
   */
  async getBody(messageId) {
    // Mailpit: /api/v1/message/<id>
    try {
      const res = await this.request.get(`${this.baseUrl}/api/v1/message/${messageId}`, {
        timeout: 5000,
        failOnStatusCode: false,
      });
      if (res.ok()) {
        const body = await res.json();
        return body.Text || body.HTML || '';
      }
    } catch {
      // fall through
    }

    // MailHog: /api/v1/messages/<id>
    try {
      const res = await this.request.get(`${this.baseUrl}/api/v1/messages/${messageId}`, {
        timeout: 5000,
        failOnStatusCode: false,
      });
      if (res.ok()) {
        const body = await res.json();
        return body.Content?.Body ?? '';
      }
    } catch {
      // fall through
    }

    return '';
  }

  /**
   * Delete all messages — call before a test to start with a clean inbox.
   */
  async clear() {
    try {
      // Mailpit DELETE /api/v1/messages
      await this.request.delete(`${this.baseUrl}/api/v1/messages`, {
        timeout: 5000,
        failOnStatusCode: false,
      });
    } catch {
      // ignore — mail catcher may not be running in all environments
    }
  }

  /**
   * Returns the number of messages currently in the catcher.
   * @returns {Promise<number>}
   */
  async count() {
    const messages = await this._fetchMessages();
    return messages.length;
  }

  // ── Private ───────────────────────────────────────────────────────────────

  async _fetchMessages() {
    // Try Mailpit first (newer, more common)
    try {
      const res = await this.request.get(`${this.baseUrl}/api/v1/messages`, {
        timeout: 5000,
        failOnStatusCode: false,
        params: { limit: 100 },
      });
      if (res.ok()) {
        const body = await res.json();
        return body.messages ?? [];
      }
    } catch {
      // fall through to MailHog
    }

    // MailHog fallback
    try {
      const res = await this.request.get(`${this.baseUrl}/api/v2/messages`, {
        timeout: 5000,
        failOnStatusCode: false,
      });
      if (res.ok()) {
        const body = await res.json();
        return body.items ?? [];
      }
    } catch {
      // mail catcher not running — return empty so tests skip gracefully
    }

    return [];
  }
}

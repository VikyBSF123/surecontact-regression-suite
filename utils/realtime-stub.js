/* global window */
/**
 * RealtimeStub — stubs Pusher / Laravel Reverb WebSocket events in E2E tests.
 *
 * Playwright cannot intercept raw WebSocket frames, so this stub works at two layers:
 *   1. Network: intercepts Pusher auth and event trigger endpoints → returns stub responses.
 *   2. Browser: injects window.__realtimeStub so tests can fire events directly into the page.
 *
 * Call setup() before page.goto() so the init script is injected before the app boots.
 *
 * Usage:
 *   import { RealtimeStub } from '../../utils/realtime-stub.js';
 *
 *   test('shows new contact in real-time', async ({ page }) => {
 *     const rt = new RealtimeStub(page);
 *     await rt.setup();
 *
 *     await page.goto('/contacts');
 *
 *     // Simulate the backend pushing a contact.created event
 *     await rt.emit('private-workspace.1', 'contact.created', { id: 42, name: 'Alice' });
 *
 *     await expect(page.getByText('Alice')).toBeVisible();
 *   });
 */

export class RealtimeStub {
  constructor(page) {
    this.page = page;
  }

  /**
   * Install network intercepts and the browser-side event bus.
   * Must be called BEFORE page.goto().
   */
  async setup() {
    // ── 1. Stub Pusher / Reverb auth endpoints ───────────────────────────────
    await this.page.route('**/broadcasting/auth', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ auth: 'e2e-stub:signature' }),
      });
    });

    // Pusher channel auth (legacy path)
    await this.page.route('**/pusher/auth', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ auth: 'e2e-stub:signature', channel_data: '{}' }),
      });
    });

    // Pusher trigger events (outbound from app → Pusher API)
    await this.page.route('**/apps/*/events', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    // Reverb / Soketi WebSocket upgrade (prevent real connections)
    await this.page.route('**/app/*?protocol=7*', async (route) => {
      await route.abort('failed');
    });

    // ── 2. Inject browser-side event bus ─────────────────────────────────────
    await this.page.addInitScript(() => {
      window.__realtimeListeners = {};

      window.__realtimeStub = {
        /**
         * Fire an event as if it arrived over the WebSocket connection.
         * @param {string} channel  - e.g. 'private-workspace.1'
         * @param {string} event    - e.g. 'contact.created'
         * @param {Object} data     - event payload
         */
        emit(channel, event, data) {
          const key = `${channel}::${event}`;
          const listeners = window.__realtimeListeners[key] ?? [];
          listeners.forEach((fn) => {
            try {
              fn(data);
            } catch (e) {
              console.error('[RealtimeStub] listener error:', e);
            }
          });
        },

        /** Register a handler (mirrors Pusher channel.bind semantics). */
        on(channel, event, fn) {
          const key = `${channel}::${event}`;
          if (!window.__realtimeListeners[key]) {
            window.__realtimeListeners[key] = [];
          }
          window.__realtimeListeners[key].push(fn);
        },

        /** Remove all listeners for a channel+event pair. */
        off(channel, event) {
          delete window.__realtimeListeners[`${channel}::${event}`];
        },
      };
    });
  }

  /**
   * Emit a fake realtime event into the currently-loaded page.
   *
   * @param {string} channel  - Pusher/Reverb channel name
   * @param {string} event    - event name
   * @param {Object} [data]   - event payload
   */
  async emit(channel, event, data = {}) {
    await this.page.evaluate(
      ({ channel, event, data }) => {
        if (!window.__realtimeStub) {
          console.warn('[RealtimeStub] emit called before setup()');
          return;
        }
        window.__realtimeStub.emit(channel, event, data);
      },
      { channel, event, data }
    );
  }

  /**
   * Remove all registered test listeners (call between tests to avoid cross-contamination).
   */
  async reset() {
    await this.page.evaluate(() => {
      window.__realtimeListeners = {};
    });
  }
}

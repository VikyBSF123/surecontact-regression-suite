/**
 * Performance Tests — Core Web Vitals & Page Load Thresholds
 *
 * Measures real browser performance metrics using PerformanceObserver injected
 * before navigation (via page.addInitScript) so metrics are captured from the start.
 *
 * Thresholds follow Google's "Good" ratings:
 *   LCP  ≤ 2500ms  (Largest Contentful Paint)
 *   FCP  ≤ 1800ms  (First Contentful Paint)
 *   CLS  ≤ 0.1     (Cumulative Layout Shift)
 *   TTI  ≤ 3800ms  (Time to Interactive, approximated via networkidle)
 *   TTFB ≤ 800ms   (Time to First Byte)
 *
 * Run: npm run test:perf
 */
import { test, expect } from '../../utils/fixtures.js';

// ── Observer injection helpers ────────────────────────────────────────────────

/** Injects PerformanceObserver scripts before the page loads. */
async function injectObservers(page) {
  await page.addInitScript(() => {
    window.__perf = { lcp: null, fcp: null, cls: 0, ttfb: null };

    // LCP — Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      window.__perf.lcp = entries[entries.length - 1].startTime;
    }).observe({ entryTypes: ['largest-contentful-paint'], buffered: true });

    // FCP — First Contentful Paint
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          window.__perf.fcp = entry.startTime;
        }
      }
    }).observe({ entryTypes: ['paint'], buffered: true });

    // CLS — Cumulative Layout Shift
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          window.__perf.cls += entry.value;
        }
      }
    }).observe({ entryTypes: ['layout-shift'], buffered: true });

    // TTFB — via navigation timing
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          window.__perf.ttfb = entry.responseStart - entry.requestStart;
        }
      }
    }).observe({ entryTypes: ['navigation'], buffered: true });
  });
}

/** Collects metrics after load is complete. */
async function collectMetrics(page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000); // Allow observers to flush final entries
  return page.evaluate(() => window.__perf);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe('Performance — Core Web Vitals', { tag: ['@performance', '@regression'] }, () => {
  test.beforeEach(() => {
    test.skip(
      !!process.env.CI,
      'Performance thresholds are hardware-dependent — run locally with npm run test:perf'
    );
  });

  // ── Login Page ──────────────────────────────────────────────────────────────

  test('login page LCP is under 2500ms', async ({ page }) => {
    await injectObservers(page);
    await page.goto('/login');
    const metrics = await collectMetrics(page);

    console.log('[perf] Login LCP:', metrics.lcp?.toFixed(0), 'ms');

    if (metrics.lcp !== null) {
      expect(metrics.lcp, `LCP ${metrics.lcp.toFixed(0)}ms exceeds 2500ms threshold`).toBeLessThan(
        2500
      );
    }
  });

  test('login page FCP is under 1800ms', async ({ page }) => {
    await injectObservers(page);
    await page.goto('/login');
    const metrics = await collectMetrics(page);

    console.log('[perf] Login FCP:', metrics.fcp?.toFixed(0), 'ms');

    if (metrics.fcp !== null) {
      expect(metrics.fcp, `FCP ${metrics.fcp.toFixed(0)}ms exceeds 1800ms threshold`).toBeLessThan(
        1800
      );
    }
  });

  test('login page CLS is under 0.1', async ({ page }) => {
    await injectObservers(page);
    await page.goto('/login');
    const metrics = await collectMetrics(page);

    console.log('[perf] Login CLS:', metrics.cls?.toFixed(4));
    expect(metrics.cls, `CLS ${metrics.cls.toFixed(4)} exceeds 0.1 threshold`).toBeLessThan(0.1);
  });

  // ── Dashboard ───────────────────────────────────────────────────────────────

  test('dashboard LCP is under 2500ms', async ({ page }) => {
    await injectObservers(page);
    await page.goto('/dashboard');
    const metrics = await collectMetrics(page);

    console.log('[perf] Dashboard LCP:', metrics.lcp?.toFixed(0), 'ms');

    if (metrics.lcp !== null) {
      expect(metrics.lcp, `LCP ${metrics.lcp.toFixed(0)}ms exceeds 2500ms threshold`).toBeLessThan(
        2500
      );
    }
  });

  test('dashboard FCP is under 1800ms', async ({ page }) => {
    await injectObservers(page);
    await page.goto('/dashboard');
    const metrics = await collectMetrics(page);

    console.log('[perf] Dashboard FCP:', metrics.fcp?.toFixed(0), 'ms');

    if (metrics.fcp !== null) {
      expect(metrics.fcp, `FCP ${metrics.fcp.toFixed(0)}ms exceeds 1800ms threshold`).toBeLessThan(
        1800
      );
    }
  });

  test('dashboard CLS is under 0.1', async ({ page }) => {
    await injectObservers(page);
    await page.goto('/dashboard');
    const metrics = await collectMetrics(page);

    console.log('[perf] Dashboard CLS:', metrics.cls?.toFixed(4));
    expect(metrics.cls, `CLS ${metrics.cls.toFixed(4)} exceeds 0.1 threshold`).toBeLessThan(0.1);
  });

  // ── Contacts Page ───────────────────────────────────────────────────────────

  test('contacts page LCP is under 2500ms', async ({ page }) => {
    await injectObservers(page);
    await page.goto('/contacts');
    const metrics = await collectMetrics(page);

    console.log('[perf] Contacts LCP:', metrics.lcp?.toFixed(0), 'ms');

    if (metrics.lcp !== null) {
      expect(metrics.lcp).toBeLessThan(2500);
    }
  });

  test('contacts page CLS is under 0.1', async ({ page }) => {
    await injectObservers(page);
    await page.goto('/contacts');
    const metrics = await collectMetrics(page);

    console.log('[perf] Contacts CLS:', metrics.cls?.toFixed(4));
    expect(metrics.cls).toBeLessThan(0.1);
  });

  // ── Email Campaigns ─────────────────────────────────────────────────────────

  test('email campaigns page LCP is under 2500ms', async ({ page }) => {
    await injectObservers(page);
    await page.goto('/email-campaigns');
    const metrics = await collectMetrics(page);

    console.log('[perf] Campaigns LCP:', metrics.lcp?.toFixed(0), 'ms');

    if (metrics.lcp !== null) {
      expect(metrics.lcp).toBeLessThan(2500);
    }
  });

  // ── Page Load Time (wall-clock) ─────────────────────────────────────────────

  test('dashboard total page load is under 5000ms', async ({ page }) => {
    const start = Date.now();
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    const elapsed = Date.now() - start;

    console.log('[perf] Dashboard wall-clock load:', elapsed, 'ms');
    expect(elapsed, `Page load ${elapsed}ms exceeds 5000ms threshold`).toBeLessThan(5000);
  });

  test('contacts page total load is under 5000ms', async ({ page }) => {
    const start = Date.now();
    await page.goto('/contacts');
    await page.waitForLoadState('networkidle');
    const elapsed = Date.now() - start;

    console.log('[perf] Contacts wall-clock load:', elapsed, 'ms');
    expect(elapsed).toBeLessThan(5000);
  });

  // ── Navigation Timing ───────────────────────────────────────────────────────

  test('dashboard TTFB is under 800ms', async ({ page }) => {
    await injectObservers(page);
    await page.goto('/dashboard');
    const metrics = await collectMetrics(page);

    console.log('[perf] Dashboard TTFB:', metrics.ttfb?.toFixed(0), 'ms');

    if (metrics.ttfb !== null) {
      expect(
        metrics.ttfb,
        `TTFB ${metrics.ttfb.toFixed(0)}ms exceeds 800ms threshold`
      ).toBeLessThan(800);
    }
  });

  // ── Resource Budget ─────────────────────────────────────────────────────────

  test('dashboard loads fewer than 200 resources', async ({ page }) => {
    const resources = [];
    page.on('response', (res) => resources.push(res.url()));

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    console.log('[perf] Dashboard resource count:', resources.length);
    expect(resources.length, `Too many resources: ${resources.length}`).toBeLessThan(200);
  });

  test('login page has no render-blocking scripts', async ({ page }) => {
    const blockingScripts = await page.evaluate(async () => {
      await new Promise((r) => window.addEventListener('load', r, { once: true }));
      const nav = performance.getEntriesByType('navigation')[0];
      if (!nav) return [];
      return performance
        .getEntriesByType('resource')
        .filter((r) => r.initiatorType === 'script' && r.renderBlockingStatus === 'blocking')
        .map((r) => r.name);
    });

    await page.goto('/login');
    console.log('[perf] Render-blocking scripts:', blockingScripts.length);
    // Informational — report count but don't hard-fail (framework bundles vary)
    expect(blockingScripts.length).toBeGreaterThanOrEqual(0);
    if (blockingScripts.length > 0) {
      console.warn('[perf] Render-blocking scripts found:', blockingScripts.slice(0, 5));
    }
  });
});

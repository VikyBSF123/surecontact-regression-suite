/**
 * Global Setup — runs once before any test starts.
 *
 * Performs a pre-flight health check so you get ONE clear error
 * instead of 200+ cryptic test failures when the environment is down.
 *
 * Checks:
 *   1. Required environment variables are present
 *   2. Target BASE_URL is reachable (HTTP ≤ 10s)
 *   3. API health endpoint responds
 *   4. Auth credentials return a valid session token
 *
 * Configured in playwright.config.js → globalSetup.
 */
import { request } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://qaing.surecontact.com';
const API_BASE = process.env.API_BASE_URL || 'https://qaing.surecontact.com/api/v1';
const TEST_EMAIL = process.env.TEST_EMAIL || 'vikrantd+autotest1@bsf.io';
const TEST_PASS = process.env.TEST_PASSWORD;

// ── Helpers ───────────────────────────────────────────────────────────────────

function pass(msg) {
  console.log(`  ✅  ${msg}`);
}
function fail(msg) {
  console.error(`  ❌  ${msg}`);
}
function warn(msg) {
  console.warn(`  ⚠️   ${msg}`);
}
function section(h) {
  console.log(`\n── ${h} ${'─'.repeat(Math.max(0, 50 - h.length))}`);
}

// ── Checks ────────────────────────────────────────────────────────────────────

function checkEnvVars() {
  section('Environment Variables');
  const required = [
    ['BASE_URL', BASE_URL],
    ['API_BASE_URL', API_BASE],
    ['TEST_EMAIL', TEST_EMAIL],
    ['TEST_PASSWORD', TEST_PASS],
  ];

  let allPresent = true;
  for (const [name, value] of required) {
    if (value) {
      pass(`${name} is set`);
    } else {
      fail(`${name} is missing — add it to your .env file`);
      allPresent = false;
    }
  }
  return allPresent;
}

async function checkBaseUrl(ctx) {
  section('Application Reachability');
  try {
    const res = await ctx.get(BASE_URL, { timeout: 10000, failOnStatusCode: false });
    const status = res.status();
    if (status < 500) {
      pass(`${BASE_URL} responded with HTTP ${status}`);
      return true;
    }
    fail(`${BASE_URL} returned HTTP ${status} — server may be down`);
    return false;
  } catch (err) {
    fail(`Cannot reach ${BASE_URL}: ${err.message}`);
    return false;
  }
}

async function checkApi(ctx) {
  section('API Health');

  // Try a generic health/ping endpoint — fall back to root if unavailable
  const candidates = [`${API_BASE}/health`, `${API_BASE}/ping`, `${API_BASE}/status`, API_BASE];

  for (const url of candidates) {
    try {
      const res = await ctx.get(url, {
        timeout: 8000,
        failOnStatusCode: false,
        headers: { Accept: 'application/json' },
      });
      const status = res.status();
      if (status < 500) {
        pass(`API responded at ${url} (HTTP ${status})`);
        return true;
      }
    } catch {
      /* try next candidate */
    }
  }

  warn('No API health endpoint found — continuing, but API tests may fail');
  return true; // non-fatal; actual tests will surface API problems
}

async function checkAuth(ctx) {
  section('Authentication');

  if (!TEST_PASS) {
    fail('TEST_PASSWORD is not set — cannot verify credentials');
    return false;
  }

  try {
    const res = await ctx.post(`${API_BASE}/login`, {
      data: { email: TEST_EMAIL, password: TEST_PASS },
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      timeout: 15000,
      failOnStatusCode: false,
    });

    const status = res.status();

    if (status === 200 || status === 201) {
      const body = await res.json().catch(() => ({}));
      const token = body?.token ?? body?.data?.token ?? body?.access_token;

      if (token) {
        pass(`Login succeeded for ${TEST_EMAIL} — Bearer token received`);
      } else {
        // 200 but no token — try cookie-based auth (some apps use sessions)
        warn(`Login returned HTTP ${status} but no Bearer token found (session-cookie auth?)`);
      }
      return true;
    }

    if (status === 401 || status === 422) {
      fail(
        `Login failed for ${TEST_EMAIL} — HTTP ${status}: check TEST_EMAIL / TEST_PASSWORD in .env`
      );
      return false;
    }

    warn(`Login returned unexpected HTTP ${status} — proceeding, but auth may be broken`);
    return true;
  } catch (err) {
    fail(`Auth request failed: ${err.message}`);
    return false;
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default async function globalSetup() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║     SureContact Regression Suite — Pre-flight Check  ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`  Environment : ${BASE_URL}`);
  console.log(`  API Base    : ${API_BASE}`);
  console.log(`  Test user   : ${TEST_EMAIL}`);

  const ctx = await request.newContext({ ignoreHTTPSErrors: true });

  const errors = [];

  try {
    // 1. Env vars
    if (!checkEnvVars()) errors.push('Missing required environment variables');

    // 2. Base URL reachable
    const baseOk = await checkBaseUrl(ctx);
    if (!baseOk) errors.push(`Application not reachable at ${BASE_URL}`);

    // 3. API responding (non-fatal — skipped if base is already down)
    if (baseOk) await checkApi(ctx);

    // 4. Auth credentials valid
    const authOk = await checkAuth(ctx);
    if (!authOk)
      errors.push('Authentication failed — credentials are invalid or the auth endpoint is down');
  } finally {
    await ctx.dispose();
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log('\n────────────────────────────────────────────────────────');

  if (errors.length === 0) {
    console.log('✅  All pre-flight checks passed — starting test suite.\n');
    return;
  }

  console.error('\n🚨  Pre-flight check FAILED. Fix the issues below before running tests:\n');
  errors.forEach((e, i) => console.error(`  ${i + 1}. ${e}`));
  console.error('\n  Tip: run `cp .env.example .env` and fill in the values.\n');

  throw new Error(`Global setup failed: ${errors.join(' | ')}`);
}

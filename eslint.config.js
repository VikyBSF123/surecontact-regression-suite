import js from '@eslint/js';
import playwright from 'eslint-plugin-playwright';

// Node.js globals (process, __dirname, etc.)
const nodeGlobals = {
  process: 'readonly',
  __dirname: 'readonly',
  __filename: 'readonly',
  Buffer: 'readonly',
  console: 'readonly',
  URL: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
};

// Browser globals used inside page.evaluate() / addInitScript()
const browserGlobals = {
  window: 'readonly',
  document: 'readonly',
  getComputedStyle: 'readonly',
  PerformanceObserver: 'readonly',
  performance: 'readonly',
  navigator: 'readonly',
};

export default [
  // ── Base JS rules ──────────────────────────────────────────────────────────
  js.configs.recommended,

  // ── Node utility files (global-setup, global-teardown, api helpers, etc.) ──
  {
    files: ['utils/**/*.js', 'playwright.config.js', 'playwright-ct.config.js', 'eslint.config.js'],
    languageOptions: {
      globals: nodeGlobals,
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },

  // ── Playwright test files ───────────────────────────────────────────────────
  {
    ...playwright.configs['flat/recommended'],
    files: ['tests/**/*.js'],
    plugins: { playwright },
    languageOptions: {
      globals: {
        ...nodeGlobals,
        ...browserGlobals, // tests use page.evaluate(() => window.xxx)
      },
    },
    rules: {
      // ── Errors — bugs ─────────────────────────────────────────────────────
      'playwright/missing-playwright-await': 'error',
      'playwright/no-focused-test': 'error',
      'playwright/no-page-pause': 'error',
      'playwright/valid-expect': 'error',
      'playwright/expect-expect': 'error',
      'playwright/no-useless-not': 'error',

      // ── Warnings — anti-patterns to improve over time ─────────────────────
      'playwright/no-wait-for-timeout': 'warn',
      'playwright/no-skipped-test': 'warn',
      'playwright/no-element-handle': 'warn',
      'playwright/prefer-web-first-assertions': 'warn',
      'playwright/no-get-by-title': 'warn',
      'playwright/no-raw-locators': 'off',

      // ── Style ─────────────────────────────────────────────────────────────
      'no-console': 'off',
      'no-empty-pattern': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },

  // ── Ignores ────────────────────────────────────────────────────────────────
  {
    ignores: [
      'node_modules/**',
      'playwright-report/**',
      'monocart-report/**',
      'test-results/**',
      'metrics-dashboard/**',
      'tests/visual/__snapshots__/**',
      'tests/components/**', // JSX files — linted by playwright-ct separately
    ],
  },
];

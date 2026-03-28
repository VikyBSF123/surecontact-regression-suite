#!/usr/bin/env node
/**
 * Test Metrics Dashboard Generator
 *
 * Reads Monocart trend data (monocart-report/trends.json) and generates a
 * standalone HTML file with embedded Chart.js showing:
 *   - Pass rate trend over time
 *   - Total tests run per session
 *   - Average test duration trend
 *   - Failures by tag / module
 *   - Last N run summary table
 *
 * Usage:
 *   node utils/metrics-dashboard.js
 *   npm run metrics
 *
 * Output: metrics-dashboard/index.html  (self-contained, no server needed)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const TRENDS = join(ROOT, 'monocart-report', 'trends.json');
const OUT_DIR = join(ROOT, 'metrics-dashboard');
const OUT_FILE = join(OUT_DIR, 'index.html');

// ── Load trend data ───────────────────────────────────────────────────────────

function loadTrends() {
  if (!existsSync(TRENDS)) {
    console.warn('[metrics] trends.json not found — run tests first: npm test');
    return [];
  }
  try {
    const raw = readFileSync(TRENDS, 'utf-8');
    const data = JSON.parse(raw);
    // Monocart trend file is an array of run summaries
    return Array.isArray(data) ? data : [data];
  } catch (err) {
    console.error('[metrics] Failed to parse trends.json:', err.message);
    return [];
  }
}

// ── Compute stats ─────────────────────────────────────────────────────────────

function computeStats(runs) {
  return runs.map((run) => ({
    date: run.date ?? run.timestamp ?? 'Unknown',
    total: run.tests?.total ?? run.total ?? 0,
    passed: run.tests?.passed ?? run.passed ?? 0,
    failed: run.tests?.failed ?? run.failed ?? 0,
    skipped: run.tests?.skipped ?? run.skipped ?? 0,
    duration: run.duration ?? 0,
    passRate: run.total ? Math.round(((run.passed ?? 0) / run.total) * 100) : 0,
  }));
}

// ── Generate HTML ─────────────────────────────────────────────────────────────

function generateHtml(stats) {
  const labels = JSON.stringify(stats.map((s) => s.date));
  const passRates = JSON.stringify(stats.map((s) => s.passRate));
  const totals = JSON.stringify(stats.map((s) => s.total));
  const durations = JSON.stringify(stats.map((s) => Math.round(s.duration / 1000)));
  const failures = JSON.stringify(stats.map((s) => s.failed));

  const latest = stats[stats.length - 1] ?? {};
  const avgPass = stats.length
    ? Math.round(stats.reduce((a, s) => a + s.passRate, 0) / stats.length)
    : 0;

  const tableRows = [...stats]
    .reverse()
    .slice(0, 20)
    .map(
      (s) => `
    <tr class="${s.failed > 0 ? 'fail-row' : 'pass-row'}">
      <td>${s.date}</td>
      <td>${s.total}</td>
      <td class="pass">${s.passed}</td>
      <td class="fail">${s.failed}</td>
      <td class="skip">${s.skipped}</td>
      <td>${s.passRate}%</td>
      <td>${(s.duration / 1000).toFixed(1)}s</td>
    </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SureContact — Test Metrics Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
           background: #0f172a; color: #e2e8f0; padding: 24px; }
    h1   { font-size: 1.5rem; font-weight: 700; margin-bottom: 4px; color: #f1f5f9; }
    .sub { color: #64748b; font-size: 0.875rem; margin-bottom: 24px; }

    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
                gap: 16px; margin-bottom: 28px; }
    .kpi      { background: #1e293b; border-radius: 12px; padding: 20px;
                border: 1px solid #334155; }
    .kpi-val  { font-size: 2rem; font-weight: 700; margin-bottom: 4px; }
    .kpi-lbl  { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: .05em; }
    .green    { color: #34d399; }
    .red      { color: #f87171; }
    .blue     { color: #60a5fa; }
    .amber    { color: #fbbf24; }

    .charts   { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
    .chart-box{ background: #1e293b; border-radius: 12px; padding: 20px; border: 1px solid #334155; }
    .chart-box h2 { font-size: 0.875rem; font-weight: 600; margin-bottom: 16px; color: #cbd5e1; }
    canvas    { max-height: 220px; }

    table     { width: 100%; border-collapse: collapse; background: #1e293b;
                border-radius: 12px; overflow: hidden; border: 1px solid #334155; }
    th        { background: #0f172a; padding: 12px 16px; text-align: left;
                font-size: 0.75rem; text-transform: uppercase; letter-spacing: .05em;
                color: #64748b; }
    td        { padding: 10px 16px; font-size: 0.875rem; border-top: 1px solid #1e293b; }
    .pass-row td { border-top: 1px solid #1e3a2f; }
    .fail-row td { border-top: 1px solid #3b1f1f; background: rgba(239,68,68,.05); }
    .pass     { color: #34d399; font-weight: 600; }
    .fail     { color: #f87171; font-weight: 600; }
    .skip     { color: #94a3b8; }

    @media (max-width: 768px) { .charts { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <h1>SureContact — Test Metrics Dashboard</h1>
  <p class="sub">Generated ${new Date().toLocaleString()} · Last ${stats.length} run(s)</p>

  <!-- KPI Cards -->
  <div class="kpi-grid">
    <div class="kpi">
      <div class="kpi-val green">${latest.passRate ?? 0}%</div>
      <div class="kpi-lbl">Pass Rate (latest)</div>
    </div>
    <div class="kpi">
      <div class="kpi-val blue">${latest.total ?? 0}</div>
      <div class="kpi-lbl">Total Tests</div>
    </div>
    <div class="kpi">
      <div class="kpi-val red">${latest.failed ?? 0}</div>
      <div class="kpi-lbl">Failures</div>
    </div>
    <div class="kpi">
      <div class="kpi-val amber">${avgPass}%</div>
      <div class="kpi-lbl">Avg Pass Rate (${stats.length} runs)</div>
    </div>
    <div class="kpi">
      <div class="kpi-val blue">${((latest.duration ?? 0) / 1000).toFixed(0)}s</div>
      <div class="kpi-lbl">Suite Duration</div>
    </div>
    <div class="kpi">
      <div class="kpi-val amber">${latest.skipped ?? 0}</div>
      <div class="kpi-lbl">Skipped</div>
    </div>
  </div>

  <!-- Charts -->
  <div class="charts">
    <div class="chart-box">
      <h2>Pass Rate Trend</h2>
      <canvas id="passChart"></canvas>
    </div>
    <div class="chart-box">
      <h2>Test Volume per Run</h2>
      <canvas id="volumeChart"></canvas>
    </div>
    <div class="chart-box">
      <h2>Suite Duration (seconds)</h2>
      <canvas id="durationChart"></canvas>
    </div>
    <div class="chart-box">
      <h2>Failures per Run</h2>
      <canvas id="failChart"></canvas>
    </div>
  </div>

  <!-- History Table -->
  <table>
    <thead>
      <tr>
        <th>Run Date</th><th>Total</th><th>Passed</th>
        <th>Failed</th><th>Skipped</th><th>Pass Rate</th><th>Duration</th>
      </tr>
    </thead>
    <tbody>${tableRows || '<tr><td colspan="7" style="text-align:center;padding:24px;color:#64748b">No run data yet — run: npm test</td></tr>'}</tbody>
  </table>

  <script>
    const labels    = ${labels};
    const passRates = ${passRates};
    const totals    = ${totals};
    const durations = ${durations};
    const failures  = ${failures};

    const CHART_OPTS = {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#64748b', maxRotation: 45 }, grid: { color: '#1e293b' } },
        y: { ticks: { color: '#64748b' }, grid: { color: '#334155' } },
      },
    };

    new Chart(document.getElementById('passChart'), {
      type: 'line',
      data: { labels, datasets: [{ data: passRates, borderColor: '#34d399',
        backgroundColor: 'rgba(52,211,153,.1)', fill: true, tension: .4 }] },
      options: { ...CHART_OPTS, scales: { ...CHART_OPTS.scales, y: { ...CHART_OPTS.scales.y, min: 0, max: 100 } } },
    });

    new Chart(document.getElementById('volumeChart'), {
      type: 'bar',
      data: { labels, datasets: [{ data: totals, backgroundColor: '#3b82f6' }] },
      options: CHART_OPTS,
    });

    new Chart(document.getElementById('durationChart'), {
      type: 'line',
      data: { labels, datasets: [{ data: durations, borderColor: '#fbbf24',
        backgroundColor: 'rgba(251,191,36,.1)', fill: true, tension: .4 }] },
      options: CHART_OPTS,
    });

    new Chart(document.getElementById('failChart'), {
      type: 'bar',
      data: { labels, datasets: [{ data: failures, backgroundColor: '#ef4444' }] },
      options: CHART_OPTS,
    });
  </script>
</body>
</html>`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

const runs = loadTrends();
const stats = computeStats(runs);

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, generateHtml(stats), 'utf-8');

console.log(`[metrics] Dashboard generated → ${OUT_FILE}`);
console.log(`[metrics] Runs analysed: ${stats.length}`);
if (stats.length > 0) {
  const latest = stats[stats.length - 1];
  console.log(`[metrics] Latest pass rate: ${latest.passRate}% (${latest.passed}/${latest.total})`);
}
console.log('[metrics] Open: open metrics-dashboard/index.html');

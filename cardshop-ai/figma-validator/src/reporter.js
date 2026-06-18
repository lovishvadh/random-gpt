/**
 * @param {import('./types.js').ValidationReport} report
 * @returns {string}
 */
export function renderHtmlReport(report) {
  const { summary, results, meta, generatedAt } = report;

  const sections = [
    { key: "fail", label: "Fail", results: results.filter((r) => r.status === "fail") },
    { key: "warn", label: "Warn", results: results.filter((r) => r.status === "warn") },
    { key: "pass", label: "Pass", results: results.filter((r) => r.status === "pass") },
  ];

  const sectionHtml = sections
    .map(
      (section) => `
    <section class="section section-${section.key}">
      <h2>${section.label} <span class="count">${section.results.length}</span></h2>
      ${
        section.results.length === 0
          ? `<p class="empty">No ${section.label.toLowerCase()} items.</p>`
          : section.results.map(renderResultCard).join("")
      }
    </section>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cardshop Figma Validator Report</title>
  <style>
    :root {
      --bg: #0f1419;
      --surface: #1a2332;
      --border: #2d3a4d;
      --text: #e7ecf3;
      --muted: #8b9cb3;
      --fail: #f87171;
      --warn: #fbbf24;
      --pass: #4ade80;
      --accent: #60a5fa;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 2rem;
    }
    h1 { margin: 0 0 0.5rem; font-size: 1.75rem; }
    .meta { color: var(--muted); font-size: 0.9rem; margin-bottom: 1.5rem; }
    .meta a { color: var(--accent); }
    .summary {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 1rem;
    }
    .stat .label { color: var(--muted); font-size: 0.85rem; }
    .stat .value { font-size: 1.75rem; font-weight: 700; margin-top: 0.25rem; }
    .stat.fail .value { color: var(--fail); }
    .stat.warn .value { color: var(--warn); }
    .stat.pass .value { color: var(--pass); }
    .section { margin-bottom: 2rem; }
    .section h2 { display: flex; align-items: center; gap: 0.5rem; }
    .count {
      font-size: 0.85rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 0.1rem 0.55rem;
      color: var(--muted);
    }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 1rem;
      margin-bottom: 0.75rem;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: flex-start;
      margin-bottom: 0.75rem;
    }
    .badge {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      padding: 0.15rem 0.5rem;
      border-radius: 6px;
      white-space: nowrap;
    }
    .badge.fail { background: rgba(248,113,113,0.15); color: var(--fail); }
    .badge.warn { background: rgba(251,191,36,0.15); color: var(--warn); }
    .badge.pass { background: rgba(74,222,128,0.15); color: var(--pass); }
    .text-block { margin: 0.25rem 0; }
    .label { color: var(--muted); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.04em; }
    .issues { margin-top: 0.75rem; }
    .issue {
      border-top: 1px solid var(--border);
      padding-top: 0.5rem;
      margin-top: 0.5rem;
      font-size: 0.92rem;
    }
    .issue-type { color: var(--accent); font-weight: 600; }
    .compare {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      margin-top: 0.35rem;
    }
    .compare div {
      background: rgba(0,0,0,0.2);
      border-radius: 6px;
      padding: 0.5rem 0.65rem;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.82rem;
      word-break: break-word;
    }
    .empty { color: var(--muted); }
    @media (max-width: 800px) {
      .summary { grid-template-columns: repeat(2, 1fr); }
      .compare { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <h1>Cardshop Figma Validator Report</h1>
  <div class="meta">
    Generated: ${escapeHtml(generatedAt)}<br />
    Figma: <a href="${escapeHtml(meta.figmaLink)}">${escapeHtml(meta.fileKey)} / ${escapeHtml(meta.nodeId)}</a><br />
    Page: <a href="${escapeHtml(meta.pageUrl)}">${escapeHtml(meta.pageUrl)}</a>
  </div>

  <div class="summary">
    <div class="stat"><div class="label">Total</div><div class="value">${summary.total}</div></div>
    <div class="stat fail"><div class="label">Fail</div><div class="value">${summary.fail}</div></div>
    <div class="stat warn"><div class="label">Warn</div><div class="value">${summary.warn}</div></div>
    <div class="stat pass"><div class="label">Pass</div><div class="value">${summary.pass}</div></div>
  </div>

  ${sectionHtml}
</body>
</html>`;
}

/**
 * @param {import('./types.js').ComparisonResult} result
 */
function renderResultCard(result) {
  const issuesHtml =
    result.issues.length === 0
      ? `<div class="issue"><span class="issue-type">ok</span> All checks passed.</div>`
      : result.issues
          .map(
            (issue) => `
      <div class="issue">
        <span class="issue-type">${escapeHtml(issue.type)}</span> (${issue.level}) — ${escapeHtml(issue.message)}
        <div class="compare">
          <div><span class="label">Figma</span><br />${escapeHtml(issue.figmaValue ?? "—")}</div>
          <div><span class="label">Page</span><br />${escapeHtml(issue.domValue ?? "—")}</div>
        </div>
      </div>`
          )
          .join("");

  return `
  <article class="card">
    <div class="card-header">
      <div>
        <div class="text-block"><span class="label">Figma layer</span><br />${escapeHtml(result.figmaName)}</div>
        <div class="text-block"><span class="label">Figma text</span><br />${escapeHtml(result.figmaText)}</div>
        <div class="text-block"><span class="label">Page text</span><br />${escapeHtml(result.domText ?? "— not found —")}</div>
        <div class="text-block"><span class="label">Match</span><br />${escapeHtml(result.matchType)}</div>
      </div>
      <span class="badge ${result.status}">${result.status}</span>
    </div>
    <div class="issues">${issuesHtml}</div>
  </article>`;
}

/**
 * @param {string} value
 */
function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * @param {import('./types.js').ComparisonResult[]} results
 * @param {import('./types.js').ValidationReport['meta']} meta
 * @returns {import('./types.js').ValidationReport}
 */
export function buildReport(results, meta) {
  const summary = {
    total: results.length,
    pass: results.filter((r) => r.status === "pass").length,
    warn: results.filter((r) => r.status === "warn").length,
    fail: results.filter((r) => r.status === "fail").length,
  };

  return {
    generatedAt: new Date().toISOString(),
    meta,
    summary,
    results,
  };
}

# Cardshop Figma Validator (Copilot-only)

Compare **Figma design** to **live Cardshop pages** using **GitHub Copilot as the runner**. Zero npm dependencies. **No Playwright. No Chromium.**

## How it works

```text
You (Copilot chat) → run CLI (Figma API) → bundle/
Copilot fetches page OR reads dom-snapshot.json → semantic triage → verdict
```

| Layer | Tool | Job |
|-------|------|-----|
| Figma data | Node CLI (`fetch`) | `figma-snapshot.json` |
| Live page | **Copilot fetch** or DevTools snippet | Page text + optional computed styles |
| Judgment | **Copilot** | Match by role/meaning, bug vs drift |

## Prerequisites

- Node.js 18+
- Figma personal access token (`FIGMA_TOKEN` env or `--token`)
- GitHub Copilot in VS Code
- **Cardshop Validate** chat mode (`.github/chatmodes/cardshop-validate.chatmode.md`)

No `npm install` required — the project has zero dependencies.

## Copilot workflow (recommended)

1. Select **Cardshop Validate** chat mode in VS Code
2. Paste **Figma link** + **page URL**
3. Ensure `FIGMA_TOKEN` is set in terminal
4. Copilot runs:

```bash
cd cardshop-ai/figma-validator
node src/index.js \
  --figma "<FIGMA_LINK>" \
  --token "$FIGMA_TOKEN" \
  --url "<PAGE_URL>" \
  --out bundle
```

5. Copilot reads `bundle/REVIEW.md` + `figma-snapshot.json`
6. Copilot **fetches the page URL** with its fetch tool (default path)
7. Copilot outputs: confirmed bugs, acceptable drift, needs-human, optional JIRA draft

## Optional: DevTools DOM extract (computed styles)

When you need font-size, color, weight, or JS-rendered content:

1. Open the page in corporate Chrome/Edge
2. DevTools → Console
3. Copy the snippet from `scripts/extract-dom-console.js` (between START/END)
4. Save output as `dom-snapshot.json`
5. Re-run CLI with `--dom-file`:

```bash
node src/index.js \
  --figma "..." --token "$FIGMA_TOKEN" --url "..." \
  --dom-file dom-snapshot.json --out bundle --report
```

This also writes `naive-findings.json` (baseline hints — Copilot still triages semantically).

## CLI options

| Flag | Description |
|------|-------------|
| `--figma <link>` | Figma URL with `?node-id=...` (required) |
| `--token <token>` | Figma token or `FIGMA_TOKEN` env (required) |
| `--url <url>` | Live page URL (required) |
| `--dom-file <path>` | Optional DevTools-exported DOM snapshot |
| `--report` | Also write `report.html` + `report.json` (requires `--dom-file`) |
| `--out <dir>` | Output directory (default: `.`) |

## Bundle output

| File | Always | Contents |
|------|--------|----------|
| `REVIEW.md` | Yes | Copilot task instructions |
| `figma-snapshot.json` | Yes | Figma text nodes + roles |
| `meta.json` | Yes | Links, frame width, counts |
| `dom-snapshot.json` | With `--dom-file` | Live DOM elements |
| `naive-findings.json` | With `--dom-file` | Baseline text-match hints |
| `report.html/json` | With `--report` | Visual report |

## What gets checked

**With Copilot fetch (default):** content comparison by semantic role (hero, CTA, benefits, disclosures).

**With dom-snapshot:** content + font-size, color, weight, dimensions (naive hints; Copilot triages).

**STRICT:** disclosures, APR, fees, terms, legal copy — always bug if wrong/missing.

## Project structure

```text
figma-validator/
  .github/chatmodes/cardshop-validate.chatmode.md   Primary Copilot entry
  scripts/extract-dom-console.js                    DevTools snippet
  src/
    index.js              CLI (Figma-only)
    figmaClient.js        Figma REST API
    loadDomFile.js        Read dom-snapshot.json
    reviewBundle.js       REVIEW.md generator
    matcher.js            Baseline text matching
    comparator.js         Design property diff
  test/
```

## Run tests

```bash
npm run test:unit
```

## Tuning tolerances

Edit `src/config.js` (used when `--dom-file` is provided).

## Known limitations

- Copilot fetch gets static HTML — may miss JS-rendered content (use DevTools extract)
- No pixel-perfect screenshot diff
- Figma token policy — confirm Amex allows API use on internal files

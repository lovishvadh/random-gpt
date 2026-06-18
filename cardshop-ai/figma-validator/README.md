# Cardshop Figma Validator

Compare **Figma design content and styles** against a **live rendered page**. Give it a Figma link, token, and public URL — it outputs `report.html` and `report.json`.

Built with **Node.js**, **Figma REST API**, and **Playwright** (headless Chromium). No MCP required — runs locally in VS Code.

## What it checks

| Check | Severity | Notes |
|-------|----------|-------|
| Text missing on page | **FAIL** | Figma copy not found in rendered DOM |
| Text differs (fuzzy match only) | WARN | Whitespace/case/punctuation difference |
| Font size | WARN | Tolerance: 1px (configurable) |
| Font weight | WARN | Tolerance: 100 (configurable) |
| Color | WARN | Compared after rgb/hex normalization |
| Width / height | WARN | 10% tolerance — responsive reflow, never FAIL |
| Ambiguous duplicate text | WARN | e.g. two "Apply now" buttons |

Pixel-perfect screenshot diffing is **out of scope**. This compares **properties**, not pixels.

## Prerequisites

- Node.js 18+
- Figma personal access token with access to the design file
- Public page URL (no login required for v1)

## Setup

```bash
cd cardshop-ai/figma-validator
npm install
npx playwright install chromium
```

Optional: copy `.env.example` to `.env` and set `FIGMA_TOKEN`.

## Usage

```bash
node src/index.js \
  --figma "https://www.figma.com/design/<FILE_KEY>/Cardshop?node-id=1234-5678" \
  --token "$FIGMA_TOKEN" \
  --url "https://www.americanexpress.com/au/credit-cards/platinum-card"
```

### Options

| Flag | Description |
|------|-------------|
| `--figma <link>` | Figma design URL with `?node-id=...` (required) |
| `--token <token>` | Figma token, or set `FIGMA_TOKEN` env (required) |
| `--url <url>` | Public page URL to validate (required) |
| `--wait-selector <css>` | Wait for a CSS selector before scraping (for JS-loaded content) |
| `--viewport-width <px>` | Browser width (default: Figma frame width, else 1440) |
| `--out <dir>` | Output directory for reports (default: current dir) |
| `--mode <report\|bundle>` | `report` = HTML/JSON (default); `bundle` = Copilot agent bundle |

### Outputs

**Report mode (default):**
- `report.html` — visual report grouped by FAIL / WARN / PASS
- `report.json` — same data for CI or automation

**Bundle mode (`--mode bundle`):**
- `REVIEW.md` — agent task file for Copilot semantic triage
- `figma-snapshot.json` — enriched Figma text nodes
- `dom-snapshot.json` — enriched live DOM nodes
- `naive-findings.json` — baseline text-match (hints only)

Exit code `1` if any FAIL items exist (report mode only).

## Run from Copilot (agent mode)

This is the recommended workflow when layouts differ and you want **AI to make smart matching decisions**.

### Setup once

1. Open this repo in VS Code with GitHub Copilot
2. Ensure `FIGMA_TOKEN` is set (or pass `--token`)
3. Select the **Cardshop Validate** custom chat mode (`.github/chatmodes/cardshop-validate.chatmode.md`)

### User flow

1. Paste **Figma link** + **page URL** (+ optional repo path) into Copilot chat
2. Copilot runs the bundle CLI in terminal (you approve the command):

```bash
cd cardshop-ai/figma-validator
node src/index.js --mode bundle \
  --figma "<FIGMA_LINK>" \
  --token "$FIGMA_TOKEN" \
  --url "<PAGE_URL>" \
  --out bundle
```

3. Copilot reads `bundle/REVIEW.md` + snapshot JSON files
4. Copilot performs **semantic matching** (by role + meaning, not pixel position)
5. Copilot returns:
   - **Confirmed bugs** (real content/compliance issues)
   - **Acceptable drift** (layout/responsive differences to ignore)
   - **Needs human review**
   - Optional **JIRA draft**

### Why two steps?

| Step | Who | Job |
|------|-----|-----|
| CLI (`--mode bundle`) | Deterministic code | Fetch Figma + scrape page → snapshots |
| Copilot agent | AI reasoning | Match across different layouts, triage bug vs drift |

No MCP or extra LLM API required — Copilot reads the on-disk bundle and reasons over it.


## Viewport guidance

Figma frames are usually designed at a fixed width (e.g. 1440px). Set `--viewport-width` to match the Figma frame, or let the tool read the frame width from the Figma API automatically. Mismatched viewports make dimension comparisons meaningless.

## How matching works

1. Fetch all `TEXT` nodes from the Figma frame via REST API.
2. Render the live page in Playwright and extract visible text + computed styles.
3. Match Figma ↔ DOM by **exact text**, then **normalized fuzzy text**.
4. Compare content and design properties on matched pairs.

Duplicate identical strings (e.g. two "Apply now" CTAs) are flagged as **ambiguous** rather than guessed wrong.

## Project structure

```text
figma-validator/
  .github/
    chatmodes/cardshop-validate.chatmode.md   Copilot agent mode
    copilot-instructions.md
  src/
    index.js           CLI entry point
    parseFigmaLink.js  Parse Figma URL → fileKey + nodeId
    figmaClient.js     Figma REST API (+ sectionPath, roleHint)
    domScraper.js      Playwright page scraper (+ selector, section)
    matcher.js         Text-based pairing (baseline)
    comparator.js      Content + design diff
    reporter.js        HTML + JSON reports
    reviewBundle.js    Copilot agent bundle (REVIEW.md)
    snapshot.js        Snapshot JSON writers
    config.js          Viewport and tolerances
  test/                Unit tests
```

## Run tests

```bash
npm run test:unit
```

## Known limitations

- **No pixel diff** — property comparison only.
- **Dimensions are noisy** — browser reflow differs from Figma bounding boxes; WARN only.
- **Duplicate text** — reduces match precision; future `data-figma-id` attributes would improve this.
- **Auth pages** — v1 supports public URLs only; login/SSO pages need Playwright auth (future).
- **Figma token policy** — confirm Amex allows Figma API use on internal design files.

## Tuning tolerances

Edit `src/config.js`:

```js
tolerances: {
  fontSizePx: 1,
  fontWeight: 100,
  dimensionPct: 10,
}
```

## Example workflow (Cardshop)

1. Designer shares Figma frame link for AU Platinum card page.
2. Dev runs validator against staging or production URL.
3. Review `report.html` for missing benefits text (FAIL) or font-size drift (WARN).
4. Fix content in CMS or styles in code; re-run until FAIL count is zero.

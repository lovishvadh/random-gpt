# Cardshop AI — Copilot instructions

This repo contains tools for the **Cardshop** team at American Express.

## Figma Validator (`figma-validator/`)

Compares Figma design frames to live Cardshop pages.

### Two modes

| Mode | Command | Output |
|------|---------|--------|
| **report** (default) | `node src/index.js --figma ... --token ... --url ...` | `report.html`, `report.json` |
| **bundle** (Copilot agent) | `node src/index.js --mode bundle --out bundle ...` | `REVIEW.md`, snapshots, naive findings |

### Copilot agent workflow

1. User selects **Cardshop Validate** chat mode (`.github/chatmodes/cardshop-validate.chatmode.md`)
2. Agent runs bundle CLI in terminal
3. Agent reads `bundle/REVIEW.md` + JSON snapshots
4. Agent performs semantic matching and triage (bug vs acceptable drift)

### Key files

- CLI entry: `figma-validator/src/index.js`
- Tolerances: `figma-validator/src/config.js`
- Figma extraction: `figma-validator/src/figmaClient.js` (`sectionPath`, `roleHint`)
- DOM scraping: `figma-validator/src/domScraper.js` (Playwright)
- Agent bundle: `figma-validator/src/reviewBundle.js`

### Environment

- `FIGMA_TOKEN` — Figma personal access token (or `--token` flag)
- Node 18+, Playwright Chromium (`npx playwright install chromium`)

### Other capabilities in this repo

- `custom-gpt/` — Cardshop Market Guide (registry + Confluence knowledge)
- `foundations/` — markets registry and aqx catalog schemas

## Guardrails

- Never auto-publish card terms, APR, or legal copy
- Naive findings are hints; Copilot must reason before calling something a bug
- No MCP required — agent uses terminal + on-disk bundle

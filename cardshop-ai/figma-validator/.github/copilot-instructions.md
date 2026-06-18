# Cardshop AI — Copilot instructions

This repo contains **Copilot-driven** tools for the Cardshop team.

## Figma Validator (`figma-validator/`)

Compares Figma design frames to live Cardshop pages. **Zero npm dependencies. No browser automation in Node.**

### Architecture

| Layer | Who | Job |
|-------|-----|-----|
| CLI | Node script | Figma REST API → `figma-snapshot.json` + `REVIEW.md` |
| Page capture | **Copilot** (fetch) or DevTools snippet | Live page content |
| Judgment | **Copilot** | Semantic match, bug vs drift triage |

### Primary entrypoint

Select **Cardshop Validate** chat mode (`.github/chatmodes/cardshop-validate.chatmode.md`).

### CLI command

```bash
cd cardshop-ai/figma-validator
node src/index.js \
  --figma "<FIGMA_LINK>" \
  --token "$FIGMA_TOKEN" \
  --url "<PAGE_URL>" \
  --out bundle
```

Optional: `--dom-file dom-snapshot.json --report` for DevTools-extracted DOM with computed styles.

### Key files

- CLI: `figma-validator/src/index.js`
- DevTools extract: `figma-validator/scripts/extract-dom-console.js`
- Tolerances: `figma-validator/src/config.js`
- Figma extraction: `figma-validator/src/figmaClient.js`
- Bundle generator: `figma-validator/src/reviewBundle.js`

### Environment

- `FIGMA_TOKEN` — Figma personal access token (or `--token` flag)
- Node 18+ only — no `npm install` required (zero dependencies)

### Other capabilities

- `custom-gpt/` — Cardshop Market Guide
- `foundations/` — markets registry and aqx catalog schemas

## Guardrails

- Never use Playwright/Chromium
- Copilot must run CLI before claiming validation
- Naive findings are hints; Copilot reasons before calling something a bug
- STRICT on legal/APR/disclosure copy
